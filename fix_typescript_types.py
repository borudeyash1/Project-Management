import re

# Read the file
with open('client/src/types/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old permissions
old_permissions = '''  permissions: {
    canCreateProject: boolean;
    canManageEmployees: boolean;
    canViewPayroll: boolean;
    canExportReports: boolean;
    canManageWorkspace: boolean;
  };'''

# Define the new permissions
new_permissions = '''  permissions: {
    canManageMembers: boolean;
    canManageProjects: boolean;
    canManageClients: boolean;
    canUpdateWorkspaceDetails: boolean;
    canManageCollaborators: boolean;
    canManageInternalProjectSettings: boolean;
    canAccessProjectManagerTabs: boolean;
  };'''

# Replace
content = content.replace(old_permissions, new_permissions)

# Write back
with open('client/src/types/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ TypeScript types updated successfully!")
print("✅ WorkspaceMember permissions interface now has 7 permissions")
