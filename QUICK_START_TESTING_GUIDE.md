# 🚀 QUICK START TESTING GUIDE

## ⚡ **START TESTING IN 60 SECONDS!**

---

## 📍 **STEP 1: Open the Application**

1. Make sure your dev server is running
2. Navigate to: `http://localhost:3000`
3. Login if needed

---

## 📍 **STEP 2: Navigate to a Project**

```
Home → Manage Workspace → Visit Workspace → Projects Tab → Click "View" on any project
```

**OR**

Direct URL: `http://localhost:3000/project/{projectId}/overview`

---

## 📍 **STEP 3: Find the Role Switcher**

Look at the **BOTTOM-RIGHT CORNER** of your screen.

You should see a floating widget with:
- 👑 **Workspace Owner** (yellow)
- 🛡️ **Project Manager** (purple) ← Should be active by default
- 👤 **Employee** (blue)

---

## 🎯 **COMPLETE WORKFLOW TEST (2 minutes)**

### **Test 1: Assign a Task (As Project Manager)**

**Current Role:** Project Manager (default)

1. Click on **"Tasks & Board"** tab
2. Click **"Assign New Task"** button
3. Fill in the form:
   ```
   Task Title: "Build Login Feature"
   Description: "Create user authentication system"
   Assign To: Select "Bob Wilson - developer"
   Status: "pending"
   Priority: "high"
   Start Date: Today
   Due Date: 3 days from now
   Progress: 0%
   ```
4. Click **"Assign Task"**
5. ✅ You should see a success toast!
6. ✅ Task appears in the task list!

---

### **Test 2: View Task as Employee**

**Switch Role:** Click "Employee" in the role switcher

1. Role switcher shows **"Bob Wilson (Employee)"** as active
2. Stay on **"Tasks & Board"** tab
3. ✅ You should see "Build Login Feature" in the list!
4. ✅ Task shows assigned to "Bob Wilson"
5. ✅ Priority and deadline are correct

---

### **Test 3: Create a Request (As Employee)**

**Current Role:** Employee

1. Click on **"Workload"** tab
2. You should see **"My Requests"** section
3. Click **"New Request"** button
4. Fill in the form:
   ```
   Request Type: "Deadline Extension"
   Select Task: "Build Login Feature"
   Reason: "Need more time for testing and security review"
   Requested New Deadline: 7 days from now
   ```
5. Click **"Submit Request"**
6. ✅ Success toast appears!
7. ✅ Request shows up with "Pending" status

---

### **Test 4: Approve Request (As Project Manager)**

**Switch Role:** Click "Project Manager" in the role switcher

1. Role switcher shows **"Jane Smith (PM)"** as active
2. Stay on **"Workload"** tab
3. You should see **"Pending Requests"** section
4. ✅ You see Bob Wilson's request!
5. Review the request details:
   - Task: Build Login Feature
   - Reason: Need more time...
   - Current deadline vs requested deadline
6. Click **"Approve"** button
7. ✅ Success toast appears!
8. ✅ Request disappears from pending list

---

### **Test 5: Verify Approval (As Employee)**

**Switch Role:** Click "Employee" in the role switcher

1. Go to **"Workload"** tab
2. ✅ Your request now shows **"Approved"** status!
3. ✅ Green checkmark badge visible

---

## 🎊 **CONGRATULATIONS!**

**You just completed a full workflow:**
- ✅ PM assigned a task
- ✅ Employee viewed the task
- ✅ Employee requested deadline extension
- ✅ PM approved the request
- ✅ Employee saw the approval

**Total time: ~2 minutes!** 🚀

---

## 🔥 **QUICK TESTS YOU CAN TRY:**

### **Test A: Reject a Request**
1. As Employee: Create another request
2. As PM: Switch to Project Manager
3. Click "Reject" instead of "Approve"
4. Provide a reason: "Client deadline is fixed"
5. Switch back to Employee
6. ✅ See rejection with reason!

### **Test B: Reassign a Task**
1. As PM: Go to Tasks tab
2. Click "Edit" on any task
3. Change "Assign To" to a different team member
4. Click "Update Task"
5. ✅ Task reassigned!

### **Test C: Delete a Task**
1. As PM: Go to Tasks tab
2. Click "Delete" (trash icon) on a task
3. Confirm deletion
4. ✅ Task removed!

### **Test D: Workload Redistribution**
1. As Employee: Create request
2. Select type: "Workload Redistribution"
3. Select a task
4. Reason: "Already handling 5 tasks"
5. Submit
6. Switch to PM
7. ✅ PM sees workload request!

---

## 📋 **FEATURES TO TEST:**

### **As Project Manager:**
- [ ] Create task
- [ ] Edit task (title, description, assignee)
- [ ] Delete task
- [ ] Change task priority
- [ ] Update task deadline
- [ ] Reassign task to different employee
- [ ] View all pending requests
- [ ] Approve deadline extension request
- [ ] Reject workload redistribution request
- [ ] View team members list
- [ ] Access all tabs

### **As Employee:**
- [ ] View assigned tasks
- [ ] Create deadline extension request
- [ ] Create workload redistribution request
- [ ] View request status
- [ ] See approved requests
- [ ] See rejected requests with reason
- [ ] Limited tab access (no Settings/Team)

