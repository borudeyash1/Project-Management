import { Response } from 'express';
import mongoose, { Types } from 'mongoose';

import Team from '../models/Team';
import Workspace from '../models/Workspace';
import { AuthenticatedRequest, ApiResponse, ITeam } from '../types';

const populateTeam = (query: mongoose.Query<any, any>) =>
  query
    .populate('leader', 'fullName email avatarUrl')
    .populate('members.user', 'fullName email avatarUrl department profile.jobTitle');

const ensureWorkspaceAccess = async (
  workspaceId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId | string,
  allowedRoles: Array<'owner' | 'admin' | 'manager' | 'member'> = ['owner', 'admin', 'manager', 'member'],
) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new Error('Workspace not found');
  }

  const member = workspace.members.find((m: any) => m.user?.toString() === userId.toString());

  if (!member) {
    throw new Error('Access denied: not a member of this workspace');
  }

  if (!allowedRoles.includes(member.role as any)) {
    throw new Error('Access denied: insufficient workspace role');
  }

  return workspace;
};

const ensureTeamAccess = async (
  teamId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId | string,
  options: { allowWorkspaceAdmins?: boolean; allowedTeamRoles?: string[] } = {},
): Promise<ITeam & { workspace: Types.ObjectId }> => {
  if (!teamId) {
    throw new Error('Team ID is required');
  }

  const doc = await populateTeam(Team.findById(teamId)).exec();
  if (!doc) {
    throw new Error('Team not found');
  }
  const team = doc.toObject ? doc.toObject() : doc;

  const member = (team.members || []).find((m: any) => m.user?._id?.toString() === userId.toString());

  if (member) {
    if (options.allowedTeamRoles && !options.allowedTeamRoles.includes(member.role)) {
      throw new Error('Access denied: insufficient team role');
    }
    return team;
  }

  if (options.allowWorkspaceAdmins) {
    await ensureWorkspaceAccess(team.workspace, userId, ['owner', 'admin']);
    return team;
  }

  throw new Error('Access denied: not part of this team');
};

export const getTeams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { workspaceId } = req.query;

    const query: Record<string, any> = {};

    if (workspaceId) {
      const workspaceOid = new Types.ObjectId(workspaceId as string);
      query.workspace = workspaceOid;
      await ensureWorkspaceAccess(workspaceOid, userId);
    } else {
      query.$or = [{ leader: userId }, { 'members.user': userId }];
    }

    const docTeams = await populateTeam(Team.find(query).sort({ createdAt: -1 })).exec();
    const teams = docTeams.map((doc: any) => (doc.toObject ? doc.toObject() : doc)) as ITeam[];

    const response: ApiResponse<ITeam[]> = {
      success: true,
      message: 'Teams retrieved successfully',
      data: teams,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Team] getTeams error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch teams' });
  }
};

export const createTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { name, description, workspaceId, leaderId, members = [], skills = [] } = req.body;

    if (!workspaceId) {
      throw new Error('workspaceId is required');
    }

    await ensureWorkspaceAccess(new Types.ObjectId(workspaceId), userId, ['owner', 'admin', 'manager']);

    const leader = leaderId || userId;

    const uniqueMembers = new Map<string, any>();
    [...members, { user: leader, role: 'leader' }]?.forEach((member: any) => {
      if (!member?.user) return;
      uniqueMembers.set(member.user.toString(), {
        user: member.user,
        role: member.role || 'member',
        status: member.status || 'active',
        joinedAt: member.joinedAt || new Date(),
      });
    });

    const createdTeam = await Team.create({
      name,
      description,
      workspace: workspaceId,
      leader,
      members: Array.from(uniqueMembers.values()),
      skills,
    });

    const populatedTeamDoc = await populateTeam(Team.findById(createdTeam._id)).exec();
    if (!populatedTeamDoc) {
      throw new Error('Failed to load created team');
    }
    const team = populatedTeamDoc.toObject() as ITeam;

    const response: ApiResponse<ITeam> = {
      success: true,
      message: 'Team created successfully',
      data: team as ITeam,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('[Team] createTeam error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create team' });
  }
};

export const getTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id = '' } = req.params;

    if (!id) {
      throw new Error('Team ID is required');
    }
    const teamId = new Types.ObjectId(id);
    const team = await ensureTeamAccess(teamId, userId, { allowWorkspaceAdmins: true });

    const response: ApiResponse<ITeam> = {
      success: true,
      message: 'Team retrieved successfully',
      data: team,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Team] getTeam error:', error);
    res.status(404).json({ success: false, message: error.message || 'Team not found' });
  }
};

