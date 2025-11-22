# 🔐 COLLABORATOR PERMISSIONS SPECIFICATION

## New Permission Structure

### Administrator Role (Full Access)
All permissions enabled:
- ✅ Manage Members
- ✅ Manage Projects
- ✅ Manage Clients
- ✅ Update Workspace Details
- ✅ Manage Collaborators
- ✅ Manage Internal Project Settings
- ✅ Access Project Manager Tabs

### Manager Role (Limited Access)
Selected permissions:
- ✅ Manage Projects
- ✅ Manage Clients
- ❌ Manage Members
- ❌ Update Workspace Details
- ❌ Manage Collaborators
- ✅ Manage Internal Project Settings
- ✅ Access Project Manager Tabs

### Member Role (Basic Access)
No management permissions:
- ❌ All management permissions disabled
- ✅ Can view assigned projects
- ✅ Can work on assigned tasks

---

## Permission Details

### 1. Manage Members
**What it allows:**
- Add new members to workspace
- Remove members from workspace
- View all workspace members
- Update member roles (except owner)

**Who has it:**
- Owner (always)
- Administrator (yes)
- Manager (no)
- Member (no)

---

### 2. Manage Projects
**What it allows:**
- Create new projects
- Edit project details
- Delete projects
- Assign team members to projects
- Change project status
- Set project deadlines

**Who has it:**
- Owner (always)
- Administrator (yes)
- Manager (yes)
- Member (no)

---

### 3. Manage Clients
**What it allows:**
- Add new clients
- Edit client information
- Delete clients
- View all client details
- Assign clients to projects

**Who has it:**
- Owner (always)
- Administrator (yes)
- Manager (yes)
- Member (no)

---

### 4. Update Workspace Details
**What it allows:**
- Edit workspace name
- Update workspace description
- Change workspace settings
- Update workspace profile
- Modify workspace preferences

**Who has it:**
- Owner (always)
- Administrator (yes)
- Manager (no)
- Member (no)

---

### 5. Manage Collaborators
**What it allows:**
- Promote members to collaborators
- Demote collaborators to members
- Change collaborator roles
- View all collaborators
- Update collaborator permissions

**Who has it:**
- Owner (always)
- Administrator (yes)
- Manager (no)
- Member (no)

---

### 6. Manage Internal Project Settings
**What it allows:**
- Configure project workflows
- Set project templates
- Manage project categories
- Configure task statuses
- Set project defaults

**Who has it:**
- Owner (always)
- Administrator (yes)
- Manager (yes)
- Member (no)

---

### 7. Access Project Manager Tabs
**What it allows:**
- View all project tabs
- Access project dashboard
- View project analytics
- See project reports
- Access project settings

**Who has it:**
- Owner (always)
- Administrator (yes)
- Manager (yes)
- Member (limited - only assigned projects)

---

## Implementation Plan

### Backend Changes

#### 1. Update Workspace Model
```typescript
// server/src/models/Workspace.ts
permissions: {
  canManageMembers: Boolean,
  canManageProjects: Boolean,
  canManageClients: Boolean,
  canUpdateWorkspaceDetails: Boolean,
  canManageCollaborators: Boolean,
  canManageInternalProjectSettings: Boolean,
  canAccessProjectManagerTabs: Boolean
}
```

#### 2. Update Permission Defaults
```typescript
// Administrator
{
  canManageMembers: true,
  canManageProjects: true,
  canManageClients: true,
  canUpdateWorkspaceDetails: true,
  canManageCollaborators: true,
  canManageInternalProjectSettings: true,
  canAccessProjectManagerTabs: true
}

// Manager
{
  canManageMembers: false,
  canManageProjects: true,
  canManageClients: true,
  canUpdateWorkspaceDetails: false,
  canManageCollaborators: false,
  canManageInternalProjectSettings: true,
  canAccessProjectManagerTabs: true
}
```

