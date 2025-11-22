import re

# Read the file
with open('server/src/models/Workspace.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the user field definition
# Find the pattern: user: {\n      type: String,
# Replace with: user: {\n      type: Schema.Types.ObjectId,\n      ref: 'User',

old_pattern = r"user: \{\r?\n\s+type: String,"
new_text = "user: {\n      type: Schema.Types.ObjectId,\n      ref: 'User',"

content = re.sub(old_pattern, new_text, content, count=1)

# Write back
with open('server/src/models/Workspace.ts', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("✅ Successfully updated Workspace.ts - members.user now references User model")
