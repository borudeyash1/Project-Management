import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import Expense from '../models/Expense';
import Project from '../models/Project';
import Workspace from '../models/Workspace';

// Create a new expense
export const createExpense = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { project, title, amount, currency, category, date, description } = req.body;
        const userId = req.user._id;

        // Validate project exists
        const projectDoc = await Project.findById(project);
        if (!projectDoc) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if user is a member of the project
        const isMember = projectDoc.teamMembers.some(
            (member: any) => member.user.toString() === userId.toString()
        );
        const isCreator = projectDoc.createdBy.toString() === userId.toString();

        if (!isMember && !isCreator) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to add expenses to this project'
            });
        }

        // Create expense
        const expense = await Expense.create({
            project,
            workspace: projectDoc.workspace,
            title,
            amount,
            currency: currency || 'INR',
            category,
            date: date || new Date(),
            description,
            createdBy: userId,
            status: 'pending'
        });

        await expense.populate('createdBy', 'fullName email avatarUrl');

        return res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense
        });
    } catch (error: any) {
        console.error('Error creating expense:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create expense',
            error: error.message
        });
    }
};

// Get all expenses for a project
export const getProjectExpenses = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const { status, category, startDate, endDate } = req.query;

        // Build query
        const query: any = { project: projectId, isActive: true };

        if (status) {
            query.status = status;
        }

        if (category) {
            query.category = category;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate as string);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate as string);
            }
        }

        const expenses = await Expense.find(query)
            .populate('createdBy', 'fullName email avatarUrl')
            .populate('approvedBy', 'fullName email')
            .populate('rejectedBy', 'fullName email')
            .sort({ date: -1 });

        // Calculate totals
        const totals = {
            total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
            approved: expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0),
            pending: expenses.filter(exp => exp.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0),
            rejected: expenses.filter(exp => exp.status === 'rejected').reduce((sum, exp) => sum + exp.amount, 0)
        };

        return res.json({
            success: true,
            data: expenses,
            totals
        });
    } catch (error: any) {
        console.error('Error fetching project expenses:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch expenses',
            error: error.message
        });
    }
};

// Get workspace expenses overview
export const getWorkspaceExpenses = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const { startDate, endDate } = req.query;

        // Build query
        const query: any = { workspace: workspaceId, isActive: true };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate as string);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate as string);
            }
        }

        // Get all expenses for the workspace
        const expenses = await Expense.find(query)
            .populate('project', 'name')
            .populate('createdBy', 'fullName email')
            .sort({ date: -1 });

        // Get all projects in workspace
        const projects = await Project.find({ workspace: workspaceId, isActive: true });

        // Calculate project-wise breakdown
        const projectBreakdown = projects.map(project => {
            const projectExpenses = expenses.filter(
                exp => exp.project.toString() === project._id.toString()
            );

            const approvedExpenses = projectExpenses.filter(exp => exp.status === 'approved');
            const totalSpent = approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

            const budgetAmount = typeof project.budget === 'object' && project.budget
                ? (project.budget as any).amount || 0
                : (typeof project.budget === 'number' ? project.budget : 0);

            return {
                projectId: project._id,
                projectName: project.name,
                budget: budgetAmount,
                spent: totalSpent,
                remaining: budgetAmount - totalSpent,
                utilizationPercentage: budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0,
                expenseCount: projectExpenses.length
            };
        });

        // Calculate category-wise breakdown
        const categoryBreakdown = expenses.reduce((acc: any, exp) => {
            if (exp.status === 'approved') {
                if (!acc[exp.category]) {
                    acc[exp.category] = 0;
                }
                acc[exp.category] += exp.amount;
            }
            return acc;
        }, {});

        // Calculate overall totals
        const totals = {
            totalBudget: projectBreakdown.reduce((sum, p) => sum + p.budget, 0),
            totalSpent: projectBreakdown.reduce((sum, p) => sum + p.spent, 0),
            totalRemaining: projectBreakdown.reduce((sum, p) => sum + p.remaining, 0),
            totalExpenses: expenses.length,
            approvedExpenses: expenses.filter(exp => exp.status === 'approved').length,
            pendingExpenses: expenses.filter(exp => exp.status === 'pending').length
        };

        return res.json({
            success: true,
            data: {
                projectBreakdown,
                categoryBreakdown,
                totals,
                recentExpenses: expenses.slice(0, 10)
            }
        });
    } catch (error: any) {
        console.error('Error fetching workspace expenses:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch workspace expenses',
            error: error.message
        });
    }
};

