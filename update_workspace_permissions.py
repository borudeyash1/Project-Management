import re

# Read the file
with open('server/src/models/Workspace.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old permissions block
old_permissions = '''    permissions: {
      canCreateProject: {
        type: Boolean,
        default: false
      },
      canManageEmployees: {
        type: Boolean,
        default: false
      },
      canViewPayroll: {
        type: Boolean,
        default: false
      },
      canExportReports: {
        type: Boolean,
        default: false
      },
      canManageWorkspace: {
        type: Boolean,
        default: false
      }
    },'''

# Define the new permissions block
new_permissions = '''    permissions: {
      canManageMembers: {
        type: Boolean,
        default: false
      },
      canManageProjects: {
        type: Boolean,
        default: false
      },
      canManageClients: {
        type: Boolean,
        default: false
      },
      canUpdateWorkspaceDetails: {
        type: Boolean,
        default: false
      },
      canManageCollaborators: {
        type: Boolean,
        default: false
      },
      canManageInternalProjectSettings: {
        type: Boolean,
        default: false
      },
      canAccessProjectManagerTabs: {
        type: Boolean,
        default: false
      }
    },'''

# Replace the permissions
content = content.replace(old_permissions, new_permissions)

# Write back
with open('server/src/models/Workspace.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Workspace model permissions updated successfully!")
print("✅ Old permissions (5): canCreateProject, canManageEmployees, canViewPayroll, canExportReports, canManageWorkspace")
print("✅ New permissions (7): canManageMembers, canManageProjects, canManageClients, canUpdateWorkspaceDetails, canManageCollaborators, canManageInternalProjectSettings, canAccessProjectManagerTabs")
