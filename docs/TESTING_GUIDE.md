# 🧪 COMPREHENSIVE TESTING GUIDE

## 📋 **COMPLETE FEATURE TESTING CHECKLIST**

---

## 🎯 **HOW TO TEST:**

### **Setup:**
1. Open browser (Chrome/Firefox/Edge)
2. Navigate to the application
3. Use the **Role Switcher** (bottom-right corner) to test different roles
4. Clear browser cache if needed

---

## ✅ **TEST SCENARIOS:**

### **1. ROLE SWITCHING** 🔄

#### **Test Steps:**
1. Look for Role Switcher in bottom-right corner
2. Click "Workspace Owner" → Should highlight with green "Active" badge
3. Click "Project Manager" → Should switch and highlight
4. Click "Employee" → Should switch and highlight
5. Check that current user ID updates

#### **Expected Results:**
- ✅ Role buttons highlight correctly
- ✅ Active badge shows on selected role
- ✅ User ID changes for each role
- ✅ UI updates based on role permissions

---

### **2. PROJECT CREATION** (Owner Only) 📁

#### **Test Steps:**
1. Switch to **Workspace Owner** role
2. Go to Projects tab
3. Click "Create Project" button (should be visible)
4. Fill in project details:
   - Name: "Test Project"
   - Description: "Testing project creation"
   - Client: Select from dropdown
   - Status: Active
   - Start Date: Today
   - Due Date: Next month
5. Click "Create Project"

#### **Expected Results:**
- ✅ "Create Project" button visible for Owner
- ✅ Form opens with all fields
- ✅ Can select client from dropdown
- ✅ Project created successfully
- ✅ Project appears in list

#### **Negative Test:**
1. Switch to **Project Manager** role
2. Go to Projects tab
3. "Create Project" button should be **hidden**

---

### **3. TASK CREATION WITH TYPES** ✏️

#### **Test Each Task Type:**

##### **A. General Task:**
1. Switch to **Project Manager** role
2. Open a project
3. Go to Tasks tab
4. Click "Add Task"
5. Fill in:
   - Title: "Build Login Page"
   - Description: "Create authentication UI"
   - **Task Type: General Task**
   - Assign To: Select employee
   - Priority: High
   - Due Date: Next week
6. Click "Assign Task"

**Expected:**
- ✅ Task created with 📋 General badge
- ✅ No progress bar in creation form
- ✅ Task appears in task list
- ✅ Badge shows gray color

##### **B. File Submission Task:**
1. Click "Add Task"
2. Fill in:
   - Title: "Submit Design Files"
   - **Task Type: File Submission**
   - Assign To: Employee
3. Notice helper text: "Employee must upload file(s) to complete"
4. Click "Assign Task"

**Expected:**
- ✅ Task created with 📎 File Required badge
- ✅ Purple badge color
- ✅ `requiresFile` flag set automatically

##### **C. Link Submission Task:**
1. Click "Add Task"
2. Fill in:
   - Title: "Submit GitHub PR"
   - **Task Type: Link Submission**
3. Notice helper text: "Employee must provide link(s) to complete"
4. Click "Assign Task"

**Expected:**
- ✅ Task created with 🔗 Link Required badge
- ✅ Indigo badge color
- ✅ `requiresLink` flag set automatically

##### **D. Status Update Task:**
1. Click "Add Task"
2. Fill in:
   - Title: "Daily Status Update"
   - **Task Type: Status Update**
3. Notice helper text: "Employee provides status updates only"
4. Click "Assign Task"

**Expected:**
- ✅ Task created with 📝 Status Update badge
- ✅ Blue badge color

##### **E. Review Task:**
1. Click "Add Task"
2. Fill in:
   - Title: "Review API Documentation"
   - **Task Type: Review/Approval**
3. Notice helper text: "Requires review and approval from PM"
4. Click "Assign Task"

**Expected:**
- ✅ Task created with 👁️ Review badge
- ✅ Yellow badge color

---

### **4. EMPLOYEE TASK VIEW** 👤

#### **Test Steps:**
1. Switch to **Employee** role
2. Go to Tasks tab
3. Should see "My Tasks" view (NOT task assignment interface)

