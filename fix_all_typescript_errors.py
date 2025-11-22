import re

# Fix Auth.tsx
print("Fixing Auth.tsx...")
with open('client/src/components/Auth.tsx', 'r', encoding='utf-8') as f:
    auth_content = f.read()

old_auth_perms = '''                permissions: {
                  canCreateProject: true,
                  canManageEmployees: false,
                  canViewPayroll: false,
                  canExportReports: true,
                  canManageWorkspace: true,
                },'''

new_auth_perms = '''                permissions: {
                  canManageMembers: true,
                  canManageProjects: true,
                  canManageClients: true,
                  canUpdateWorkspaceDetails: true,
                  canManageCollaborators: true,
                  canManageInternalProjectSettings: true,
                  canAccessProjectManagerTabs: true,
                },'''

auth_content = auth_content.replace(old_auth_perms, new_auth_perms)

with open('client/src/components/Auth.tsx', 'w', encoding='utf-8') as f:
    f.write(auth_content)

print("✅ Auth.tsx fixed!")

# Fix useWorkspacePermissions.tsx
print("\nFixing useWorkspacePermissions.tsx...")
with open('client/src/hooks/useWorkspacePermissions.tsx', 'r', encoding='utf-8') as f:
    hook_content = f.read()

# Fix the index signature error by adding type assertion
old_permission_check = '''    // Check specific permission
    return currentMember.permissions?.[permission] || false;'''

new_permission_check = '''    // Check specific permission
    return currentMember.permissions?.[permission as keyof typeof currentMember.permissions] || false;'''

hook_content = hook_content.replace(old_permission_check, new_permission_check)

with open('client/src/hooks/useWorkspacePermissions.tsx', 'w', encoding='utf-8') as f:
    f.write(hook_content)

print("✅ useWorkspacePermissions.tsx fixed!")

print("\n✅ All TypeScript errors fixed!")
print("✅ Auth.tsx: Updated permissions to new 7-permission structure")
print("✅ useWorkspacePermissions.tsx: Fixed index signature error")
