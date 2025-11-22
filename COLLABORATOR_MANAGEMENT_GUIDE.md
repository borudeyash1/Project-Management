# 🎯 COLLABORATOR MANAGEMENT IMPLEMENTATION GUIDE

## Overview

Implement a collaborator management system where workspace owners can promote members to collaborators (admin/manager roles) with specific permissions.

---

## Current System Status

### ✅ Backend - Already Implemented!

The backend already has everything needed:

#### Workspace Model (`server/src/models/Workspace.ts`)
```typescript
members: [{
  user: ObjectId,
  role: 'owner' | 'admin' | 'manager' | 'member',  // ✅ Already has roles
  permissions: {
    canCreateProject: Boolean,
    canManageEmployees: Boolean,
    canViewPayroll: Boolean,
    canExportReports: Boolean,
    canManageWorkspace: Boolean
  },
  status: 'active' | 'pending' | 'suspended'
}]
```

#### Controller (`server/src/controllers/workspaceController.ts`)
- ✅ `updateMemberRole` - Line 471 (already exists!)
- ✅ `getUserWorkspaces` - Populates members with user data
- ✅ `getWorkspace` - Fetches workspace with members

#### API Endpoint
```
PUT /api/workspaces/:id/members/:memberId/role
Body: { role: 'admin' | 'manager' | 'member' }
```

---

## Frontend Implementation Needed

### 1. Add Collaborator Management Tab/Section

**Location**: `client/src/components/workspace-detail/WorkspaceMembersTab.tsx`

**Features to Add**:
1. **Search existing members** - Filter from current workspace members
2. **Promote to collaborator** - Change role to 'admin' or 'manager'
3. **Set permissions** - Configure what collaborators can do
4. **Demote collaborators** - Change back to 'member'
5. **View collaborator list** - Show all admins/managers separately

### 2. Permission Management UI

**Permissions to Configure**:
- ✅ Can Create Projects
- ✅ Can Manage Employees
- ✅ Can View Payroll
- ✅ Can Export Reports
- ✅ Can Manage Workspace

### 3. Role-Based Access Control

**Hierarchy**:
```
Owner (1)
  ├─ Can do everything
  ├─ Can promote/demote members
  ├─ Can remove anyone except themselves
  └─ Cannot be removed

Admin/Manager (Collaborators)
  ├─ Have assigned permissions
  ├─ Can see workspace owner view
  ├─ Cannot remove owner
  └─ Can be removed by owner

Member (Regular)
  ├─ Basic access
  ├─ Can view assigned projects
  └─ Limited permissions
```

---

## Implementation Steps

### Step 1: Update WorkspaceMembersTab.tsx

Add these sections:

#### A. Collaborators Section (Above Members List)
```tsx
{/* Collaborators Section */}
{canManageMembers && (
  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
      Workspace Collaborators
    </h4>
    <div className="space-y-2">
      {members
        .filter(m => m.role === 'admin' || m.role === 'manager')
        .map(collaborator => (
          <div key={collaborator._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {collaborator.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {collaborator.role === 'admin' ? 'Administrator' : 'Manager'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDemoteCollaborator(collaborator._id)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove Role
            </button>
          </div>
        ))}
      {members.filter(m => m.role === 'admin' || m.role === 'manager').length === 0 && (
        <p className="text-sm text-gray-600">No collaborators yet</p>
      )}
    </div>
  </div>
)}
```

#### B. Promote Member Modal
```tsx
{/* Promote to Collaborator Modal */}
{showPromoteModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Promote to Collaborator
      </h3>
      
      {/* Select Member */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Member
        </label>
        <select
          value={selectedMemberForPromotion}
          onChange={(e) => setSelectedMemberForPromotion(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
        >
          <option value="">Choose a member...</option>
          {members
            .filter(m => m.role === 'member' && m.status === 'active')
            .map(member => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
        </select>
      </div>

      {/* Select Role */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Collaborator Role
        </label>
        <select
          value={newCollaboratorRole}
          onChange={(e) => setNewCollaboratorRole(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
        >
          <option value="admin">Administrator - Full permissions</option>
          <option value="manager">Manager - Limited permissions</option>
        </select>
      </div>

      {/* Permissions Checklist */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Permissions
        </label>
        <div className="space-y-2">
          {[
            { key: 'canCreateProject', label: 'Can Create Projects' },
            { key: 'canManageEmployees', label: 'Can Manage Employees' },
            { key: 'canViewPayroll', label: 'Can View Payroll' },
            { key: 'canExportReports', label: 'Can Export Reports' },
            { key: 'canManageWorkspace', label: 'Can Manage Workspace' },
          ].map(perm => (
            <label key={perm.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={collaboratorPermissions[perm.key]}
                onChange={(e) => setCollaboratorPermissions({
                  ...collaboratorPermissions,
                  [perm.key]: e.target.checked
                })}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {perm.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowPromoteModal(false)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handlePromoteToCollaborator}
          className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg hover:bg-accent-hover"
        >
          Promote
        </button>
      </div>
    </div>
  </div>
)}
```

