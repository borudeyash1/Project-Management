import re

print("Fixing Message model...")
with open('server/src/models/Message.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix sender field
content = re.sub(
    r'sender: \{\s+type: String,\s+required: true,\s+ref: \'User\',',
    "sender: {\n    type: Schema.Types.ObjectId,\n    required: true,\n    ref: 'User',",
    content,
    count=1
)

# Fix recipient field  
content = re.sub(
    r'recipient: \{\s+type: String,\s+required: true,\s+ref: \'User\',',
    "recipient: {\n    type: Schema.Types.ObjectId,\n    required: true,\n    ref: 'User',",
    content,
    count=1
)

# Fix readBy array
content = re.sub(
    r'readBy: \[\s+\{\s+type: String,\s+ref: \'User\',',
    "readBy: [\n    {\n      type: Schema.Types.ObjectId,\n      ref: 'User',",
    content,
    count=1
)

# Fix workspace field
content = re.sub(
    r'workspace: \{\s+type: String,',
    "workspace: {\n    type: Schema.Types.ObjectId,\n    ref: 'Workspace',",
    content,
    count=1
)

with open('server/src/models/Message.ts', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("✅ Message model fixed!")
print("   - sender: Schema.Types.ObjectId ref User")
print("   - recipient: Schema.Types.ObjectId ref User")
print("   - workspace: Schema.Types.ObjectId ref Workspace")
print("   - readBy: Schema.Types.ObjectId[] ref User")
