# 🔧 Team Member Database Sync - Fix Guide

## Problem
Team members are being added to frontend state only, not persisting to MongoDB. After refresh, they disappear.

## Root Cause
The `onAddMember` callback in `ProjectViewDetailed.tsx` (lines 1939-1950) only updates Redux state, doesn't make API call to backend.

## Solution

### File: `client/src/components/ProjectViewDetailed.tsx`

**Location**: Lines 1939-1950

**Current Code** (WRONG - only updates frontend):
```typescript
onAddMember={(memberId, role) => {
  // Add member to project team
  const member = { _id: memberId, name: 'Member Name', email: 'email@example.com', role, addedAt: new Date() };
  const updatedTeam = [...((activeProject as any)?.team || []), member];
  dispatch({
    type: 'UPDATE_PROJECT',
    payload: {
      projectId: activeProject?._id || '',
      updates: { team: updatedTeam }
    }
  });
}}
```

**Replace With** (CORRECT - saves to database):
```typescript
onAddMember={async (memberId, role) => {
  // Add member to project team via API
  try {
    const response = await apiService.post(`/projects/${activeProject?._id}/members`, {
      userId: memberId,
      role: role
    });
    
    // Update local state with the response from backend
    if (response.data.success) {
      const updatedProject = response.data.data;
      setActiveProject(updatedProject);
      
      dispatch({
        type: 'UPDATE_PROJECT',
        payload: {
          projectId: activeProject?._id || '',
          updates: { team: updatedProject.team }
        }
      });
      
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: `Member added successfully with role: ${role}`,
          duration: 3000
        }
      });
    }
  } catch (error) {
    console.error('Failed to add team member:', error);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to add team member. Please try again.',
        duration: 4000
      }
    });
  }
}}
```

## How It Works

1. **API Call**: Makes POST request to `/projects/:projectId/members`
2. **Backend Saves**: Server saves member to MongoDB
3. **Response**: Backend returns updated project with new team member
4. **Update State**: Frontend updates both local and Redux state
5. **Toast Notification**: Shows success/error message

## Testing

1. Add a team member
2. Refresh the page
3. Member should still be there ✅

## Backend Endpoint

The backend endpoint already exists:
- **Route**: `POST /api/projects/:id/members`
- **Controller**: `addMember` in `projectController.ts`
- **Body**: `{ userId: string, role: string }`

## Result

✅ Team members persist to MongoDB
✅ Data survives page refresh
✅ Proper error handling
✅ User feedback via toasts
