import re

print("Adding populate calls to inbox controller...")
with open('server/src/controllers/inboxController.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add populate to getConversationMessages
old_pattern = r"(const messages = await Message\.find\(\{[^}]+\}\)\s+\))\s+\.sort\(\{ createdAt: 1 \}\)\s+\.lean\(\);"
new_text = r"\1\n      .populate('sender', 'fullName email username avatarUrl')\n      .populate('recipient', 'fullName email username avatarUrl')\n      .sort({ createdAt: 1 })\n      .lean();"

content = re.sub(old_pattern, new_text, content, flags=re.DOTALL)

with open('server/src/controllers/inboxController.ts', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("✅ Inbox controller updated!")
print("   - Added .populate('sender', 'fullName email username avatarUrl')")
print("   - Added .populate('recipient', 'fullName email username avatarUrl')")
