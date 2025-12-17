# Debug: Member List Issue for Workspace Owner

## Quick Test

Add this logging to `server/src/controllers/workspaceController.ts` in the `getWorkspace` function (after line 315):

```typescript
// Add this right before res.status(200).json(response);
console.log('🔍 [GET WORKSPACE] User ID:', userId);
console.log('🔍 [GET WORKSPACE] Workspace Owner:', workspace.owner);
console.log('🔍 [GET WORKSPACE] Total members in DB:', workspace.members.length);
console.log('🔍 [GET WORKSPACE] Members:', workspace.members.map((m: any) => ({
  user: m.user?._id || m.user,
  role: m.role,
  status: m.status
})));
```

Then check the server logs when the owner loads the Members tab.

## Likely Issue

The problem is probably that some members have `status: 'pending'` instead of `'active'`.

## Quick Fix

Add this filter in `server/src/controllers/workspaceController.ts` in the `getWorkspace` function:

**Find** (around line 315):
```typescript
const response: ApiResponse<IWorkspace> = {
  success: true,
  message: 'Workspace retrieved successfully',
  data: workspace
};
```

**Replace with**:
```typescript
// Filter to only return active members
const workspaceData = workspace.toObject();
workspaceData.members = workspaceData.members.filter((m: any) => m.status === 'active');

const response: ApiResponse<IWorkspace> = {
  success: true,
  message: 'Workspace retrieved successfully',
  data: workspaceData
};
```

This ensures only active members are returned, regardless of who's requesting.
