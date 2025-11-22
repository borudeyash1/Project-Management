# 🔐 PERMISSION ENFORCEMENT IMPLEMENTATION GUIDE

## Overview

Complete guide for implementing permission checks in both backend (API routes) and frontend (UI components).

---

## ✅ Files Created

### Backend
- ✅ `server/src/middleware/checkPermission.ts` - Permission middleware

### Frontend
- ✅ `client/src/hooks/useWorkspacePermissions.tsx` - Permission hook & guards

---

## 🔧 Backend Implementation

### 1. Import Middleware

Add to your route files:

```typescript
import { checkPermission, checkOwner, checkMember } from '../middleware/checkPermission';
```

### 2. Apply to Routes

**Example: Workspace Routes** (`server/src/routes/workspaces.ts`)

```typescript
import { checkPermission, checkOwner, checkMember } from '../middleware/checkPermission';

// Manage Members - Requires canManageMembers permission
router.post('/:workspaceId/members', 
  checkPermission('canManageMembers'),
  addMember
);

router.delete('/:workspaceId/members/:memberId', 
  checkPermission('canManageMembers'),
  removeMember
);

// Manage Projects - Requires canManageProjects permission
router.post('/:workspaceId/projects', 
  checkPermission('canManageProjects'),
  createProject
);

router.put('/:workspaceId/projects/:projectId', 
  checkPermission('canManageProjects'),
  updateProject
);

router.delete('/:workspaceId/projects/:projectId', 
  checkPermission('canManageProjects'),
  deleteProject
);

// Manage Clients - Requires canManageClients permission
router.post('/:workspaceId/clients', 
  checkPermission('canManageClients'),
  addClient
);

router.put('/:workspaceId/clients/:clientId', 
  checkPermission('canManageClients'),
  updateClient
);

router.delete('/:workspaceId/clients/:clientId', 
  checkPermission('canManageClients'),
  deleteClient
);

// Update Workspace - Requires canUpdateWorkspaceDetails permission
router.put('/:workspaceId/details', 
  checkPermission('canUpdateWorkspaceDetails'),
  updateWorkspace
);

router.put('/:workspaceId/settings', 
  checkPermission('canUpdateWorkspaceDetails'),
  updateSettings
);

// Manage Collaborators - Requires canManageCollaborators permission
router.put('/:workspaceId/members/:memberId/role', 
  checkPermission('canManageCollaborators'),
  updateMemberRole
);

// Owner-only actions
router.delete('/:workspaceId', 
  checkOwner,
  deleteWorkspace
);

// Member-only actions (any member can access)
router.get('/:workspaceId', 
  checkMember,
  getWorkspace
);
```

### 3. Middleware Functions

**checkPermission(permission)**
- Checks if user has specific permission
- Owner always passes
- Returns 403 if no permission

**checkOwner**
- Checks if user is workspace owner
- Returns 403 if not owner

**checkMember**
- Checks if user is workspace member
- Owner always passes
- Returns 403 if not member

---

## 🎨 Frontend Implementation

### 1. Import Hook

```typescript
import { useWorkspacePermissions, PermissionGuard, OwnerGuard } from '../hooks/useWorkspacePermissions';
```

### 2. Use in Components

**Example: WorkspaceOwner Component**

```typescript
const WorkspaceOwner: React.FC = () => {
  const { state } = useApp();
  const workspaceId = state.currentWorkspace;
  
  // Get permissions
  const { 
    hasPermission, 
    isOwner, 
    permissions 
  } = useWorkspacePermissions(workspaceId);

  return (
    <div>
      {/* Show only if has permission */}
      {hasPermission('canManageMembers') && (
        <button onClick={handleAddMember}>
          Add Member
        </button>
      )}

      {/* Show only if has permission */}
      {hasPermission('canManageProjects') && (
        <button onClick={handleCreateProject}>
          Create Project
        </button>
      )}

      {/* Show only if has permission */}
      {hasPermission('canManageClients') && (
        <button onClick={handleAddClient}>
          Add Client
        </button>
      )}

      {/* Show only if owner */}
      {isOwner && (
        <button onClick={handleDeleteWorkspace}>
          Delete Workspace
        </button>
      )}

      {/* Disable if no permission */}
      <button 
        disabled={!hasPermission('canUpdateWorkspaceDetails')}
        onClick={handleEditWorkspace}
      >
        Edit Workspace
      </button>
    </div>
  );
};
```

