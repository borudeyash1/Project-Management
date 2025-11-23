import os

def fix_extra_brace(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # The debug script said: "Root object closed at Line 886"
    # Line 886 is "},"
    # This "}," was closing the root object in the original file (before my append).
    # But because I appended more keys ("tasks", "projects"), this "}," should NOT close the root.
    # It should close the previous object (which was "tracker" or "myWork" inside "tracker").
    
    # Wait, if line 886 closed the root, it means the indentation was misleading or I misread the structure.
    # If line 886 closes the root, then the previous object closed at 885.
    
    # Let's look at lines 880-890 again.
    # 885:     }
    # 886: },
    # 887:     "tasks": {
    
    # If 886 closes the root, then 885 closed the last child of root.
    # If "tracker" is a child of root.
    # And "myWork" is a child of "tracker".
    # Then we need TWO braces to close "tracker" and then "root".
    # 885: } (closes myWork)
    # 886: } (closes tracker)
    # ... wait, where is the root closer?
    
    # If 886 is "}," and it closes root... root shouldn't have a comma if it's the end.
    # But I added content, so maybe the comma is fine IF we are inside another object?
    # No, root is the top level.
    
    # The issue is that I have an EXTRA closing brace sequence.
    # If "tracker" ends at 886.
    # And "root" ends... later?
    
    # The debug script says "Root object closed at Line 886".
    # This means the stack became empty at line 886.
    # This means we had balanced braces up to line 886.
    
    # If I want to add "tasks" as a sibling of "tracker" (inside root),
    # I must NOT close the root at 886.
    # I must close "tracker" at 886, but keep root OPEN.
    
    # So, if stack is empty at 886, it means I closed one too many things.
    # Or I started with one too few things.
    
    # Let's look at the file content again.
    # If "tracker" starts at 728.
    # And "myWork" starts at 871.
    # And "myWork" ends at 885.
    # Then 886 closes "tracker".
    # So we have closed "myWork" and "tracker".
    # If "tracker" is a top level key, then we are back to root.
    # So stack should contain 1 item (the root brace).
    
    # BUT the debug script says stack is EMPTY at 886.
    # This implies that "tracker" was NOT a top level key?
    # OR that I missed a starting brace?
    
    # Wait, if "tracker" is top level, then:
    # Line 1: { (stack: 1)
    # ...
    # Line 728: "tracker": { (stack: 2)
    # ...
    # Line 885: } (closes myWork, stack: 2)
    # Line 886: }, (closes tracker, stack: 1)
    
    # If stack is 1, it is NOT empty.
    # So why did debug script say "Root object closed at Line 886"?
    # "Root object closed" means stack became empty.
    
    # This implies that at line 886, stack went from 1 to 0.
    # This implies that before 886, stack was 1.
    # This implies that at 885, stack was 1?
    # If at 885 stack was 1, then 885 closed "tracker"?
    # And 886 closed "root"?
    
    # If 885 closed "tracker", then "myWork" must have closed earlier.
    # Let's check 885 again.
    # 885:     }
    # Indentation 4 spaces.
    # "myWork" started at 871 with indentation 4 spaces?
    # No, "myWork" is usually inside "tracker".
    # "tracker" (728) has indentation 4 spaces? No, top level keys usually have 4 spaces indentation in this file?
    # Let's check line 2: "common": {
    # Indentation 4 spaces.
    # So root { is at line 1.
    
    # So "tracker" (728) is at indentation 4.
    # "myWork" (871) is at indentation 8?
    # Let's check Step 2876.
    # 871:     "myWork": {
    # It looks like 4 spaces?
    # If "tracker" is at 4 spaces.
    # And "myWork" is at 4 spaces.
    # Then "myWork" is a SIBLING of "tracker"?
    # But "myWork" was inside "tracker" in my previous analysis?
    
    # If "myWork" is a sibling of "tracker", then "tracker" must have closed before 871.
    # In Step 2876:
    # 870:     },
    # 871:     "myWork": {
    # If 870 closed "tracker", then "myWork" is a sibling.
    # Then 885 } closes "myWork".
    # Then 886 }, closes... what?
    # If "myWork" is top level (child of root).
    # Then 885 closes "myWork".
    # Then 886 closes... nothing? Or it closes root?
    
    # If 886 closes root, then it should be just } (no comma).
    # But it is },
    # And then I appended "tasks": { ...
    
    # If 886 closes root, then stack is 0.
    # Then "tasks" is outside root.
    
    # So, the fix is to REMOVE the closing brace at 886 if it closes the root.
    # BUT we need to close the previous object ("myWork" or "tracker").
    # If 885 closed "myWork".
    # And "myWork" is top level.
    # Then we are back to root (stack 1).
    # Then 886 }, closes root? No, }, implies continuation.
    # But } closes the block.
    
    # If 886 is }, and it decrements stack.
    # If stack goes to 0, it means we closed the root.
    
    # I suspect that "tracker" was closed at 870.
    # And "myWork" (871) is a top level key.
    # And "myWork" closes at 885.
    # And then 886 }, closes... wait.
    # If 885 closes "myWork", we are at stack 1 (root open).
    # Then 886 }, ... if this is interpreted as closing root, then stack becomes 0.
    # But }, is invalid for closing root if there is no more content.
    # But I added content.
    
    # Wait, if stack is 1.
    # And we encounter },
    # Stack becomes 0.
    # So we closed root.
    # But we have a comma.
    # JSON does not allow a comma after the root object.
    
    # So, line 886 }, is closing the root AND adding a comma.
    # This is why "tasks" is outside.
    
    # The FIX is:
    # We want "tasks" to be INSIDE the root.
    # So we should NOT close the root at 886.
    # We should just have a comma to separate "myWork" (or whatever previous key) from "tasks".
    # But "myWork" closed at 885 with }.
    # So we just need a comma at 886?
    # No, 885 is just }
    # So we need , to start next key.
    
    # So 886 should be just , (comma).
    # OR 885 should be },
    
    # Currently 886 is },
    # This means it closes SOMETHING and adds a comma.
    # If it closes root, that's bad.
    # If it closes "myWork", then 885 was what?
    # 885 was }.
    # So 885 closes "inner thing".
    # 886 closes "outer thing".
    
    # If "myWork" is top level.
    # Then 885 closes "myWork".
    # Then 886 }, closes root?
    # If 886 closes root, then we are out.
    
    # I need to remove the brace at 886.
    # I should change 886 from }, to , (or just ensure 885 has a comma).
    
    # Let's try to remove line 886 entirely and ensure 885 has a comma.
    # Or change 886 to just , (but that might be syntax error if on new line).
    # Actually, if 885 is }, then we are good.
    
    # Let's check 885 again.
    # 885:     }
    # If I change 885 to },
    # And remove 886.
    # Then "tasks" follows.
    # This would mean "myWork" (or whatever) is a sibling of "tasks".
    # And both are children of root.
    # This seems correct.
    
    # So the plan:
    # 1. Read file.
    # 2. Identify line 886 (which is },).
    # 3. Identify line 885 (which is }).
    # 4. Change 885 to },
    # 5. Remove 886.
    # 6. Save.
    
    # Wait, I need to be careful about line numbers shifting.
    # I will search for the sequence:
    #     }
    # },
    #     "tasks": {
    
    # And replace it with:
    #     },
    #     "tasks": {
    
    content = "".join(lines)
    
    # We look for the transition point.
    # It looks like:
    # "stopTimer": "..."
    #     }
    # },
    #     "tasks": {
    
    # In ja.json:
    # "stopTimer": "タイマーを停止"
    #     }
    # },
    #     "tasks": {
    
    # In en.json:
    # "stopTimer": "Stop Timer"
    #     }
    # },
    #     "tasks": {
    
    # I'll use a generic replacement that handles whitespace.
    
    import re
    
    # Regex to find:
    # (stopTimer line)
    # \s*}
    # \s*},
    # \s*"tasks"
    
    # We want to remove the extra },
    
    # Actually, simpler:
    # Find:
    #     }
    # },
    #     "tasks":
    
    # Replace with:
    #     },
    #     "tasks":
    
    # Let's try string replacement first as it's safer if exact match.
    
    target_ja = '        "stopTimer": "タイマーを停止"\n    }\n},\n    "tasks": {'
    replace_ja = '        "stopTimer": "タイマーを停止"\n    },\n    "tasks": {'
    
    target_en = '        "stopTimer": "Stop Timer"\n    }\n},\n    "tasks": {'
    replace_en = '        "stopTimer": "Stop Timer"\n    },\n    "tasks": {'
    
    if target_ja in content:
        content = content.replace(target_ja, replace_ja)
        print(f"Fixed {file_path} (JA pattern)")
    elif target_en in content:
        content = content.replace(target_en, replace_en)
        print(f"Fixed {file_path} (EN pattern)")
    else:
        # Try a more loose match if indentation varies
        # We know line 886 is },
        # We know line 887 is "tasks": {
        # We want to remove line 886.
        # But we need to ensure line 885 has a comma.
        
        # Let's do it by line index if we are sure.
        # The debug script said error at 886.
        # So line 885 (0-indexed) is },
        
        # Let's check lines around 886.
        # lines[885] is "}," (1-based 886)
        # lines[884] is "    }" (1-based 885)
        
        if lines[885].strip() == "}," and '"tasks": {' in lines[886]:
            # We found the spot.
            # Remove line 885 (the },)
            # Add comma to line 884 (the })
            
            lines[884] = lines[884].rstrip() + ",\n"
            del lines[885]
            content = "".join(lines)
            print(f"Fixed {file_path} by line index")
        else:
            print(f"Could not find pattern in {file_path}")
            return

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_extra_brace(r"d:\YASH\Project Management\client\src\locales\ja.json")
fix_extra_brace(r"d:\YASH\Project Management\client\src\locales\en.json")