#### **Expected Results:**
- ✅ Only sees tasks assigned to them
- ✅ Statistics cards show: Total, In Progress, Completed, Overdue
- ✅ Filter dropdown visible (All, Pending, In Progress, etc.)
- ✅ Task type badges visible on each task
- ✅ **NO "Add Task" button** (employees can't create tasks)
- ✅ Can expand/collapse tasks
- ✅ Can change task status via dropdown

---

### **5. FILE UPLOAD (Employee)** 📎

#### **Test Steps:**
1. Switch to **Employee** role
2. Find a task with **📎 File Required** badge
3. Click to expand task
4. Should see **purple section**: "Upload Required Files"
5. Click "Choose Files"
6. Select multiple files (e.g., test.pdf, image.png)
7. Files should upload automatically
8. See files listed with names
9. Click "Remove" on one file
10. File should disappear from list

#### **Expected Results:**
- ✅ Purple upload section visible
- ✅ File picker opens
- ✅ Multiple files can be selected
- ✅ Files appear in list immediately
- ✅ Each file has "Remove" button
- ✅ Remove works correctly
- ✅ Section only shows for file-submission tasks
- ✅ Section hides when task is finished

---

### **6. LINK SUBMISSION (Employee)** 🔗

#### **Test Steps:**
1. Switch to **Employee** role
2. Find a task with **🔗 Link Required** badge
3. Click to expand task
4. Should see **indigo section**: "Submit Required Links"
5. Enter URL: `https://github.com/test/pr/123`
6. Click "Add" button
7. Link should appear in list below
8. Link should be clickable (opens in new tab)
9. Click "Remove" on the link
10. Link should disappear

#### **Expected Results:**
- ✅ Indigo link section visible
- ✅ URL input field present
- ✅ "Add" button works
- ✅ Links appear in list
- ✅ Links are clickable
- ✅ Links open in new tab
- ✅ Remove button works
- ✅ Can add multiple links
- ✅ Section only shows for link-submission tasks

---

### **7. STATUS UPDATES (Employee)** 📝

#### **Test Steps:**
1. Switch to **Employee** role
2. Find a task with **📝 Status Update** badge
3. Click to expand task
4. Should see **blue section**: "Provide Status Update"
5. Type in textarea:
   ```
   Completed API integration.
   Working on error handling.
   Blocked on database access.
   ```
6. Click "Submit Update"
7. Should see confirmation alert

#### **Expected Results:**
- ✅ Blue status section visible
- ✅ Textarea for multi-line input
- ✅ "Submit Update" button present
- ✅ Can type multiple lines
- ✅ Submit button works
- ✅ Confirmation shown
- ✅ Section only shows for status-update tasks

---

### **8. SUBTASKS (Employee)** ✅

#### **Test Steps:**
1. Switch to **Employee** role
2. Find a **General Task** with subtasks
3. Expand the task
4. Should see subtasks section with checkboxes
5. Click checkbox on first subtask
6. Subtask should get strikethrough
7. Progress bar should update
8. Uncheck the subtask
9. Progress should decrease

#### **Expected Results:**
- ✅ Subtasks section visible
- ✅ Checkboxes work
- ✅ Completed subtasks get strikethrough
- ✅ Progress auto-calculates
- ✅ Progress bar updates visually
- ✅ Can toggle subtasks on/off
- ✅ Cannot edit if task is finished

---

### **9. TASK STATUS CHANGE (Employee)** 🔄

#### **Test Steps:**
1. Switch to **Employee** role
2. Find any task
3. Click status dropdown (shows current status)
4. Change from "Pending" to "In Progress"
5. Badge color should change to blue
6. Change to "Completed"
7. Badge color should change to green
8. Try changing to "Blocked"
9. Badge color should change to red

#### **Expected Results:**
- ✅ Status dropdown visible and clickable
- ✅ Can select different statuses
- ✅ Badge color updates immediately
- ✅ Status saves correctly
- ✅ Cannot change if task is finished
- ✅ Cannot change if verified (locked)

---

### **10. TASK VERIFICATION (PM)** ✔️

#### **Test Steps:**
1. Switch to **Project Manager** role
2. Find a task with status "Completed"
3. Should see "Verify Task" button
4. Click "Verify Task"
5. Task status should change to "Verified"
6. Badge should turn purple
7. "Rate & Finish" button should appear

#### **Expected Results:**
- ✅ "Verify Task" button visible for completed tasks
- ✅ Click changes status to verified
- ✅ Badge updates to purple
- ✅ "Rate & Finish" button appears
- ✅ Only PM/Owner can verify

---

### **11. COMPREHENSIVE RATING (PM)** ⭐

#### **Test Steps:**
1. Switch to **Project Manager** role
2. Find a verified task
3. Click "Rate & Finish" button
4. Rating modal should open
5. Rate each criterion:
   - **Timeliness:** Click 4 stars
   - **Quality:** Click 5 stars
   - **Communication:** Click 4 stars
   - **Completeness:** Click 5 stars
6. Check overall rating calculation: (4+5+4+5)/4 = 4.5
7. Add comment: "Great work! Excellent quality."
8. Click "Submit Evaluation"

#### **Expected Results:**
- ✅ Modal opens with 4 rating sections
- ✅ Each section has 5 stars
- ✅ Stars highlight when clicked
- ✅ Overall rating calculates correctly (shows 4.5)
- ✅ Comments textarea works
- ✅ Submit button disabled until all rated
- ✅ Submit button enables when all 4 criteria rated
- ✅ Task marked as finished
- ✅ Rating displays on task card

---

### **12. CLIENT MANAGEMENT (Owner Only)** 👥

#### **Test Steps:**
1. Switch to **Workspace Owner** role
2. Go to Clients tab
3. Should see "Add Client" button
4. Click "Add Client"
5. Fill in client details
6. Click "Save"
7. Client appears in list
8. Click "Edit" on client
9. Modify details
10. Click "Delete" on client

#### **Expected Results:**
- ✅ "Add Client" button visible for Owner
- ✅ Can create new clients
- ✅ Can edit existing clients
- ✅ Can delete clients
- ✅ All buttons work correctly

#### **Negative Test:**
1. Switch to **Project Manager** role
2. Go to Clients tab
3. "Add Client" button should be **hidden**
4. "Edit" and "Delete" buttons should be **hidden**
5. Can only view clients

---

### **13. TEAM MANAGEMENT** 👥

#### **Test Steps:**
1. Switch to **Project Manager** role
2. Open a project
3. Go to Team tab
4. Click "Add Member"
5. Select member from workspace
6. Select role (Employee/Viewer)
7. Click "Add"
8. Member appears in team list
9. Try to add another PM (should show warning)
10. Remove a team member

#### **Expected Results:**
- ✅ Can add team members
- ✅ Role selection works
- ✅ Only one PM allowed per project
- ✅ Warning shown if trying to add second PM
- ✅ Can remove members
- ✅ Team list updates immediately

---

### **14. OVERDUE TASKS** ⚠️

#### **Test Steps:**
1. Create a task with due date in the past
2. Switch to **Employee** role
3. Find the task in "My Tasks"
4. Task should have:
   - Red border
   - Red background tint
   - ⚠️ Overdue badge
   - Red due date text

#### **Expected Results:**
- ✅ Overdue tasks visually distinct
- ✅ Red border and background
- ✅ Overdue badge visible
- ✅ Due date in red
- ✅ Shows in statistics as "Overdue"

---

### **15. TASK FILTERING** 🔍

#### **Test Steps:**
1. Switch to **Employee** role
2. Go to Tasks tab
3. Use filter dropdown:
   - Select "Pending" → Only pending tasks show
   - Select "In Progress" → Only in-progress tasks show
   - Select "Completed" → Only completed tasks show
   - Select "All" → All tasks show
4. Check statistics update with filter

#### **Expected Results:**
- ✅ Filter dropdown works
- ✅ Tasks filter correctly
- ✅ Statistics update based on filter
- ✅ No tasks message shows if filter returns empty

---

### **16. PROGRESS TRACKING** 📊

#### **Test Steps:**
1. Create a task with 5 subtasks
2. Complete 2 subtasks
3. Progress should show 40%
4. Progress bar should be 40% filled
5. Complete 2 more subtasks
6. Progress should show 80%
7. Complete last subtask
8. Progress should show 100%

#### **Expected Results:**
- ✅ Progress calculates correctly
- ✅ Formula: (completed / total) * 100
- ✅ Progress bar visual matches percentage
- ✅ Updates in real-time
- ✅ Shows on both PM and Employee views

---

### **17. TASK TYPE BADGES** 🏷️

#### **Test Steps:**
1. View tasks with different types
2. Check badge display:
   - 📋 General → Gray badge
   - 📝 Status Update → Blue badge
   - 📎 File Required → Purple badge
   - 🔗 Link Required → Indigo badge
   - 👁️ Review → Yellow badge

#### **Expected Results:**
- ✅ All badges display correctly
- ✅ Icons show properly
- ✅ Colors match specification
- ✅ Badges visible on all task cards
- ✅ Consistent across PM and Employee views

---

### **18. RESPONSIVE DESIGN** 📱

#### **Test Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)
4. Check all features work on each size

#### **Expected Results:**
- ✅ Layout adapts to screen size
- ✅ No horizontal scrolling
- ✅ Buttons remain clickable
- ✅ Text remains readable
- ✅ Forms are usable
- ✅ Modals fit screen

---

### **19. EDGE CASES** ⚠️

#### **Test Scenarios:**

##### **A. Empty States:**
- No tasks assigned → Shows "No tasks" message
- No subtasks → Subtasks section hidden
- No links → Links section hidden
- No files → Files section hidden

##### **B. Long Text:**
- Very long task title → Truncates properly
- Very long description → Scrollable
- Very long link → Truncates with ellipsis

##### **C. Special Characters:**
- Task title with emojis → Displays correctly
- Description with HTML → Escapes properly
- URLs with parameters → Links work

##### **D. Concurrent Actions:**
- Multiple users editing same task
- Rapid status changes
- Quick subtask toggling

---

### **20. PERFORMANCE** ⚡

#### **Test Steps:**
1. Create 50+ tasks
2. Check page load time
3. Test scrolling performance
4. Test filter performance
5. Test search performance

#### **Expected Results:**
- ✅ Page loads in < 2 seconds
- ✅ Smooth scrolling
- ✅ Filters apply instantly
- ✅ No lag or freezing
- ✅ Animations smooth

---

## 🐛 **BUG REPORTING TEMPLATE:**

```markdown
**Bug Title:** [Short description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Role:** [Owner/PM/Employee]

**Browser:** [Chrome/Firefox/Edge]

**Screenshot:** [If applicable]

**Priority:** [High/Medium/Low]
```

---

## ✅ **TESTING CHECKLIST:**

### **Core Features:**
- [ ] Role switching works
- [ ] Project creation (Owner only)
- [ ] Task creation with all types
- [ ] Employee task view
- [ ] File upload
- [ ] Link submission
- [ ] Status updates
- [ ] Subtasks
- [ ] Task status changes
- [ ] Task verification
- [ ] Comprehensive rating
- [ ] Client management
- [ ] Team management

### **UI/UX:**
- [ ] Task type badges
- [ ] Color coding
- [ ] Hover effects
- [ ] Loading states
- [ ] Empty states
- [ ] Error messages
- [ ] Success messages
- [ ] Responsive design

### **Permissions:**
- [ ] Owner permissions
- [ ] PM permissions
- [ ] Employee permissions
- [ ] Button visibility
- [ ] Action restrictions
- [ ] View restrictions

### **Edge Cases:**
- [ ] Empty states
- [ ] Long text
- [ ] Special characters
- [ ] Overdue tasks
- [ ] Finished tasks
- [ ] Concurrent actions

---

## 🎯 **TESTING PRIORITIES:**

### **P0 (Critical):**
1. Role switching
2. Task creation
3. File upload
4. Link submission
5. Task status changes

### **P1 (High):**
6. Rating system
7. Employee view
8. Permissions
9. Subtasks
10. Verification

### **P2 (Medium):**
11. Filters
12. Progress tracking
13. Team management
14. Client management
15. Overdue detection

### **P3 (Low):**
16. UI polish
17. Animations
18. Empty states
19. Error messages
20. Performance

---

## 📊 **TEST RESULTS TEMPLATE:**

```markdown
## Test Session: [Date]

**Tester:** [Name]
**Duration:** [Time]
**Browser:** [Browser + Version]

### Results:
- ✅ Passed: [X]
- ❌ Failed: [Y]
- ⚠️ Issues: [Z]

### Critical Bugs:
1. [Bug description]

### Minor Issues:
1. [Issue description]

### Suggestions:
1. [Improvement idea]
```

---

**Happy Testing!** 🧪✨

**Report any issues found and I'll fix them immediately!**
