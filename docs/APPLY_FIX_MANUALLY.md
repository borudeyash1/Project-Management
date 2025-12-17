# Manual Fix Instructions

Due to file editing issues, please apply these fixes manually:

## Fix 1: Member List Filter (CRITICAL)

**File**: `server/src/controllers/workspaceController.ts`

**Find** (around line 304-312):
```typescript
    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

    const response: ApiResponse<IWorkspace> = {
      success: true,
      message: 'Workspace retrieved successfully',
      data: workspace
    };

    res.status(200).json(response);
```

**Replace with**:
```typescript
    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied'
      });
      return;
    }

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

## After Applying

1. Save the file
2. Server will auto-restart (nodemon)
3. Refresh browser
4. All users should see same member count

---

## If You Need Help

The complete implementation guide is in:
- `COMPLETE_WORKSPACE_FIXES.md` - Full details
- `FINAL_MEMBER_FIX.md` - Member fix only

Both files have all the code ready to copy-paste!