### 3. Use Permission Guards

**PermissionGuard Component**

```typescript
<PermissionGuard 
  workspaceId={workspaceId}
  permission="canManageMembers"
  fallback={<p>You don't have permission to manage members</p>}
>
  <button onClick={handleAddMember}>
    Add Member
  </button>
</PermissionGuard>
```

**OwnerGuard Component**

```typescript
<OwnerGuard 
  workspaceId={workspaceId}
  fallback={<p>Only workspace owner can access this</p>}
>
  <button onClick={handleDeleteWorkspace}>
    Delete Workspace
  </button>
</OwnerGuard>
```

**MemberGuard Component**

```typescript
<MemberGuard 
  workspaceId={workspaceId}
  fallback={<p>You must be a workspace member</p>}
>
  <WorkspaceContent />
</MemberGuard>
```

---

## 📋 Permission Mapping

### Route → Permission Mapping

| Action | Permission Required |
|--------|-------------------|
| Add Member | `canManageMembers` |
| Remove Member | `canManageMembers` |
| Create Project | `canManageProjects` |
| Edit Project | `canManageProjects` |
| Delete Project | `canManageProjects` |
| Add Client | `canManageClients` |
| Edit Client | `canManageClients` |
| Delete Client | `canManageClients` |
| Edit Workspace | `canUpdateWorkspaceDetails` |
| Update Settings | `canUpdateWorkspaceDetails` |
| Promote Collaborator | `canManageCollaborators` |
| Demote Collaborator | `canManageCollaborators` |
| Delete Workspace | Owner only |
| View Workspace | Member only |

---

## 🎯 Implementation Examples

### Example 1: Protect Member Management

**Backend** (`server/src/routes/workspaces.ts`)

```typescript
router.post('/:workspaceId/members', 
  checkPermission('canManageMembers'),
  async (req, res) => {
    // Add member logic
  }
);
```

**Frontend** (Component)

```typescript
const { hasPermission } = useWorkspacePermissions(workspaceId);

{hasPermission('canManageMembers') && (
  <button onClick={handleAddMember}>
    <UserPlus className="w-4 h-4" />
    Add Member
  </button>
)}
```

---

### Example 2: Protect Project Management

**Backend** (`server/src/routes/projects.ts`)

```typescript
router.post('/', 
  checkPermission('canManageProjects'),
  createProject
);

router.put('/:projectId', 
  checkPermission('canManageProjects'),
  updateProject
);

router.delete('/:projectId', 
  checkPermission('canManageProjects'),
  deleteProject
);
```

**Frontend** (Component)

```typescript
const { hasPermission } = useWorkspacePermissions(workspaceId);

<PermissionGuard 
  workspaceId={workspaceId}
  permission="canManageProjects"
>
  <div className="project-actions">
    <button onClick={handleCreateProject}>Create Project</button>
    <button onClick={handleEditProject}>Edit Project</button>
    <button onClick={handleDeleteProject}>Delete Project</button>
  </div>
</PermissionGuard>
```

---

### Example 3: Protect Workspace Settings

**Backend** (`server/src/routes/workspaces.ts`)

```typescript
router.put('/:workspaceId/settings', 
  checkPermission('canUpdateWorkspaceDetails'),
  updateSettings
);
```

**Frontend** (Component)

```typescript
const { hasPermission } = useWorkspacePermissions(workspaceId);

<button 
  disabled={!hasPermission('canUpdateWorkspaceDetails')}
  onClick={handleEditSettings}
  className={!hasPermission('canUpdateWorkspaceDetails') ? 'opacity-50 cursor-not-allowed' : ''}
>
  Edit Settings
</button>
```