#### 3. Add Permission Middleware
```typescript
// server/src/middleware/checkPermission.ts
export const checkPermission = (permission: string) => {
  return async (req, res, next) => {
    const workspace = await Workspace.findById(req.params.workspaceId);
    const member = workspace.members.find(m => m.user === req.user._id);
    
    if (workspace.owner === req.user._id) {
      return next(); // Owner has all permissions
    }
    
    if (!member.permissions[permission]) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    next();
  };
};
```

---

### Frontend Changes

#### 1. Update WorkspaceCollaborate.tsx
```typescript
const permissions = {
  canManageMembers: boolean,
  canManageProjects: boolean,
  canManageClients: boolean,
  canUpdateWorkspaceDetails: boolean,
  canManageCollaborators: boolean,
  canManageInternalProjectSettings: boolean,
  canAccessProjectManagerTabs: boolean
};
```

#### 2. Update Permission Display
```tsx
<div className="space-y-1 text-xs">
  <PermissionItem 
    enabled={permissions.canManageMembers}
    label="Manage Members"
  />
  <PermissionItem 
    enabled={permissions.canManageProjects}
    label="Manage Projects"
  />
  <PermissionItem 
    enabled={permissions.canManageClients}
    label="Manage Clients"
  />
  <PermissionItem 
    enabled={permissions.canUpdateWorkspaceDetails}
    label="Update Workspace Details"
  />
  <PermissionItem 
    enabled={permissions.canManageCollaborators}
    label="Manage Collaborators"
  />
  <PermissionItem 
    enabled={permissions.canManageInternalProjectSettings}
    label="Manage Internal Project Settings"
  />
  <PermissionItem 
    enabled={permissions.canAccessProjectManagerTabs}
    label="Access Project Manager Tabs"
  />
</div>
```

#### 3. Add Permission Checks in UI
```typescript
// Hide/show features based on permissions
{hasPermission('canManageMembers') && (
  <button>Add Member</button>
)}

{hasPermission('canManageProjects') && (
  <button>Create Project</button>
)}

{hasPermission('canManageClients') && (
  <button>Add Client</button>
)}
```

---

## Testing Checklist

### Administrator
- [ ] Can manage members
- [ ] Can manage projects
- [ ] Can manage clients
- [ ] Can update workspace details
- [ ] Can manage collaborators
- [ ] Can manage internal project settings
- [ ] Can access all project manager tabs

### Manager
- [ ] Cannot manage members
- [ ] Can manage projects
- [ ] Can manage clients
- [ ] Cannot update workspace details
- [ ] Cannot manage collaborators
- [ ] Can manage internal project settings
- [ ] Can access project manager tabs

### Member
- [ ] Cannot access any management features
- [ ] Can only view assigned projects
- [ ] Cannot create/edit/delete anything

---

## Files to Modify

### Backend
1. `server/src/models/Workspace.ts` - Update permission schema
2. `server/src/controllers/workspaceController.ts` - Update role defaults
3. `server/src/middleware/checkPermission.ts` - Create permission middleware
4. `server/src/routes/workspaces.ts` - Add permission checks to routes
5. `server/src/routes/projects.ts` - Add permission checks
6. `server/src/routes/clients.ts` - Add permission checks

### Frontend
1. `client/src/components/workspace/WorkspaceCollaborate.tsx` - Update permissions UI
2. `client/src/components/WorkspaceOwner.tsx` - Add permission checks
3. `client/src/components/workspace/WorkspaceProfile.tsx` - Add permission checks
4. `client/src/components/ProjectManager.tsx` - Add permission checks

---

## Next Steps

1. ✅ Update Workspace model with new permissions
2. ✅ Update WorkspaceCollaborate component
3. ✅ Add permission middleware
4. ✅ Update all routes with permission checks
5. ✅ Update frontend components with permission checks
6. ✅ Test all permission combinations
7. ✅ Verify owner always has full access

Ready to implement? Let's start!