export const updateTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id = '' } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new Error('Team ID is required');
    }
    const teamId = new Types.ObjectId(id);
    await ensureTeamAccess(teamId, userId, {
      allowWorkspaceAdmins: true,
      allowedTeamRoles: ['leader'],
    });

    const updatedTeamDoc = await populateTeam(Team.findByIdAndUpdate(id, updateData, { new: true })).exec();
    if (!updatedTeamDoc) {
      throw new Error('Team not found after update');
    }
    const updatedTeam = updatedTeamDoc.toObject() as ITeam;

    const response: ApiResponse<ITeam> = {
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Team] updateTeam error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update team' });
  }
};

export const deleteTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id = '' } = req.params;

    if (!id) {
      throw new Error('Team ID is required');
    }
    const teamId = new Types.ObjectId(id);
    await ensureTeamAccess(teamId, userId, {
      allowWorkspaceAdmins: true,
      allowedTeamRoles: ['leader'],
    });

    await Team.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Team deleted successfully' });
  } catch (error: any) {
    console.error('[Team] deleteTeam error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to delete team' });
  }
};

export const addTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    if (!id) {
      throw new Error('Team ID is required');
    }
    const { memberId, role = 'member', status = 'active' } = req.body;

    if (!id) {
      throw new Error('Team ID is required');
    }
    const teamId = new Types.ObjectId(id);
    const team = await ensureTeamAccess(teamId, userId, {
      allowWorkspaceAdmins: true,
      allowedTeamRoles: ['leader', 'senior'],
    });

    const workspace = await Workspace.findById(team.workspace);
    const workspaceMember = workspace?.members.find((m: any) => m.user.toString() === memberId);

    if (!workspaceMember) {
      throw new Error('User is not part of the workspace');
    }

    const existing = (team.members || []).find((m: any) => m.user.toString() === memberId);
    if (existing) {
      existing.role = role;
      existing.status = status;
    } else {
      (team.members as any[]).push({
        user: memberId,
        role,
        status,
        joinedAt: new Date(),
      });
    }

    await Team.updateOne({ _id: team._id }, { members: team.members });
    const hydratedDoc = await populateTeam(Team.findById(team._id)).exec();
    if (!hydratedDoc) {
      throw new Error('Failed to load team after member update');
    }
    const hydrated = hydratedDoc.toObject() as ITeam;

    const response: ApiResponse<ITeam> = {
      success: true,
      message: 'Member added successfully',
      data: hydrated as ITeam,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Team] addMember error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to add member' });
  }
};

export const updateTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id, memberId } = req.params;
    if (!id) {
      throw new Error('Team ID is required');
    }
    const { role, status } = req.body;

    const teamId = new Types.ObjectId(id);
    const team = await ensureTeamAccess(teamId, userId, {
      allowWorkspaceAdmins: true,
      allowedTeamRoles: ['leader', 'senior'],
    });

    const member = (team.members || []).find((m: any) => m.user.toString() === memberId);
    if (!member) {
      throw new Error('Member not found in team');
    }

    if (role) member.role = role;
    if (status) member.status = status;

    await Team.updateOne({ _id: team._id }, { members: team.members });
    const hydratedDoc = await populateTeam(Team.findById(team._id)).exec();
    if (!hydratedDoc) {
      throw new Error('Failed to load team after member update');
    }
    const hydrated = hydratedDoc.toObject() as ITeam;

    const response: ApiResponse<ITeam> = {
      success: true,
      message: 'Member updated successfully',
      data: hydrated as ITeam,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Team] updateMember error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update member' });
  }
};

export const removeTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id, memberId } = req.params;
    if (!id) {
      throw new Error('Team ID is required');
    }

    const teamId = new Types.ObjectId(id);
    const team = await ensureTeamAccess(teamId, userId, {
      allowWorkspaceAdmins: true,
      allowedTeamRoles: ['leader'],
    });

    const filteredMembers = (team.members || []).filter((m: any) => m.user.toString() !== memberId);
    await Team.updateOne({ _id: team._id }, { members: filteredMembers });
    const hydrated = (await populateTeam(Team.findById(team._id)))?.toObject() as ITeam;

    const response: ApiResponse<ITeam> = {
      success: true,
      message: 'Member removed successfully',
      data: hydrated as ITeam,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Team] removeMember error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to remove member' });
  }
};

export const getTeamStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    if (!id) {
      throw new Error('Team ID is required');
    }
    const teamId = new Types.ObjectId(id);
    const team = await ensureTeamAccess(teamId, userId, { allowWorkspaceAdmins: true });

    const members = team.members || [];
    const stats = {
      totalMembers: members.length,
      activeMembers: members.filter((m: any) => m.status === 'active').length,
      inactiveMembers: members.filter((m: any) => m.status === 'inactive').length,
      roles: members.reduce<Record<string, number>>((acc: Record<string, number>, member: any) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    res.status(200).json({ success: true, message: 'Team stats retrieved', data: stats });
  } catch (error: any) {
    console.error('[Team] stats error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch stats' });
  }
};
