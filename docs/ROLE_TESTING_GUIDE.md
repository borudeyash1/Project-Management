# 🧪 ROLE TESTING GUIDE

## 🎯 **ROLE SELECTOR ADDED!**

I've added a **Role Selector** at the top of the project view so you can easily test different user roles and see how the UI changes.

---

## 🔘 **HOW TO USE:**

At the top of any project view, you'll see:

```
🧪 Test Mode - Select Role:
[👑 Owner] [🎯 Manager] [👤 Employee] [👁️ Viewer]
Current: Manager
```

**Click any button to switch roles instantly!**

---

## 👥 **ROLE DIFFERENCES:**

### **👑 OWNER (Purple)**
**Full Access:**
- ✅ See "Add Task" button
- ✅ Create tasks
- ✅ Edit all tasks
- ✅ Delete tasks
- ✅ Review tasks
- ✅ Rate tasks
- ✅ Approve/reject tasks
- ✅ See "Needs Review" badges
- ✅ Access all tabs
- ✅ Manage team
- ✅ View analytics

---

### **🎯 MANAGER (Blue)**
**Management Access:**
- ✅ See "Add Task" button
- ✅ Create tasks
- ✅ Edit all tasks
- ✅ Delete tasks
- ✅ Review tasks
- ✅ Rate tasks
- ✅ Approve/reject tasks
- ✅ See "Needs Review" badges
- ✅ Access all tabs
- ✅ Manage team
- ✅ View analytics

---

### **👤 EMPLOYEE (Green)**
**Limited Access:**
- ❌ NO "Add Task" button
- ❌ Cannot create tasks
- ✅ Can edit ONLY assigned tasks
- ❌ Cannot delete tasks
- ✅ Can update task status
- ✅ Can complete subtasks
- ✅ Can upload files
- ✅ Can add comments
- ✅ Can mark tasks as "Completed" (goes to Review)
- ❌ Cannot see "Needs Review" badges
- ❌ Cannot approve/reject tasks
- ❌ Cannot rate tasks
- ✅ Can view most tabs
- ❌ Limited analytics

---

### **👁️ VIEWER (Gray)**
**Read-Only Access:**
- ❌ NO "Add Task" button
- ❌ Cannot create tasks
- ❌ Cannot edit tasks
- ❌ Cannot delete tasks
- ❌ Cannot update status
- ❌ Cannot complete subtasks
- ❌ Cannot upload files
- ❌ Cannot add comments
- ❌ Cannot approve/reject
- ✅ Can view tasks
- ✅ Can view tabs
- ✅ Can view analytics

---

## 🎨 **VISUAL CHANGES BY ROLE:**

### **Header Changes:**
```
Owner/Manager:
- "Add Task" button visible (Blue)

Employee/Viewer:
- "Add Task" button HIDDEN
```

### **Task List Changes:**
```
Owner/Manager:
- Delete button visible (Red trash icon)
- "Needs Review" badge visible on review tasks
- Can click any task

Employee:
- Delete button HIDDEN
- No "Needs Review" badge
- Can only click assigned tasks

Viewer:
- Delete button HIDDEN
- No "Needs Review" badge
- Can view but not interact
```

### **Task Detail Modal:**
```
Owner/Manager:
- Edit button visible
- Delete button visible
- Status dropdown: All options
- Can add subtasks
- Can remove subtasks
- Full access

Employee:
- Edit button visible (own tasks only)
- Delete button HIDDEN
- Status dropdown: Limited options
- Cannot add/remove subtasks
- Can complete subtasks
- Can upload files

Viewer:
- Edit button HIDDEN
- Delete button HIDDEN
- Status dropdown DISABLED
- Everything read-only
```

### **Task Review Modal:**
```
Owner/Manager:
- Modal opens for "Review" tasks
- Can rate 1-5 stars
- Can approve
- Can reject
- Can add comments

Employee/Viewer:
- Modal does NOT open
- Redirected to TaskDetailModal
```

---

## 🧪 **TESTING SCENARIOS:**

### **Test 1: Create Task**
1. Switch to **Manager** role
2. Click "Add Task" button (should appear)
3. Create a task
4. Switch to **Employee** role
5. "Add Task" button should disappear

### **Test 2: Edit Task**
1. Switch to **Manager** role
2. Click on any task
3. TaskDetailModal opens
4. Edit button visible
5. Switch to **Employee** role
6. Edit button still visible (if assigned)
7. Switch to **Viewer** role
8. Edit button disappears

