import os

def fix_json_file(file_path, append_content):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find the line where the duplicate "activity" starts
    # It should be around line 887, but let's find it dynamically
    # We look for the second occurrence of "activity": {
    
    activity_count = 0
    truncate_index = -1
    
    for i, line in enumerate(lines):
        if '"activity": {' in line:
            activity_count += 1
            if activity_count == 2:
                truncate_index = i
                break
    
    if truncate_index != -1:
        # We found the duplicate start. 
        # The previous line (truncate_index - 1) should be "}," which closes the previous valid section.
        # We want to keep everything up to truncate_index - 1.
        # But wait, the previous section "myWork" ended with "}".
        # The structure is:
        # ...
        # "myWork": { ... }
        # },  <-- This is line 886
        # "activity": { ... } <-- This is line 887 (duplicate)
        
        # So we want to keep lines up to 886 (inclusive).
        # lines[truncate_index] is the duplicate line.
        # So we keep lines[:truncate_index]
        
        # However, the last line we keep is "},".
        # We need to remove the comma if we are closing the object, OR keep it if we are adding more keys.
        # We are adding "tasks" and "projects", so we need the comma.
        # So lines[:truncate_index] should end with "}," which is correct.
        
        valid_lines = lines[:truncate_index]
        
        # Now append the new content
        new_content = "".join(valid_lines) + append_content
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {file_path}")
    else:
        print(f"Could not find duplicate 'activity' section in {file_path}")

ja_append = """    "tasks": {
        "taskBoard": "タスクボード",
        "taskList": "タスクリスト",
        "searchTasks": "タスクを検索...",
        "newTask": "新しいタスク",
        "addTask": "タスクを追加",
        "inProgress": "進行中",
        "blocked": "ブロック済み",
        "noStatusTasks": "{{status}}タスクはありません",
        "dragTasksHere": "ここにタスクをドラッグするか、新しいタスクを作成してください",
        "task": "タスク",
        "dueDate": "期限",
        "timeline": "タイムライン",
        "taskTimeline": "タスクタイムライン",
        "timelineView": "タイムラインビュー",
        "today": "今日",
        "month": "月",
        "newIdeasRequests": "新しいアイデアとリクエスト",
        "dropTasksHere": "ここにタスクをドロップ",
        "assigned": "割り当て済み",
        "inProgressActive": "進行中/アクティブ",
        "qaQc": "QA/QC",
        "recentlyCompleted": "最近完了",
        "scale": "スケール",
        "day": "日",
        "currentTime": "現在時刻",
        "activeTasks": "アクティブタスク",
        "lastCompleted": "最後に完了",
        "completedTasks": "完了したタスク",
        "quickActions": "クイックアクション",
        "addManualNote": "手動メモを追加",
        "createCustomNote": "カスタムメモを作成",
        "generateAiNote": "AIメモを生成",
        "aiPoweredAnalysis": "AI駆動の分析",
        "viewAnalytics": "分析を表示",
        "taskPerformanceInsights": "タスクパフォーマンスインサイト"
    },
    "projects": {
        "allProjects": "すべてのプロジェクト"
    }
}
"""

en_append = """    "tasks": {
        "taskBoard": "Task Board",
        "taskList": "Task List",
        "searchTasks": "Search tasks...",
        "newTask": "New Task",
        "addTask": "Add Task",
        "inProgress": "In Progress",
        "blocked": "Blocked",
        "noStatusTasks": "No {{status}} tasks",
        "dragTasksHere": "Drag tasks here or create new ones",
        "task": "Task",
        "dueDate": "Due Date",
        "timeline": "Timeline",
        "taskTimeline": "Task Timeline",
        "timelineView": "Timeline View",
        "today": "Today",
        "month": "Month",
        "newIdeasRequests": "New Ideas and Requests",
        "dropTasksHere": "Drop tasks here",
        "assigned": "Assigned",
        "inProgressActive": "In Progress/Active",
        "qaQc": "QA/QC",
        "recentlyCompleted": "Recently Completed",
        "scale": "Scale",
        "day": "Day",
        "currentTime": "Current Time",
        "activeTasks": "Active Tasks",
        "lastCompleted": "Last completed",
        "completedTasks": "Completed Tasks",
        "quickActions": "Quick Actions",
        "addManualNote": "Add Manual Note",
        "createCustomNote": "Create a custom note",
        "generateAiNote": "Generate AI Note",
        "aiPoweredAnalysis": "AI-powered analysis",
        "viewAnalytics": "View Analytics",
        "taskPerformanceInsights": "Task performance insights"
    },
    "projects": {
        "allProjects": "All Projects"
    }
}
"""

fix_json_file(r"d:\YASH\Project Management\client\src\locales\ja.json", ja_append)
fix_json_file(r"d:\YASH\Project Management\client\src\locales\en.json", en_append)
