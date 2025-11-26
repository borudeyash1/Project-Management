# SIMPLE FIX - Copy and Paste

## File: server/src/controllers/workspaceController.ts

### Fix 1: getUserWorkspaces (Line ~265-272)

**FIND THIS:**
```typescript
    const response: ApiResponse<IWorkspace[]> = {
      success: true,
      message: 'Workspaces retrieved successfully',
      data: workspaces
    };

    res.status(200).json(response);
```

**REPLACE WITH THIS:**
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

---

### Fix 2: getWorkspace (Line ~306-312)

**FIND THIS:**
```typescript
    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Workspace retrieved successfully',
      data: workspace
    };

    res.status(200).json(response);
```

**REPLACE WITH THIS:**
```typescript
    // Filter to only return active members
    const workspaceData = workspace.toObject();
    workspaceData.members = workspaceData.members.filter((m: any) => m.status === 'active');
    
    console.log('✅ [GET WORKSPACE] Returning workspace with', workspaceData.members.length, 'active members');

    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Workspace retrieved successfully',
      data: workspaceData as any
    };

    res.status(200).json(response);
```

---

## Steps to Apply

1. Open `server/src/controllers/workspaceController.ts`
2. Press `Ctrl+F` to search
3. Search for first code block
4. Replace with new code
5. Search for second code block
6. Replace with new code
7. Save file
8. Server will auto-restart
9. Refresh all browsers
10. Everyone should see 3 members!

---

## What This Does

- Filters members array to only include `status: 'active'`
- Applies to both workspace list and single workspace
- Ensures all users see same member count
- Removes phantom/cached members

Done!
