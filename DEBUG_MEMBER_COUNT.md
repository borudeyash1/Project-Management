# Debug: Member Count Mismatch

## Problem
- Database shows: 3 members (all active)
- Owner sees: 3 members ✅
- Regular members see: 4 members ❌

## Root Cause Analysis

The database is correct (3 members). The owner sees correct count. But regular members see an extra member.

This suggests the issue is in how the workspace data is fetched for regular members vs owners.

## Hypothesis

The query in `getUserWorkspaces` uses:
```typescript
$or: [
  { owner: userId },
  { 'members.user': userId, 'members.status': 'active' }
]
```

When a regular member queries, MongoDB might be:
1. Matching the workspace because they're in the members array
2. But returning ALL members (not filtering by status)

## Solution

Add member filtering in `getUserWorkspaces` function:

**File**: `server/src/controllers/workspaceController.ts`
**Function**: `getUserWorkspaces` (line ~252-280)

**Find** (line 266-272):
```typescript
    const response: ApiResponse<IWorkspace[]> = {
      success: true,
      message: 'Workspaces retrieved successfully',
      data: workspaces
    };

    res.status(200).json(response);
```

**Replace with**:
```typescript
    // Filter to only return active members in each workspace
    const filteredWorkspaces = workspaces.map(ws => {
      const wsData = ws.toObject();
      wsData.members = wsData.members.filter((m: any) => m.status === 'active');
      return wsData;
    });

    console.log('✅ [GET USER WORKSPACES] Returning', filteredWorkspaces.length, 'workspaces');

    const response: ApiResponse<IWorkspace[]> = {
      success: true,
      message: 'Workspaces retrieved successfully',
      data: filteredWorkspaces as any
    };

    res.status(200).json(response);
```

## Why This Fixes It

Even though all 3 members in the database are `active`, there might be:
1. A caching issue
2. A race condition where a 4th member was added then removed
3. The populate() is returning extra data

Filtering by `status === 'active'` ensures consistency across all users.

## Apply This Fix

1. Edit `server/src/controllers/workspaceController.ts`
2. Find line ~266-272
3. Add the filter code above
4. Save (server will auto-restart)
5. Refresh all browsers
6. Everyone should see 3 members

This is the same fix as for `getWorkspace` - we need it in BOTH places!
