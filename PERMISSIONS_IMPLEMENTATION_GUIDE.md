# 🚀 COMPLETE COLLABORATOR PERMISSIONS IMPLEMENTATION GUIDE

## Overview
This guide provides step-by-step instructions to implement the new collaborator permission system with 7 specific permissions.

---

## STEP 1: Update Workspace Model

**File**: `server/src/models/Workspace.ts`

**Find** (lines 41-62):
```typescript
permissions: {
  canCreateProject: {
    type: Boolean,
    default: false
  },
  canManageEmployees: {
    type: Boolean,
    default: false
  },
  canViewPayroll: {
    type: Boolean,
    default: false
  },
  canExportReports: {
    type: Boolean,
    default: false
  },
  canManageWorkspace: {
    type: Boolean,
    default: false
  }
},
```

**Replace with**:
```typescript
permissions: {
  canManageMembers: {
    type: Boolean,
    default: false
  },
  canManageProjects: {
    type: Boolean,
    default: false
  },
  canManageClients: {
    type: Boolean,
    default: false
  },
  canUpdateWorkspaceDetails: {
    type: Boolean,
    default: false
  },
  canManageCollaborators: {
    type: Boolean,
    default: false
  },
  canManageInternalProjectSettings: {
    type: Boolean,
    default: false
  },
  canAccessProjectManagerTabs: {
    type: Boolean,
    default: false
  }
},
```

---

## STEP 2: Update Frontend Component

**File**: `client/src/components/workspace/WorkspaceCollaborate.tsx`

**Find** (around line 38):
```typescript
const [permissions, setPermissions] = useState({
  canCreateProject: true,
  canManageEmployees: false,
  canViewPayroll: false,
  canExportReports: false,
  canManageWorkspace: false
});
```

**Replace with**:
```typescript
const [permissions, setPermissions] = useState({
  canManageMembers: false,
  canManageProjects: false,
  canManageClients: false,
  canUpdateWorkspaceDetails: false,
  canManageCollaborators: false,
  canManageInternalProjectSettings: false,
  canAccessProjectManagerTabs: false
});
```

**Find** (around line 90):
```typescript
useEffect(() => {
  if (selectedRole === 'admin') {
    setPermissions({
      canCreateProject: true,
      canManageEmployees: true,
      canViewPayroll: true,
      canExportReports: true,
      canManageWorkspace: true
    });
  } else {
    setPermissions({
      canCreateProject: true,
      canManageEmployees: false,
      canViewPayroll: false,
      canExportReports: false,
      canManageWorkspace: false
    });
  }
}, [selectedRole]);
```

**Replace with**:
```typescript
useEffect(() => {
  if (selectedRole === 'admin') {
    // Administrator - Full permissions
    setPermissions({
      canManageMembers: true,
      canManageProjects: true,
      canManageClients: true,
      canUpdateWorkspaceDetails: true,
      canManageCollaborators: true,
      canManageInternalProjectSettings: true,
      canAccessProjectManagerTabs: true
    });
  } else {
    // Manager - Limited permissions
    setPermissions({
      canManageMembers: false,
      canManageProjects: true,
      canManageClients: true,
      canUpdateWorkspaceDetails: false,
      canManageCollaborators: false,
      canManageInternalProjectSettings: true,
      canAccessProjectManagerTabs: true
    });
  }
}, [selectedRole]);
```

---

## STEP 3: Update Permission Display Labels

**File**: `client/src/components/workspace/WorkspaceCollaborate.tsx`

