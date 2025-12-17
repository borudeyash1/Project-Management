# 🔧 PROJECT CREATION & TEAM MANAGEMENT ISSUES

## 🔴 Problems Identified:

### 1. **Project Manager Not Being Set**
- **Issue**: When creating a project and selecting a project manager, the workspace owner is set as owner instead
- **Root Cause**: `createProject` function in `projectController.ts` doesn't handle `projectManager` field from request body
- **Current Behavior**: Only adds the current user (workspace owner) as owner in `teamMembers`

### 2. **Team Members Not Saving to Database**
- **Issue**: When adding team members to a project, they don't persist in the database
- **Root Cause**: Need to verify `addMember` function in `projectController.ts`
- **Impact**: Team members are lost after page refresh

### 3. **Delete Button Visibility**
- **Issue**: Delete button for team members should only be visible to workspace owner
- **Current Behavior**: Probably visible to all users
- **Required**: Check user's role in workspace before showing delete button

### 4. **Database Sync Issues**
- **Issue**: Changes to team members not properly syncing with database
- **Required**: Ensure all CRUD operations properly save and update MongoDB

## 📋 Files That Need Fixing:

### Backend:
1. **`server/src/controllers/projectController.ts`**
   - `createProject` function (lines 12-166)
   - `addMember` function (lines 463-646)
   - `removeMember` function (lines 648-693)

### Frontend:
2. **`client/src/components/workspace/WorkspaceProjects.tsx`**
   - Project creation form
   - Team member addition UI

3. **`client/src/components/project-tabs/ProjectTeamTab.tsx`**
   - Team member display
   - Delete button visibility logic

## 🛠️ Required Fixes:

### Fix 1: Handle Project Manager in createProject

**Location**: `server/src/controllers/projectController.ts` (line ~75)

**Current Code**:
```typescript
const project = new Project({
  name,
  description,
  workspace: resolvedWorkspaceId || null,
  tier: tier || plan,
  createdBy: user._id,
  teamMembers: [{
    user: user._id,
    role: 'owner',
    permissions: {
      canEdit: true,
      canDelete: true,
      canManageMembers: true,
      canViewReports: true
    }
  }],
  // ... rest
});
```

**Should Be**:
```typescript
const { projectManager, teamMembers: initialTeamMembers } = req.body;

// Build team members array
const teamMembersArray = [{
  user: user._id,
  role: 'owner',
  permissions: {
    canEdit: true,
    canDelete: true,
    canManageMembers: true,
    canViewReports: true
  }
}];

// Add project manager if specified and different from owner
if (projectManager && projectManager !== user._id.toString()) {
  teamMembersArray.push({
    user: projectManager,
    role: 'manager',
    permissions: {
      canEdit: true,
      canDelete: false,
      canManageMembers: true,
      canViewReports: true
    }
  });
}

// Add any additional team members
if (initialTeamMembers && Array.isArray(initialTeamMembers)) {
  initialTeamMembers.forEach((member: any) => {
    if (member.user !== user._id.toString() && member.user !== projectManager) {
      teamMembersArray.push({
        user: member.user,
        role: member.role || 'member',
        permissions: member.permissions || {
          canEdit: false,
          canDelete: false,
          canManageMembers: false,
          canViewReports: true
        }
      });
    }
  });
}

const project = new Project({
  name,
  description,
  workspace: resolvedWorkspaceId || null,
  tier: tier || plan,
  createdBy: user._id,
  teamMembers: teamMembersArray,
  // ... rest
});
```

### Fix 2: Verify addMember Function

**Location**: `server/src/controllers/projectController.ts` (lines 463-646)

**Check**:
- Ensure it properly saves to database with `await project.save()`
- Verify it returns the updated project
- Check error handling

### Fix 3: Delete Button Visibility

**Location**: `client/src/components/project-tabs/ProjectTeamTab.tsx`

**Add Logic**:
```typescript
const isWorkspaceOwner = useMemo(() => {
  if (!state.currentWorkspace) return false;
  const ownerId = typeof state.currentWorkspace.owner === 'string' 
    ? state.currentWorkspace.owner 
    : state.currentWorkspace.owner._id;
  return ownerId === state.userProfile._id;
}, [state.currentWorkspace, state.userProfile]);

// In the render:
{isWorkspaceOwner && (
  <button onClick={() => handleRemoveMember(member)}>
    <Trash2 className="w-4 h-4" />
  </button>
)}
```

### Fix 4: Database Sync

**Ensure**:
- All mutations call `await project.save()`
- Populate team members after save: `await project.populate('teamMembers.user')`
- Return updated project in API response
- Frontend refetches project data after mutations

## ✅ Testing Checklist:

After fixes:
- [ ] Create project with project manager → Manager is added to team
- [ ] Create project with initial team members → All members saved
- [ ] Add team member to existing project → Persists in database
- [ ] Remove team member → Updates database
- [ ] Delete button only visible to workspace owner
- [ ] Refresh page → All team members still there
- [ ] Check MongoDB directly → Team members array populated

## 🎯 Priority Order:

1. **HIGH**: Fix createProject to handle projectManager
2. **HIGH**: Fix createProject to handle initial teamMembers
3. **HIGH**: Verify addMember saves to database
4. **MEDIUM**: Fix delete button visibility
5. **MEDIUM**: Ensure proper database sync

## 📝 Next Steps:

1. View and fix `createProject` function
2. View and fix `addMember` function
3. Update ProjectTeamTab for delete button visibility
4. Test all scenarios
5. Verify database persistence

Ready to implement these fixes!
