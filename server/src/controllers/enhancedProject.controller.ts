// @ts-nocheck
import { Request, Response } from 'express';
import { Project, IProject } from '../models/project.model';
import { User } from '../models/user.model';
import { Team } from '../models/team.model';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        teams: Types.ObjectId[];
      };
    }
  }
}

// Create a new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, status, priority, team, budget, client, tags } = req.body;
    
    // Check if manager exists and is authorized
    const manager = await User.findById(req.user?.id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Check if team exists
    const teamExists = await Team.findById(team);
    if (!teamExists) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      status: status || 'planning',
      priority: priority || 'medium',
      manager: req.user?.id,
      team,
      progress: 0,
      budget,
      client,
      tags: tags || []
    });

    await project.save();
    
    // Add project to team's projects
    teamExists.projects.push(project._id);
    await teamExists.save();

    return res.status(201).json(project);
  } catch (error: any) {
    console.error('Error creating project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all projects with filtering and pagination
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { status, priority, team, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (team) query.team = team;
    
    // Check user role
    const user = await User.findById(req.user?.id);
    if (user?.role === 'member') {
      // Members can only see projects they're part of
      query.$or = [
        { team: { $in: user.teams } },
        { manager: user._id }
      ];
    }
    
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort,
      populate: [
        { path: 'manager', select: 'name email avatar' },
        { path: 'team', select: 'name' }
      ]
    };
    
    const projects = await Project.paginate(query, options);
    
    return res.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single project by ID
export const getProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email avatar')
      .populate({
        path: 'team',
        select: 'name members',
        populate: {
          path: 'members',
          select: 'name email avatar'
        }
      });
      
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user has access to this project
    const user = await User.findById(req.user?.id);
    if (user?.role === 'member' && 
        !user.teams.some(teamId => teamId.toString() === project.team._id.toString()) && 
        project.manager._id.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }
    
    return res.json(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description, status, priority, progress, team, budget, client, tags } = req.body;
    
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is authorized to update this project
    const user = await User.findById(req.user?.id);
    if (user?.role !== 'admin' && project.manager.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    // Update project fields
    project.name = name || project.name;
    project.description = description || project.description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (progress !== undefined) project.progress = progress;
    if (budget !== undefined) project.budget = budget;
    if (client !== undefined) project.client = client;
    if (tags) project.tags = tags;
    
    // Handle team change
    if (team && team !== project.team.toString()) {
      // Remove project from old team
      await Team.findByIdAndUpdate(project.team, {
        $pull: { projects: project._id }
      });
      
      // Add project to new team
      await Team.findByIdAndUpdate(team, {
        $addToSet: { projects: project._id }
      });
      
      project.team = new Types.ObjectId(team);
    }
    
    await project.save();
    
    return res.json(project);
  } catch (error: any) {
    console.error('Error updating project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is authorized to delete this project
    const user = await User.findById(req.user?.id);
    if (user?.role !== 'admin' && project.manager.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    // Remove project from team's projects array
    await Team.findByIdAndUpdate(project.team, {
      $pull: { projects: project._id }
    });
    
    // TODO: Delete associated tasks, milestones, etc.
    
    await Project.findByIdAndDelete(project._id);
    
    return res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get project statistics
export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalProjects: { $sum: 1 },
          avgProgress: { $avg: '$progress' },
          totalBudget: { $sum: '$budget' }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          percentage: {
            $multiply: [
              { $divide: ['$count', '$totalProjects'] },
              100
            ]
          },
          avgProgress: 1,
          totalBudget: 1
        }
      }
    ]);
    
    return res.json(stats);
  } catch (error: any) {
    console.error('Error fetching project stats:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get projects by workspace
export const getWorkspaceProjects = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query: any = { workspace: workspaceId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // Check user role
    const user = await User.findById(req.user?.id);
    if (user?.role === 'member') {
      // Members can only see projects they're part of
      query.$or = [
        { team: { $in: user.teams } },
        { manager: user._id }
      ];
    }
    
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const projects = await Project.find(query)
      .populate('manager', 'name email avatar')
      .populate('team', 'name')
      .sort(sort);
      
    return res.json(projects);
  } catch (error: any) {
    console.error('Error fetching workspace projects:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add member to project
export const addMember = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is authorized to add members
    const user = await User.findById(req.user?.id);
    if (user?.role !== 'admin' && project.manager.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to add members to this project' });
    }
    
    // Check if user exists and is part of the team
    const team = await Team.findById(project.team);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!team.members.some(memberId => memberId.toString() === userId)) {
      return res.status(400).json({ message: 'User is not a member of the project team' });
    }
    
    // Add user to project members
    if (!project.members) {
      project.members = [];
    }
    
    // Check if user is already a member
    const existingMemberIndex = project.members.findIndex(member => 
      member.user.toString() === userId
    );
    
    if (existingMemberIndex >= 0) {
      // Update role if already a member
      project.members[existingMemberIndex].role = role;
    } else {
      // Add new member
      project.members.push({
        user: new Types.ObjectId(userId),
        role,
        joinedAt: new Date()
      });
    }
    
    await project.save();
    
    return res.json({ message: 'Member added successfully', project });
  } catch (error: any) {
    console.error('Error adding member to project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove member from project
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { projectId, memberId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is authorized to remove members
    const user = await User.findById(req.user?.id);
    if (user?.role !== 'admin' && project.manager.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to remove members from this project' });
    }
    
    // Check if member exists in project
    if (!project.members || !project.members.some(member => member.user.toString() === memberId)) {
      return res.status(404).json({ message: 'Member not found in project' });
    }
    
    // Remove member from project
    project.members = project.members.filter(member => member.user.toString() !== memberId);
    await project.save();
    
    return res.json({ message: 'Member removed successfully', project });
  } catch (error: any) {
    console.error('Error removing member from project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update member role in project
export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is authorized to update member roles
    const user = await User.findById(req.user?.id);
    if (user?.role !== 'admin' && project.manager.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to update member roles in this project' });
    }
    
    // Check if member exists in project
    const memberIndex = project.members?.findIndex(member => member.user.toString() === memberId);
    if (!project.members || memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in project' });
    }
    
    // Update member role
    if (project.members[memberIndex]) {
      project.members[memberIndex].role = role;
      await project.save();
      return res.json({ message: 'Member role updated successfully', project });
    }
    
    return res.status(404).json({ message: 'Member not found in project' });
  } catch (error: any) {
    console.error('Error updating member role:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
