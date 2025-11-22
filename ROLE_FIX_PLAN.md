# Fix All Role References Script
# This script documents all the files that need to be fixed

Files to fix:
1. ✅ WorkspaceOverview.tsx - FIXED
2. WorkspaceInternalNav.tsx - Line 33
3. ProjectViewDetailed.tsx - Multiple lines
4. ProjectInternalNav.tsx - Lines 40-41
5. DockNavigation.tsx - Line 39, 43

Strategy:
- Remove all `state.roles.currentUserRole` references
- Use actual workspace/project membership instead
- Check workspace.owner for owner status
- Check workspace.members for member roles
- Check project.manager for project manager status
