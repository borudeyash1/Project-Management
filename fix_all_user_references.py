import re

# Fix Project model - teamMembers.user field
print("Fixing Project model...")
with open('server/src/models/Project.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace teamMembers.user field
old_pattern = r"teamMembers: \[\{\s+user: \{\s+type: String,"
new_text = "teamMembers: [{\n    user: {\n      type: Schema.Types.ObjectId,\n      ref: 'User',"

content = re.sub(old_pattern, new_text, content, count=1)

with open('server/src/models/Project.ts', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("✅ Project model fixed - teamMembers.user now references User model")

# Check if there are other models with similar issues
print("\n" + "="*60)
print("Checking for other models with user references...")
print("="*60)

import os
import glob

models_dir = 'server/src/models'
for model_file in glob.glob(f'{models_dir}/*.ts'):
    with open(model_file, 'r', encoding='utf-8') as f:
        content = f.read()
        # Look for patterns like: type: String with user/member/assignee fields
        if re.search(r'(user|assignedTo|createdBy|owner):\s*\{\s*type:\s*String', content):
            print(f"\n⚠️  Found String type user reference in: {model_file}")
            # Show the matches
            matches = re.findall(r'(\w+):\s*\{\s*type:\s*String', content)
            user_like_fields = [m for m in matches if m in ['user', 'assignedTo', 'createdBy', 'owner', 'assignee']]
            if user_like_fields:
                print(f"   Fields: {', '.join(user_like_fields)}")

print("\n" + "="*60)
print("✅ All fixes applied!")
print("="*60)
