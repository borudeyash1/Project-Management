import re

# Read the file
with open('client/src/components/workspace/WorkspaceCollaborate.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update 1: Change role type to include 'custom'
old_role_type = "const [selectedRole, setSelectedRole] = useState<'admin' | 'manager'>('manager');"
new_role_type = "const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'custom'>('manager');"
content = content.replace(old_role_type, new_role_type)

# Update 2: Update useEffect to handle custom role
old_effect = '''  useEffect(() => {
    if (selectedRole === 'admin') {
      // Administrator - Full permissions
      setPermissions({
        canManageMembers: true,
        canManageProjects: true,
        canManageClients: true,
        canUpdateWorkspaceDetails: true,
        canManageCollaborators: true,
        canManageInternalProjectSettings: true,
        canAccessProjectManagerTabs: true
      });
    } else {
      // Manager - Limited permissions
      setPermissions({
        canManageMembers: false,
        canManageProjects: true,
        canManageClients: true,
        canUpdateWorkspaceDetails: false,
        canManageCollaborators: false,
        canManageInternalProjectSettings: true,
        canAccessProjectManagerTabs: true
      });
    }
  }, [selectedRole]);'''

new_effect = '''  useEffect(() => {
    if (selectedRole === 'admin') {
      // Administrator - Full permissions
      setPermissions({
        canManageMembers: true,
        canManageProjects: true,
        canManageClients: true,
        canUpdateWorkspaceDetails: true,
        canManageCollaborators: true,
        canManageInternalProjectSettings: true,
        canAccessProjectManagerTabs: true
      });
    } else if (selectedRole === 'manager') {
      // Manager - Limited permissions
      setPermissions({
        canManageMembers: false,
        canManageProjects: true,
        canManageClients: true,
        canUpdateWorkspaceDetails: false,
        canManageCollaborators: false,
        canManageInternalProjectSettings: true,
        canAccessProjectManagerTabs: true
      });
    }
    // For 'custom' role, don't change permissions - let user select manually
  }, [selectedRole]);'''

content = content.replace(old_effect, new_effect)

# Update 3: Add custom option to role selector
old_select = '''                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'manager')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="manager">Manager - Limited permissions</option>
                  <option value="admin">Administrator - Full permissions</option>
                </select>'''

new_select = '''                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'manager' | 'custom')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="manager">Manager - Limited permissions</option>
                  <option value="admin">Administrator - Full permissions</option>
                  <option value="custom">Custom - Select your own permissions</option>
                </select>'''

content = content.replace(old_select, new_select)

# Update 4: Make permissions interactive for custom role
old_permissions_display = '''              {/* Permissions Preview */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions:</p>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  {Object.entries(permissions).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      canManageMembers: 'Manage Members',
                      canManageProjects: 'Manage Projects',
                      canManageClients: 'Manage Clients',
                      canUpdateWorkspaceDetails: 'Update Workspace Details',
                      canManageCollaborators: 'Manage Collaborators',
                      canManageInternalProjectSettings: 'Manage Internal Project Settings',
                      canAccessProjectManagerTabs: 'Access Project Manager Tabs'
                    };
                    
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${
                          value ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          {value && <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>}
                        </div>
                        <span>{labels[key] || key}</span>
                      </div>
                    );
                  })}
                </div>
              </div>'''

new_permissions_display = '''              {/* Permissions Preview/Selection */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {selectedRole === 'custom' ? 'Select Permissions:' : 'Permissions:'}
                </p>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  {Object.entries(permissions).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      canManageMembers: 'Manage Members',
                      canManageProjects: 'Manage Projects',
                      canManageClients: 'Manage Clients',
                      canUpdateWorkspaceDetails: 'Update Workspace Details',
                      canManageCollaborators: 'Manage Collaborators',
                      canManageInternalProjectSettings: 'Manage Internal Project Settings',
                      canAccessProjectManagerTabs: 'Access Project Manager Tabs'
                    };
                    
                    if (selectedRole === 'custom') {
                      // Interactive checkboxes for custom role
                      return (
                        <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPermissions({
                              ...permissions,
                              [key]: e.target.checked
                            })}
                            className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                          />
                          <span>{labels[key] || key}</span>
                        </label>
                      );
                    } else {
                      // Read-only display for admin/manager
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${
                            value ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'
                          }`}>
                            {value && <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>}
                          </div>
                          <span>{labels[key] || key}</span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>'''

content = content.replace(old_permissions_display, new_permissions_display)

# Write back
with open('client/src/components/workspace/WorkspaceCollaborate.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Custom role option added successfully!")
print("✅ Added 'custom' to role type")
print("✅ Updated useEffect to handle custom role")
print("✅ Added 'Custom' option to role selector")
print("✅ Made permissions interactive for custom role")
print("✅ Users can now select their own permissions!")
