import re

# Read the file
with open('client/src/components/ProjectViewDetailed.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Third replacement: isProjectManager prop (the pattern is slightly different)
old_pattern3 = r'''isProjectManager=\{state\.roles\.currentUserRole === 'project-manager' \|\| isProjectManager\}'''

new_text3 = '''isProjectManager={isProjectManager || isWorkspaceOwner}'''

content = re.sub(old_pattern3, new_text3, content)

# Write the file back
with open('client/src/components/ProjectViewDetailed.tsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("File updated successfully!")
