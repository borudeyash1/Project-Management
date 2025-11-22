import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

interface WorkspaceMember {
  user: {
    _id: string;
    fullName: string;
    email: string;
  } | string;
  role: string;
  permissions?: {
    canManageMembers?: boolean;
    canManageProjects?: boolean;
    canManageClients?: boolean;
    canUpdateWorkspaceDetails?: boolean;
    canManageCollaborators?: boolean;
    canManageInternalProjectSettings?: boolean;
    canAccessProjectManagerTabs?: boolean;
  };
  status: string;
}

interface Workspace {
  _id: string;
  name: string;
  owner: string;
  members?: WorkspaceMember[];
}

/**
 * Custom hook to check workspace permissions
 * @param workspaceId - The workspace ID to check permissions for
 */
export const useWorkspacePermissions = (workspaceId?: string) => {
  const { state } = useApp();

  const workspace = useMemo(() => {
    if (!workspaceId) return null;
    return state.workspaces.find((w: Workspace) => w._id === workspaceId);
  }, [state.workspaces, workspaceId]);

  const currentUserId = state.userProfile?._id;

  const isOwner = useMemo(() => {
    if (!workspace || !currentUserId) return false;
    return workspace.owner === currentUserId;
  }, [workspace, currentUserId]);

  const currentMember = useMemo(() => {
    if (!workspace || !currentUserId) return null;
    
    return workspace.members?.find((m: WorkspaceMember) => {
      const userId = typeof m.user === 'string' ? m.user : m.user._id;
      return userId === currentUserId && m.status === 'active';
    });
  }, [workspace, currentUserId]);

  /**
   * Check if current user has a specific permission
   * @param permission - The permission to check
   */
  const hasPermission = (permission: string): boolean => {
    // Owner has all permissions
    if (isOwner) return true;

    // Not a member
    if (!currentMember) return false;

    // Check specific permission
    return currentMember.permissions?.[permission as keyof typeof currentMember.permissions] || false;
  };

  /**
   * Check if current user is a workspace member
   */
  const isMember = useMemo(() => {
    return isOwner || !!currentMember;
  }, [isOwner, currentMember]);

  /**
   * Check if current user is a collaborator (admin or manager)
   */
  const isCollaborator = useMemo(() => {
    if (isOwner) return true;
    if (!currentMember) return false;
    return currentMember.role === 'admin' || currentMember.role === 'manager';
  }, [isOwner, currentMember]);

  /**
   * Get current user's role in workspace
   */
  const role = useMemo(() => {
    if (isOwner) return 'owner';
    return currentMember?.role || 'none';
  }, [isOwner, currentMember]);

  /**
   * Get all permissions for current user
   */
  const permissions = useMemo(() => {
    if (isOwner) {
      // Owner has all permissions
      return {
        canManageMembers: true,
        canManageProjects: true,
        canManageClients: true,
        canUpdateWorkspaceDetails: true,
        canManageCollaborators: true,
        canManageInternalProjectSettings: true,
        canAccessProjectManagerTabs: true
      };
    }

    return currentMember?.permissions || {
      canManageMembers: false,
      canManageProjects: false,
      canManageClients: false,
      canUpdateWorkspaceDetails: false,
      canManageCollaborators: false,
      canManageInternalProjectSettings: false,
      canAccessProjectManagerTabs: false
    };
  }, [isOwner, currentMember]);

  return {
    workspace,
    isOwner,
    isMember,
    isCollaborator,
    role,
    hasPermission,
    permissions,
    currentMember
  };
};

/**
 * Permission-based component wrapper
 * Only renders children if user has required permission
 */
export const PermissionGuard: React.FC<{
  workspaceId?: string;
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ workspaceId, permission, fallback = null, children }) => {
  const { hasPermission } = useWorkspacePermissions(workspaceId);

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Owner-only component wrapper
 * Only renders children if user is workspace owner
 */
export const OwnerGuard: React.FC<{
  workspaceId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ workspaceId, fallback = null, children }) => {
  const { isOwner } = useWorkspacePermissions(workspaceId);

  if (!isOwner) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Member-only component wrapper
 * Only renders children if user is workspace member
 */
export const MemberGuard: React.FC<{
  workspaceId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ workspaceId, fallback = null, children }) => {
  const { isMember } = useWorkspacePermissions(workspaceId);

  if (!isMember) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
