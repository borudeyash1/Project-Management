# 🎯 Project Team Tab - Fixes Needed

## Summary
The Project Team Tab currently uses dummy data and has limited role options. We need to:
1. Fetch real workspace members from the database
2. Add more role options (Developer, Designer, Tester, etc.)
3. Allow custom role input
4. Save everything properly to MongoDB

## What Needs to Change

### Frontend (`client/src/components/project-tabs/ProjectTeamTab.tsx`)

**Lines 53-58** - Replace dummy data:
```typescript
// REMOVE THIS:
const workspaceMembers: WorkspaceMember[] = [
  { _id: 'user_emp_789', name: 'Bob Wilson', email: 'bob.wilson@company.com', role: 'developer' },
  // ... more dummy data
];

// ADD THIS:
const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);

useEffect(() => {
  const fetchMembers = async () => {
    try {
      const response = await apiService.get(`/messages/workspace/${workspaceId}/members`);
      setWorkspaceMembers(response.data.members || []);
    } catch (error) {
      console.error('Failed to load workspace members', error);
    }
  };
  fetchMembers();
}, [workspaceId]);
```

**Add Custom Role State**:
```typescript
const [customRole, setCustomRole] = useState('');
const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);
```

**Update Role Dropdown** (Lines 231-241):
```typescript
<select
  value={selectedRole}
  onChange={(e) => {
    const value = e.target.value;
    setSelectedRole(value);
    setShowCustomRoleInput(value === 'custom');
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
>
  <option value="member">Member</option>
  <option value="developer">Developer</option>
  <option value="designer">Designer</option>
  <option value="tester">Tester</option>
  <option value="analyst">Analyst</option>
  <option value="qa-engineer">QA Engineer</option>
  <option value="devops">DevOps</option>
  <option value="custom">Custom Role</option>
  {isOwner && !currentPM && (
    <option value="project-manager">Project Manager</option>
  )}
</select>

{showCustomRoleInput && (
  <input
    type="text"
    value={customRole}
    onChange={(e) => setCustomRole(e.target.value)}
    placeholder="Enter custom role (e.g., Technical Lead)"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2"
  />
)}
```

**Update handleAddMember**:
```typescript
const handleAddMember = () => {
  if (!selectedMemberId) return;
  
  const finalRole = selectedRole === 'custom' ? customRole : selectedRole;
  if (!finalRole) return;
  
  onAddMember(selectedMemberId, finalRole);
  setShowAddModal(false);
  setSelectedMemberId('');
  setSelectedRole('member');
  setCustomRole('');
  setShowCustomRoleInput(false);
};
```

### Backend (if needed)

The backend should already support string roles. Just verify that the Project model allows any string for the role field.

---

## Files to Modify

1. `client/src/components/project-tabs/ProjectTeamTab.tsx` - Main changes
2. `client/src/locales/en.json` - Add translation keys for new roles

---

## Testing Steps

1. Open a project
2. Go to Team tab
3. Click "Add Member"
4. Verify real workspace members appear in dropdown
5. Select a member
6. Try different roles (Developer, Designer, etc.)
7. Try "Custom Role" and enter a custom value
8. Add the member
9. Verify they appear in the team list with correct role
10. Check MongoDB to confirm data is saved

---

**This is a complex change. Due to file size, I recommend making these changes manually following this guide.**
