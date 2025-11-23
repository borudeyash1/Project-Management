import json
import sys

# Read the corrupted file
with open('src/locales/en.json', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where the corruption starts (line 714 has ```json)
# We need to keep lines 1-713 and then add proper closing
clean_lines = []
for i, line in enumerate(lines, 1):
    if i < 714:  # Keep everything before the corruption
        clean_lines.append(line)
    elif '```' in line:  # Skip lines with code block markers
        continue
    else:
        break  # Stop at first corrupted section

# Now we need to properly close the JSON
# The last valid line should be line 713 which is the description
# We need to add proper closing for: empty object, activity object, and root object

# Remove the last line if it's incomplete
if clean_lines and not clean_lines[-1].strip().endswith(('}', ']', ',')):
    clean_lines[-1] = clean_lines[-1].rstrip() + '\n'

# Add proper closing
closing = '''        },
        "time": {
            "justNow": "Just now",
            "minutesAgo": "{{count}} minutes ago",
            "hoursAgo": "{{count}} hours ago",
            "daysAgo": "{{count}} days ago"
        },
        "types": {
            "task_completed": "Task Completed",
            "task_created": "Task Created",
            "task_updated": "Task Updated",
            "project_created": "Project Created",
            "project_updated": "Project Updated",
            "team_joined": "Team Joined",
            "milestone_reached": "Milestone Reached",
            "file_uploaded": "File Uploaded",
            "goal_achieved": "Goal Achieved",
            "comment_added": "Comment Added"
        }
    }
}
'''

# Write the clean file
with open('src/locales/en_fixed.json', 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)
    f.write(closing)

print("Fixed JSON file created as en_fixed.json")
print(f"Kept {len(clean_lines)} lines from original file")
