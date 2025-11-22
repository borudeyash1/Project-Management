import re

# Read the file
with open('client/src/components/workspace/WorkspaceCollaborate.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update 1: State initialization
old_state = '''const [permissions, setPermissions] = useState({
    canCreateProject: true,
    canManageEmployees: false,
    canViewPayroll: false,
    canExportReports: false,
    canManageWorkspace: false
  });'''

new_state = '''const [permissions, setPermissions] = useState({
    canManageMembers: false,
    canManageProjects: false,
    canManageClients: false,
    canUpdateWorkspaceDetails: false,
    canManageCollaborators: false,
    canManageInternalProjectSettings: false,
    canAccessProjectManagerTabs: false
  });'''

content = content.replace(old_state, new_state)

# Update 2: useEffect for role-based permissions
old_effect = '''  useEffect(() => {
    if (selectedRole === 'admin') {
      setPermissions({
        canCreateProject: true,
        canManageEmployees: true,
        canViewPayroll: true,
        canExportReports: true,
        canManageWorkspace: true
      });
    } else {
      setPermissions({
        canCreateProject: true,
        canManageEmployees: false,
        canViewPayroll: false,
        canExportReports: false,
        canManageWorkspace: false
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

content = content.replace(old_effect, new_effect)

# Update 3: Permission labels in the display
old_labels = '''                  {Object.entries(permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${
                        value ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        {value && <span className="text-green-600 dark:text-green-400 font-bold text-xs">✓</span>}
                      </div>
                      <span>{key.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}'''

new_labels = '''                  {Object.entries(permissions).map(([key, value]) => {
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
                  })}'''

content = content.replace(old_labels, new_labels)

# Update 4: TypeScript interface
old_interface = '''  permissions: {
    canCreateProject: boolean;
    canManageEmployees: boolean;
    canViewPayroll: boolean;
    canExportReports: boolean;
    canManageWorkspace: boolean;
  };'''

new_interface = '''  permissions: {
    canManageMembers: boolean;
    canManageProjects: boolean;
    canManageClients: boolean;
    canUpdateWorkspaceDetails: boolean;
    canManageCollaborators: boolean;
    canManageInternalProjectSettings: boolean;
    canAccessProjectManagerTabs: boolean;
  };'''

content = content.replace(old_interface, new_interface)

# Write back
with open('client/src/components/workspace/WorkspaceCollaborate.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ WorkspaceCollaborate component updated successfully!")
print("✅ Updated state initialization")
print("✅ Updated role-based permissions (Admin vs Manager)")
print("✅ Updated permission labels")
print("✅ Updated TypeScript interface")
