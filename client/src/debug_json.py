import json
import sys

def validate_json(file_path):
    print(f"Validating {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Try to parse
        json.loads(content)
        print("JSON is valid.")
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"Error at line {e.lineno}, column {e.colno}")
        print(f"Position: {e.pos}")
        
        # Show context
        lines = content.splitlines()
        start = max(0, e.lineno - 5)
        end = min(len(lines), e.lineno + 5)
        for i in range(start, end):
            prefix = ">> " if i + 1 == e.lineno else "   "
            print(f"{prefix}{i+1}: {lines[i]}")

def debug_structure(file_path):
    print(f"\nDebugging structure of {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    for i, line in enumerate(lines):
        line = line.strip()
        for char in line:
            if char == '{':
                stack.append(f"Line {i+1}")
            elif char == '}':
                if stack:
                    stack.pop()
                else:
                    print(f"Error: Extra closing brace at Line {i+1}")
                    return
        
        if not stack and i < len(lines) - 1:
            # Stack is empty but we are not at the end of the file
            # Check if the rest of the file is just whitespace
            remaining = "".join(lines[i+1:]).strip()
            if remaining:
                print(f"Root object closed at Line {i+1}, but there is more content.")
                print(f"Next non-empty line: {lines[i+1].strip()}")
                return

    if stack:
        print(f"Error: Unclosed braces. Stack: {stack}")
    else:
        print("Structure check passed (balanced braces).")

validate_json(r"d:\YASH\Project Management\client\src\locales\ja.json")
debug_structure(r"d:\YASH\Project Management\client\src\locales\ja.json")
validate_json(r"d:\YASH\Project Management\client\src\locales\en.json")
debug_structure(r"d:\YASH\Project Management\client\src\locales\en.json")