**Find** (in the permissions preview section):
```typescript
{Object.entries(permissions).map(([key, value]) => (
  <div key={key} className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded flex items-center justify-center ${
      value ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'
    }`}>
      {value && <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>}
    </div>
    <span>{key.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim()}</span>
  </div>
))}
```

**Replace with**:
```typescript
{Object.entries(permissions).map(([key, value]) => {
  const labels: Record<string, string> = {
    canManageMembers: 'Manage Members',
    canManageProjects: 'Manage Projects',
    canManageClients: 'Manage Clients',
    canUpdateWorkspaceDetails: 'Update Workspace Details',
    canManageCollaborators: 'Manage Collaborators',
    canManageInternalProjectSettings: 'Manage Internal Project Settings',
    canAccessProjectManagerTabs: 'Access Project Manager Tabs'
  };
  
  return (
    <div key={key} className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded flex items-center justify-center ${
        value ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'
      }`}>
        {value && <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>}
      </div>
      <span>{labels[key] || key}</span>
    </div>
  );
})}
```

---

## STEP 4: Update TypeScript Interface

**File**: `client/src/components/workspace/WorkspaceCollaborate.tsx`

**Find** (around line 16):
```typescript
permissions: {
  canCreateProject: boolean;
  canManageEmployees: boolean;
  canViewPayroll: boolean;
  canExportReports: boolean;
  canManageWorkspace: boolean;
};
```

**Replace with**:
```typescript
permissions: {
  canManageMembers: boolean;
  canManageProjects: boolean;
  canManageClients: boolean;
  canUpdateWorkspaceDetails: boolean;
  canManageCollaborators: boolean;
  canManageInternalProjectSettings: boolean;
  canAccessProjectManagerTabs: boolean;
};
```

---

## STEP 5: Test the Implementation

### Test Administrator Role
1. Go to Collaborate tab
2. Click "Invite Collaborator"
3. Select a member
4. Choose "Administrator - Full permissions"
5. Verify all 7 permissions show checkmarks:
   - ✓ Manage Members
   - ✓ Manage Projects
   - ✓ Manage Clients
   - ✓ Update Workspace Details
   - ✓ Manage Collaborators
   - ✓ Manage Internal Project Settings
   - ✓ Access Project Manager Tabs

### Test Manager Role
1. Select "Manager - Limited permissions"
2. Verify only these permissions show checkmarks:
   - ✗ Manage Members
   - ✓ Manage Projects
   - ✓ Manage Clients
   - ✗ Update Workspace Details
   - ✗ Manage Collaborators
   - ✓ Manage Internal Project Settings
   - ✓ Access Project Manager Tabs

---

## STEP 6: Add Permission Enforcement (Optional but Recommended)

### Backend Middleware

**Create**: `server/src/middleware/checkPermission.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import Workspace from '../models/Workspace';

export const checkPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.workspaceId || req.params.id;
      const userId = (req as any).user._id;

      const workspace = await Workspace.findById(workspaceId);
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      // Owner always has permission
      if (workspace.owner === userId) {
        return next();
      }

      const member = workspace.members.find(
        (m: any) => m.user.toString() === userId.toString()
      );

      if (!member) {
        return res.status(403).json({ message: 'Not a workspace member' });
      }

      if (!member.permissions[permission]) {
        return res.status(403).json({ 
          message: `Permission denied: ${permission}` 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};
```

### Apply to Routes

**File**: `server/src/routes/workspaces.ts`

```typescript
import { checkPermission } from '../middleware/checkPermission';

// Example usage
router.post('/:workspaceId/members', 
  checkPermission('canManageMembers'),
  addMember
);

router.post('/:workspaceId/projects', 
  checkPermission('canManageProjects'),
  createProject
);

router.put('/:workspaceId/details', 
  checkPermission('canUpdateWorkspaceDetails'),
  updateWorkspace
);
```

---

## STEP 7: Frontend Permission Checks

### Add Helper Function

**File**: `client/src/components/workspace/WorkspaceCollaborate.tsx`

```typescript
const hasPermission = (permission: string): boolean => {
  if (!workspace || !state.userProfile._id) return false;
  
  // Owner has all permissions
  if (workspace.owner === state.userProfile._id) return true;
  
  const member = workspace.members?.find((m: any) => {
    const userId = typeof m.user === 'string' ? m.user : m.user._id;
    return userId === state.userProfile._id;
  });
  
  if (!member) return false;
  
  return member.permissions?.[permission] || false;
};
```

### Use in Components

```typescript
// Example: Hide "Add Member" button if no permission
{hasPermission('canManageMembers') && (
  <button onClick={handleAddMember}>
    Add Member
  </button>
)}

// Example: Disable "Edit Workspace" if no permission
<button 
  disabled={!hasPermission('canUpdateWorkspaceDetails')}
  onClick={handleEditWorkspace}
>
  Edit Workspace
</button>
```

---

## Summary of Changes

### Backend
- ✅ Updated Workspace model with 7 new permissions
- ✅ Permission middleware (optional)
- ✅ Route protection (optional)

### Frontend
- ✅ Updated WorkspaceCollaborate component
- ✅ New permission structure
- ✅ Administrator vs Manager roles
- ✅ Permission labels display
- ✅ TypeScript interfaces

### Permissions
- ✅ Manage Members
- ✅ Manage Projects
- ✅ Manage Clients
- ✅ Update Workspace Details
- ✅ Manage Collaborators
- ✅ Manage Internal Project Settings
- ✅ Access Project Manager Tabs

---

## Quick Implementation Checklist

- [ ] Update Workspace.ts model (Step 1)
- [ ] Update WorkspaceCollaborate.tsx state (Step 2)
- [ ] Update permission defaults (Step 2)
- [ ] Update permission labels (Step 3)
- [ ] Update TypeScript interface (Step 4)
- [ ] Test Administrator role (Step 5)
- [ ] Test Manager role (Step 5)
- [ ] Add permission middleware (Step 6 - Optional)
- [ ] Add frontend permission checks (Step 7 - Optional)
- [ ] Restart server: `npm run dev`
- [ ] Restart client: `npm start`
- [ ] Hard refresh browser: `Ctrl + Shift + R`

---

**All changes are backward compatible and won't break existing functionality!**
