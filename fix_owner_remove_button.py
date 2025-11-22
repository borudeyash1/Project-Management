import re

# Read the file
with open('client/src/components/workspace-detail/WorkspaceMembersTab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the remove button section
# Old pattern: {canManageMembers && (
#                <button...
# New pattern: {canManageMembers && member.userId !== workspace?.owner && (
#                <button...

old_pattern = r'(\s+){canManageMembers && \(\s+<button\s+onClick=\{\(\) => handleRemoveMember\(member\._id\)\}\s+className="text-red-600 hover:text-red-700 p-1"\s+>\s+<Trash2 className="w-4 h-4" />\s+</button>\s+\)}'

new_text = r'\1{canManageMembers && member.userId !== workspace?.owner && (\n\1  <button\n\1    onClick={() => handleRemoveMember(member._id)}\n\1    className="text-red-600 hover:text-red-700 p-1"\n\1    title="Remove member"\n\1  >\n\1    <Trash2 className="w-4 h-4" />\n\1  </button>\n\1)}'

content = re.sub(old_pattern, new_text, content, flags=re.MULTILINE | re.DOTALL)

# Write back
with open('client/src/components/workspace-detail/WorkspaceMembersTab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Successfully updated WorkspaceMembersTab.tsx - Owner cannot be removed")