### **As Workspace Owner:**
- [ ] Full access to everything
- [ ] Can assign tasks like PM
- [ ] Can approve requests like PM
- [ ] Access to Settings tab
- [ ] Access to Team tab

---

## 🎮 **ROLE SWITCHER GUIDE:**

### **Visual Indicators:**
- **Active Role:** Darker background + border + "Active" badge
- **Inactive Roles:** Light gray background
- **Current User Info:** Shows at bottom of switcher

### **User Mappings:**
```
Owner → John Doe (user_owner_123)
Project Manager → Jane Smith (user_pm_456)
Employee → Bob Wilson (user_emp_789)
```

### **What Changes When You Switch:**
- ✅ User ID updates
- ✅ User name updates
- ✅ Permissions change
- ✅ Visible tabs change
- ✅ Available actions change

---

## 💡 **TIPS FOR TESTING:**

1. **Use the Role Switcher Liberally**
   - Switch back and forth to see different views
   - Perfect for testing workflows

2. **Check the Toasts**
   - Success/error messages appear top-right
   - Confirm actions worked correctly

3. **Look for Visual Feedback**
   - Status badges (pending/approved/rejected)
   - Priority colors (low/medium/high/critical)
   - Active role highlighting

4. **Test Edge Cases**
   - Try creating request without selecting task
   - Try assigning task without assignee
   - Validation should prevent submission

5. **Verify Data Persistence**
   - Refresh the page
   - Check if data is still there
   - (Currently in-memory, will persist in production)

---

## ❌ **COMMON ISSUES & FIXES:**

### **Issue: Role Switcher not visible**
**Fix:** Check bottom-right corner, it's a floating widget

### **Issue: No team members in dropdown**
**Fix:** Project has mock team members automatically added

### **Issue: Tasks not appearing for employee**
**Fix:** Make sure you're selecting the same user ID when assigning

### **Issue: Request not showing for PM**
**Fix:** Ensure you switched roles AFTER creating the request

---

## 🎯 **EXPECTED BEHAVIORS:**

### **Tabs Visibility by Role:**

**Workspace Owner:**
- ✅ All tabs visible

**Project Manager:**
- ✅ Overview, Info, Team, Tasks, Timeline, Progress, Workload, Reports, Documents
- ✅ Inbox (coming soon), Settings (coming soon)

**Employee:**
- ✅ Overview, Info, Tasks, Timeline, Progress, Workload, Reports, Documents
- ❌ No Team tab
- ❌ No Settings tab
- ❌ No Inbox tab

### **Task Assignment Interface:**

**Project Manager View:**
- ✅ "Assign New Task" button
- ✅ Edit/Delete buttons on tasks
- ✅ Full task management interface

**Employee View:**
- ✅ View task details
- ❌ No assignment interface
- ❌ Can't edit/delete tasks

### **Requests Interface:**

**Employee View:**
- ✅ "New Request" button
- ✅ "My Requests" section
- ✅ Request creation form

**Project Manager View:**
- ✅ "Pending Requests" section
- ✅ Approve/Reject buttons
- ✅ Request details
- ❌ No "New Request" button

---

## 📱 **MOBILE TESTING:**

The role switcher is responsive:
- Desktop: Bottom-right corner
- Mobile: May overlap content (testing tool only)
- Swipe/scroll to access if needed

---

## 🚀 **NEXT STEPS AFTER TESTING:**

1. **Add Real Authentication**
   - Connect to your auth system
   - Use real user IDs
   - Remove role switcher

2. **Add Database Integration**
   - Save tasks to backend API
   - Store requests in database
   - Persist user actions

3. **Add Notifications**
   - Email on task assignment
   - Alert on request approval/rejection
   - Deadline reminders

4. **Add More Features**
   - Task comments
   - File uploads
   - Task dependencies
   - Subtasks management

---

## 📊 **DATA STRUCTURE REFERENCE:**

### **Task Object:**
```typescript
{
  _id: string
  title: string
  description: string
  assignedTo: string (user ID)
  assignedToName: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  startDate: Date
  dueDate: Date
  progress: number (0-100)
  files: []
  subtasks: []
}
```

### **Request Object:**
```typescript
{
  _id: string
  type: 'workload-redistribution' | 'deadline-extension'
  taskId: string
  taskName: string
  requestedBy: string (user ID)
  requestedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  currentDeadline?: Date
  requestedDeadline?: Date
  rejectionReason?: string
}
```

---

## ✅ **TESTING CHECKLIST:**

### **Basic Functionality:**
- [ ] Role switcher works
- [ ] All roles accessible
- [ ] User info updates on switch

### **Task Assignment:**
- [ ] PM can create task
- [ ] Task appears in list
- [ ] Employee can see assigned task
- [ ] PM can edit task
- [ ] PM can delete task

### **Request System:**
- [ ] Employee can create request
- [ ] Request appears for PM
- [ ] PM can approve request
- [ ] PM can reject request
- [ ] Status updates correctly
- [ ] Employee sees updated status

### **UI/UX:**
- [ ] Toasts appear for actions
- [ ] Buttons are clickable
- [ ] Forms validate properly
- [ ] Modals open/close correctly
- [ ] Tabs switch smoothly

---

## 🎉 **YOU'RE READY!**

**Start testing now and explore the full functionality!**

If you encounter any issues, check the browser console for errors.

**Happy Testing!** 🚀
