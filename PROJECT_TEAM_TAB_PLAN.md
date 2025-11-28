# Project Team Tab - Implementation Plan

## Current Issues
1. **Dummy Data**: Lines 53-58 use hardcoded member data
2. **Limited Roles**: Only "Member" and "Project Manager" options
3. **No Custom Role**: Can't add custom roles
4. **No Real API Integration**: Not fetching from workspace members

## Required Changes

### 1. Frontend Changes (`ProjectTeamTab.tsx`)

#### A. Fetch Real Workspace Members
- Use existing API: `GET /api/messages/workspace/:workspaceId/members`
- Replace dummy data (lines 53-58) with real API call
- Use `useEffect` to load members when component mounts

#### B. Expand Role Options
Current roles:
- Member
- Project Manager

New roles to add:
- Developer
- Designer  
- Tester
- Analyst
- QA Engineer
- DevOps
- Custom (with text input)

#### C. Add Custom Role Input
- When "Custom" is selected, show text input field
- Store custom role value in state
- Pass custom role to backend

#### D. Update Interface
```typescript
interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string; // Change from 'project-manager' | 'member' to string
  addedAt: Date;
}
```

### 2. Backend Changes

#### A. Update Project Model (`server/src/models/Project.ts`)
- Change team member role type from enum to string
- Allow custom roles

#### B. Update Project Controller
- Modify `addTeamMember` to accept any role string
- Validate role is not empty
- Save custom roles to database

### 3. Implementation Steps

**Step 1**: Update TypeScript interfaces
**Step 2**: Add `useEffect` to fetch workspace members
**Step 3**: Add custom role state and input field
**Step 4**: Update role dropdown with all options
**Step 5**: Update backend to accept custom roles
**Step 6**: Test adding members with different roles

### 4. API Endpoints Needed

- `GET /api/messages/workspace/:workspaceId/members` - Already exists
- `POST /api/projects/:projectId/team` - Add member (needs update)
- `DELETE /api/projects/:projectId/team/:memberId` - Remove member
- `PUT /api/projects/:projectId/manager` - Change project manager

### 5. Translation Keys to Add

```json
{
  "project.team.roles": {
    "member": "Member",
    "projectManager": "Project Manager",
    "developer": "Developer",
    "designer": "Designer",
    "tester": "Tester",
    "analyst": "Analyst",
    "qaEngineer": "QA Engineer",
    "devops": "DevOps",
    "custom": "Custom Role"
  },
  "project.team.modal.customRoleLabel": "Enter Custom Role",
  "project.team.modal.customRolePlaceholder": "e.g., Technical Lead, Scrum Master"
}
```

## Expected Result

1. ✅ Real workspace members loaded from database
2. ✅ Multiple role options available
3. ✅ Custom role input when "Custom" selected
4. ✅ All changes saved to MongoDB
5. ✅ Team members displayed with their actual roles