### **Test 3: Delete Task**
1. Switch to **Manager** role
2. Hover over task
3. Delete button visible (red trash)
4. Switch to **Employee** role
5. Delete button disappears
6. Switch to **Viewer** role
7. Delete button still hidden

### **Test 4: Review Task**
1. Create task as **Manager**
2. Switch to **Employee** role
3. Open task, mark as "Completed"
4. Status changes to "Review"
5. Switch to **Manager** role
6. "Needs Review" badge appears (animated)
7. Click task
8. TaskReviewModal opens
9. Rate and approve
10. Switch to **Employee** role
11. "Needs Review" badge disappears

### **Test 5: Subtasks**
1. Switch to **Manager** role
2. Open task detail
3. Can add new subtasks
4. Can remove subtasks
5. Switch to **Employee** role
6. Cannot add/remove subtasks
7. Can only check/uncheck
8. Switch to **Viewer** role
9. Checkboxes disabled

---

## 📊 **FEATURE MATRIX:**

| Feature | Owner | Manager | Employee | Viewer |
|---------|-------|---------|----------|--------|
| **Create Task** | ✅ | ✅ | ❌ | ❌ |
| **Edit Task** | ✅ | ✅ | ✅* | ❌ |
| **Delete Task** | ✅ | ✅ | ❌ | ❌ |
| **Update Status** | ✅ | ✅ | ✅* | ❌ |
| **Complete Subtasks** | ✅ | ✅ | ✅ | ❌ |
| **Add Subtasks** | ✅ | ✅ | ❌ | ❌ |
| **Upload Files** | ✅ | ✅ | ✅ | ❌ |
| **Add Comments** | ✅ | ✅ | ✅ | ❌ |
| **Review Tasks** | ✅ | ✅ | ❌ | ❌ |
| **Rate Tasks** | ✅ | ✅ | ❌ | ❌ |
| **Approve/Reject** | ✅ | ✅ | ❌ | ❌ |
| **View Analytics** | ✅ | ✅ | Limited | ✅ |
| **Manage Team** | ✅ | ✅ | ❌ | ❌ |

*Only for assigned tasks

---

## 🎯 **QUICK TEST CHECKLIST:**

### **As Manager:**
- [ ] "Add Task" button visible
- [ ] Can create task
- [ ] Can edit any task
- [ ] Can delete any task
- [ ] Can see "Needs Review" badges
- [ ] Can open review modal
- [ ] Can rate tasks
- [ ] Can approve/reject

### **As Employee:**
- [ ] "Add Task" button HIDDEN
- [ ] Cannot create task
- [ ] Can edit assigned tasks
- [ ] Cannot delete tasks
- [ ] Cannot see "Needs Review" badges
- [ ] Cannot open review modal
- [ ] Can update status
- [ ] Can complete subtasks
- [ ] Can upload files

### **As Viewer:**
- [ ] "Add Task" button HIDDEN
- [ ] Cannot create task
- [ ] Cannot edit tasks
- [ ] Cannot delete tasks
- [ ] Cannot update status
- [ ] Cannot complete subtasks
- [ ] Cannot upload files
- [ ] Can only view

---

## 🚀 **HOW TO TEST:**

1. **Open any project**
2. **Look at the top** - You'll see the role selector
3. **Click different roles** - UI updates instantly
4. **Try creating a task:**
   - Manager: Button appears
   - Employee: Button disappears
5. **Try editing a task:**
   - Manager: Full access
   - Employee: Limited access
   - Viewer: Read-only
6. **Try reviewing a task:**
   - Manager: Review modal opens
   - Employee: Detail modal opens
7. **Check delete buttons:**
   - Manager: Visible
   - Employee/Viewer: Hidden

---

## 💡 **TIPS:**

- **Default role:** Manager (so you can test everything)
- **Switch anytime:** Just click the role buttons
- **Instant update:** No page refresh needed
- **Visual feedback:** Active role is highlighted
- **Current role shown:** Check the "Current: X" text

---

## ✅ **RESULT:**

**You can now easily test all role-based UI changes!**

Just switch between roles using the buttons at the top and see how:
- Buttons appear/disappear
- Features enable/disable
- Modals change
- Permissions work

**Happy testing!** 🎉