// Update expense
export const updateExpense = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, amount, currency, category, date, description } = req.body;
        const userId = req.user._id;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Only creator can update pending expenses
        if (expense.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own expenses'
            });
        }

        // Cannot update approved or rejected expenses
        if (expense.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot update ${expense.status} expenses`
            });
        }

        // Update fields
        if (title) expense.title = title;
        if (amount !== undefined) expense.amount = amount;
        if (currency) expense.currency = currency;
        if (category) expense.category = category;
        if (date) expense.date = new Date(date);
        if (description !== undefined) expense.description = description;

        await expense.save();
        await expense.populate('createdBy', 'fullName email avatarUrl');

        return res.json({
            success: true,
            message: 'Expense updated successfully',
            data: expense
        });
    } catch (error: any) {
        console.error('Error updating expense:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update expense',
            error: error.message
        });
    }
};

// Delete expense
export const deleteExpense = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Only creator can delete their own expenses, or project managers can delete any
        const project = await Project.findById(expense.project);
        const isCreator = expense.createdBy.toString() === userId.toString();
        const isProjectManager = project?.teamMembers.some(
            (member: any) => member.user.toString() === userId.toString() &&
                (member.role === 'project-manager' || member.permissions?.canManageProject)
        );

        if (!isCreator && !isProjectManager) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this expense'
            });
        }

        // If expense was approved, we need to recalculate project budget
        const wasApproved = expense.status === 'approved';

        // Soft delete
        expense.isActive = false;
        await expense.save();

        // Recalculate project budget if the deleted expense was approved
        if (wasApproved && project) {
            const approvedExpenses = await Expense.find({
                project: project._id,
                status: 'approved',
                isActive: true
            });

            const totalSpent = approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

            if (typeof project.budget === 'object' && project.budget) {
                (project.budget as any).spent = totalSpent;
            }
            await project.save();
        }

        return res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting expense:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete expense',
            error: error.message
        });
    }
};

// Approve expense
export const approveExpense = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Check if user is project manager or workspace owner
        const project = await Project.findById(expense.project);
        const workspace = await Workspace.findById(expense.workspace);

        const isProjectManager = project?.teamMembers.some(
            (member: any) => member.user.toString() === userId.toString() &&
                (member.role === 'project-manager' || member.permissions?.canManageProject)
        );
        const isWorkspaceOwner = workspace?.owner.toString() === userId.toString();
        const isProjectCreator = project?.createdBy.toString() === userId.toString();

        if (!isProjectManager && !isWorkspaceOwner && !isProjectCreator) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to approve expenses'
            });
        }

        if (expense.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Expense is already ${expense.status}`
            });
        }

        await expense.approve(userId);

        // Update project budget spent
        if (project) {
            const approvedExpenses = await Expense.find({
                project: project._id,
                status: 'approved',
                isActive: true
            });

            const totalSpent = approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

            if (typeof project.budget === 'object' && project.budget) {
                (project.budget as any).spent = totalSpent;
            }
            await project.save();
        }

        await expense.populate('createdBy', 'fullName email avatarUrl');
        await expense.populate('approvedBy', 'fullName email');

        return res.json({
            success: true,
            message: 'Expense approved successfully',
            data: expense
        });
    } catch (error: any) {
        console.error('Error approving expense:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to approve expense',
            error: error.message
        });
    }
};

// Reject expense
export const rejectExpense = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Check if user is project manager or workspace owner
        const project = await Project.findById(expense.project);
        const workspace = await Workspace.findById(expense.workspace);

        const isProjectManager = project?.teamMembers.some(
            (member: any) => member.user.toString() === userId.toString() &&
                (member.role === 'project-manager' || member.permissions?.canManageProject)
        );
        const isWorkspaceOwner = workspace?.owner.toString() === userId.toString();
        const isProjectCreator = project?.createdBy.toString() === userId.toString();

        if (!isProjectManager && !isWorkspaceOwner && !isProjectCreator) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to reject expenses'
            });
        }

        // Store if expense was previously approved (edge case: if someone tries to reject an approved expense)
        const wasApproved = expense.status === 'approved';

        if (expense.status !== 'pending' && expense.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: `Expense is already ${expense.status}`
            });
        }

        await expense.reject(userId, reason);

        // Recalculate project budget if the rejected expense was previously approved
        if (wasApproved && project) {
            const approvedExpenses = await Expense.find({
                project: project._id,
                status: 'approved',
                isActive: true
            });

            const totalSpent = approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

            if (typeof project.budget === 'object' && project.budget) {
                (project.budget as any).spent = totalSpent;
            }
            await project.save();
        }

        await expense.populate('createdBy', 'fullName email avatarUrl');
        await expense.populate('rejectedBy', 'fullName email');

        return res.json({
            success: true,
            message: 'Expense rejected successfully',
            data: expense
        });
    } catch (error: any) {
        console.error('Error rejecting expense:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reject expense',
            error: error.message
        });
    }
};
