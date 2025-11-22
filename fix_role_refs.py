import re

# Read the file
with open('client/src/components/ProjectViewDetailed.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# First replacement: role derivation logic (lines 238-245)
old_pattern1 = r'''  // Map global test role from AppContext into the local role flags used in this component
  const currentUserRole = state\.roles\.currentUserRole === 'project-manager' \? 'manager' : state\.roles\.currentUserRole; // 'owner' \| 'manager' \| 'employee'
  const currentTestUserId =
    state\.roles\.currentUserRole === 'owner'
      \? 'user_owner_123'
      : state\.roles\.currentUserRole === 'project-manager'
      \? 'user_pm_456'
      : 'user_emp_789';'''

new_text1 = '''  // Derive role from actual workspace and project membership
  const project = state.projects.find(p => p._id === projectId);
  const workspace = state.workspaces.find(w => w._id === project?.workspace);
  const isWorkspaceOwner = workspace?.owner === state.userProfile._id;
  const isProjectManager = project?.teamMembers?.some(
    (m: any) => m.user === state.userProfile._id && (m.role === 'project-manager' || m.permissions?.canManageProject)
  ) || false;
  const currentUserRole = isWorkspaceOwner ? 'owner' : isProjectManager ? 'manager' : 'employee';
  const currentTestUserId = state.userProfile._id;'''

content = re.sub(old_pattern1, new_text1, content, flags=re.MULTILINE)

# Second replacement: handleRoleChange function
old_pattern2 = r'''  const handleRoleChange = \(role: 'owner' \| 'project-manager' \| 'employee'\) => \{
    // Drive the global test role in AppContext
    dispatch\(\{ type: 'SET_CURRENT_USER_ROLE', payload: role \}\);'''

new_text2 = '''  const handleRoleChange = (role: 'owner' | 'project-manager' | 'employee') => {
    // Role switching is deprecated - roles are now derived from actual membership
    console.warn('[ProjectViewDetailed] handleRoleChange is deprecated. Roles are now derived from workspace/project membership.');'''

content = re.sub(old_pattern2, new_text2, content, flags=re.MULTILINE)

# Third replacement: isProjectManager prop
old_pattern3 = r'''isProjectManager=\{state\.roles\.currentUserRole === 'owner' \|\| state\.roles\.currentUserRole === 'project-manager'\}'''

new_text3 = '''isProjectManager={isProjectManager || isWorkspaceOwner}'''

content = re.sub(old_pattern3, new_text3, content)

# Write the file back
with open('client/src/components/ProjectViewDetailed.tsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("File updated successfully!")
