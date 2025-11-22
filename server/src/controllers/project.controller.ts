import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Project, IProject } from '../models/project.model';
import { User } from '../models/user.model';
import { Team } from '../models/team.model';
import { validationResult } from 'express-validator';

export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, status, priority, team, budget, client, tags } = req.body;

    // Check if manager exists and is authorized
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const manager = await User.findById(req.user.id);
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
      manager: req.user.id,
      team,
      progress: 0,
      budget,
      client,
      tags: tags || []
    });

    await project.save();

    // Add project to team's projects
    teamExists.projects.push(project._id as any);
    await teamExists.save();

    return res.status(201).json(project);
  } catch (error: any) {
    console.error('Error creating project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, team, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (team) query.team = team;

    // Check user role
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = await User.findById(req.user.id);
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
    console.error('Error fetching projects:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email avatar')
      .populate('team', 'name members')
      .populate('team.members', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = await User.findById(req.user.id);
    if (user?.role === 'member' &&
      !user.teams.includes(project.team._id) &&
      project.manager._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    return res.json(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
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
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = await User.findById(req.user.id);
    if (user?.role !== 'admin' && project.manager.toString() !== req.user.id) {
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

      project.team = team;
    }

    await project.save();

    return res.json(project);
  } catch (error: any) {
    console.error('Error updating project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is authorized to delete this project
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = await User.findById(req.user.id);
    if (user?.role !== 'admin' && project.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Remove project from team's projects array
    await Team.findByIdAndUpdate(project.team, {
      $pull: { projects: project._id }
    });

    // TODO: Delete associated tasks, milestones, etc.

    await project.deleteOne();

    return res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