#### C. State Variables to Add
```tsx
const [showPromoteModal, setShowPromoteModal] = useState(false);
const [selectedMemberForPromotion, setSelectedMemberForPromotion] = useState('');
const [newCollaboratorRole, setNewCollaboratorRole] = useState('admin');
const [collaboratorPermissions, setCollaboratorPermissions] = useState({
  canCreateProject: true,
  canManageEmployees: false,
  canViewPayroll: false,
  canExportReports: false,
  canManageWorkspace: false
});
```

#### D. Handler Functions
```tsx
const handlePromoteToCollaborator = async () => {
  if (!selectedMemberForPromotion) {
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: 'Please select a member',
        duration: 3000
      }
    });
    return;
  }

  try {
    await api.put(
      `/workspaces/${workspaceId}/members/${selectedMemberForPromotion}/role`,
      { 
        role: newCollaboratorRole,
        permissions: collaboratorPermissions
      }
    );

    // Refresh workspace data
    const response = await api.get(`/workspaces/${workspaceId}`);
    // Update local state...

    setShowPromoteModal(false);
    setSelectedMemberForPromotion('');
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Member promoted to collaborator successfully',
        duration: 3000
      }
    });
  } catch (error: any) {
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: error?.message || 'Failed to promote member',
        duration: 3000
      }
    });
  }
};

const handleDemoteCollaborator = async (memberId: string) => {
  if (!window.confirm('Are you sure you want to remove this collaborator role?')) {
    return;
  }

  try {
    await api.put(
      `/workspaces/${workspaceId}/members/${memberId}/role`,
      { role: 'member' }
    );

    // Refresh workspace data
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Collaborator demoted to member',
        duration: 3000
      }
    });
  } catch (error: any) {
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: error?.message || 'Failed to demote collaborator',
        duration: 3000
      }
    });
  }
};
```

---

## Access Control Logic

### In WorkspaceMembersTab.tsx

```tsx
// Check if current user is owner
const isOwner = workspace?.owner === currentUserId;

// Check if current user is admin/manager
const isCollaborator = (workspace?.members || []).some((member: any) => {
  const user = member.user;
  const id = typeof user === 'string' ? user : user._id;
  return id === currentUserId && (member.role === 'admin' || member.role === 'manager');
});

// Can manage members if owner or collaborator with permission
const canManageMembers = isOwner || (isCollaborator && hasPermission('canManageWorkspace'));

// Can remove member (but not owner)
const canRemoveMember = (memberId: string) => {
  if (memberId === workspace?.owner) return false; // Can't remove owner
  return isOwner || (isCollaborator && hasPermission('canManageWorkspace'));
};
```

---

## UI Enhancements

### 1. Add "Manage Collaborators" Button
```tsx
{isOwner && (
  <button
    onClick={() => setShowPromoteModal(true)}
    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
  >
    <UserPlus className="w-4 h-4" />
    Add Collaborator
  </button>
)}
```

### 2. Show Role Badges
```tsx
<span className={`px-2 py-1 text-xs font-medium rounded-full ${
  member.role === 'owner' ? 'bg-blue-100 text-blue-700' :
  member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
  member.role === 'manager' ? 'bg-green-100 text-green-700' :
  'bg-gray-100 text-gray-700'
}`}>
  {member.role === 'owner' ? 'Owner' :
   member.role === 'admin' ? 'Admin' :
   member.role === 'manager' ? 'Manager' : 'Member'}
</span>
```

---

## Testing Checklist

- [ ] Owner can see "Add Collaborator" button
- [ ] Search shows only active workspace members
- [ ] Can promote member to admin/manager
- [ ] Can set custom permissions
- [ ] Collaborator sees workspace owner view
- [ ] Collaborator has assigned permissions
- [ ] Owner can demote collaborators
- [ ] Collaborators cannot remove owner
- [ ] Owner cannot remove themselves
- [ ] Role badges display correctly

---

## Summary

**Backend**: ✅ Already complete!  
**Frontend**: ⚠️ Needs implementation

The backend already supports:
- Multiple roles (owner, admin, manager, member)
- Custom permissions per member
- Role updates via API

You need to add the frontend UI to:
- Search and select members
- Promote to collaborator
- Configure permissions
- Display collaborator list
- Enforce access control rules

Would you like me to create the complete frontend component with all these features?