---

## 🔒 Security Best Practices

### 1. Always Check on Backend
- Never rely on frontend checks alone
- Backend must validate permissions
- Frontend checks are for UX only

### 2. Owner Always Has Access
- Owner bypasses all permission checks
- Owner cannot be restricted
- Owner can do everything

### 3. Check Member Status
- Only active members have permissions
- Pending/suspended members are denied
- Status check is automatic

### 4. Clear Error Messages
- Tell user what permission they need
- Don't expose sensitive information
- Be helpful but secure

---

## 📊 Hook API Reference

### useWorkspacePermissions(workspaceId)

**Returns:**

```typescript
{
  workspace: Workspace | null,
  isOwner: boolean,
  isMember: boolean,
  isCollaborator: boolean,
  role: 'owner' | 'admin' | 'manager' | 'member' | 'none',
  hasPermission: (permission: string) => boolean,
  permissions: {
    canManageMembers: boolean,
    canManageProjects: boolean,
    canManageClients: boolean,
    canUpdateWorkspaceDetails: boolean,
    canManageCollaborators: boolean,
    canManageInternalProjectSettings: boolean,
    canAccessProjectManagerTabs: boolean
  },
  currentMember: WorkspaceMember | null
}
```

**Usage:**

```typescript
const { 
  isOwner,           // Is current user the owner?
  isMember,          // Is current user a member?
  isCollaborator,    // Is current user admin/manager?
  role,              // What's the user's role?
  hasPermission,     // Check specific permission
  permissions        // All permissions object
} = useWorkspacePermissions(workspaceId);
```

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] Owner can access all routes
- [ ] Admin can access permitted routes
- [ ] Manager can access permitted routes
- [ ] Member cannot access restricted routes
- [ ] Non-member gets 403 error
- [ ] Missing permission returns clear error

### Frontend Tests

- [ ] Buttons hidden without permission
- [ ] Buttons disabled without permission
- [ ] Guards hide content correctly
- [ ] Owner sees all features
- [ ] Collaborators see permitted features
- [ ] Members see limited features

---

## 🚀 Quick Start

### Step 1: Add Backend Protection

```typescript
// server/src/routes/workspaces.ts
import { checkPermission } from '../middleware/checkPermission';

router.post('/:workspaceId/members', 
  checkPermission('canManageMembers'),
  addMember
);
```

### Step 2: Add Frontend Check

```typescript
// Component
import { useWorkspacePermissions } from '../hooks/useWorkspacePermissions';

const { hasPermission } = useWorkspacePermissions(workspaceId);

{hasPermission('canManageMembers') && (
  <button>Add Member</button>
)}
```

### Step 3: Test

1. Login as owner - see all features
2. Login as admin - see permitted features
3. Login as manager - see limited features
4. Login as member - see minimal features

---

## ✅ Implementation Checklist

### Backend
- [ ] Create `checkPermission.ts` middleware
- [ ] Import in route files
- [ ] Apply to member routes
- [ ] Apply to project routes
- [ ] Apply to client routes
- [ ] Apply to workspace routes
- [ ] Apply to collaborator routes
- [ ] Test all protected routes

### Frontend
- [ ] Create `useWorkspacePermissions.tsx` hook
- [ ] Import in components
- [ ] Add permission checks to buttons
- [ ] Add permission guards to sections
- [ ] Disable restricted actions
- [ ] Hide restricted features
- [ ] Test all permission scenarios

---

## 📝 Summary

✅ **Backend Middleware**: `checkPermission.ts` created  
✅ **Frontend Hook**: `useWorkspacePermissions.tsx` created  
✅ **Permission Guards**: PermissionGuard, OwnerGuard, MemberGuard  
✅ **7 Permissions**: All mapped and ready  
✅ **Security**: Owner always has access  
✅ **UX**: Clear permission-based UI  

**Status**: Ready to implement in routes and components!
