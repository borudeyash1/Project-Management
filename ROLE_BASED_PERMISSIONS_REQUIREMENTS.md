# 🔐 ROLE-BASED PERMISSIONS & REQUIREMENTS

## 📋 **SUMMARY OF YOUR REQUIREMENTS:**

---

## 🏢 **WORKSPACE VIEW** (`/workspace/:workspaceId/:tabName`)

### **Tabs & Permissions:**

| Tab | Workspace Owner | Project Manager | Employee |
|-----|----------------|-----------------|----------|
| **Overview** | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Members** | ✅ Add/Edit/Remove | ✅ View Only | ✅ View Only |
| **Projects** | ✅ Create/Edit/Delete<br>✅ See All Projects | ✅ View Only<br>❌ Cannot Create | ✅ View Only<br>❌ See Only Assigned Projects |
| **Clients** | ✅ Add/Edit/Delete | ✅ View Only (Info) | ✅ View Only (Info) |
| **Requests** | ✅ Approve/Reject | ✅ View Only | ✅ Create Requests |
| **Collaborate** | ✅ Add/Remove Collaborators | ✅ Read Only | ✅ Read Only |
| **Advertise** | ✅ Visible & Editable | ❌ Not Visible | ❌ Not Visible |
| **Settings** | ✅ Full Settings<br>(Visibility, Region, Theme, etc.) | ✅ Theme Only | ✅ Theme Only |

---

## 📁 **PROJECT VIEW** (`/project/:projectId/:tabName`)

### **Current Issues to Fix:**

#### **1. Project Selector Dropdown** ❌
- **Problem:** No option to collapse the project list
- **Fix Needed:** Add close button or click-outside-to-close functionality

#### **2. Runtime Error** ✅ FIXED
- **Problem:** `Cannot read properties of undefined (reading 'slice')`
- **Status:** ✅ Fixed by adding optional chaining to `team` and `tasks` arrays

---

### **Team Tab Permissions:**

| Action | Workspace Owner | Project Manager | Employee |
|--------|----------------|-----------------|----------|
| **Add Member** | ✅ Yes | ✅ Yes | ❌ No |
| **Remove Member** | ✅ Yes | ✅ Yes | ❌ No |
| **Assign Role** | ✅ Yes | ✅ Yes | ❌ No |
| **View Members** | ✅ Yes | ✅ Yes | ✅ Yes |

**Important Rules:**
- ✅ Only show workspace members when adding to project team
- ✅ Role selection dropdown when adding member
- ✅ **Only ONE Project Manager per project** (assigned by workspace owner at creation)

---

### **Tasks Tab Requirements:**

#### **For Project Manager:**
- ✅ **Task List View:** See all tasks in proper list format
- ✅ **Click to Expand:** Show task details + subtasks
- ✅ **Assign Tasks:** With employee name, deadline, priority
- ✅ **Task Types:**
  - Regular task with checkbox
  - File upload task
  - Link upload task
- ✅ **Manual Verification:** Verify completed tasks
- ✅ **Rate Task:** Give rating after completion (for employee performance)
- ✅ **Finish Task:** Mark as completed after verification

#### **For Employee (Assigned User):**
- ✅ **View Assigned Tasks:** See only tasks assigned to them
- ✅ **Update Status:** Change task status (Pending → In Progress → Completed)
- ✅ **Upload Files:** If task type is file upload
- ✅ **Upload Links:** If task type is link upload
- ✅ **Complete Subtasks:** Mark subtasks as done
- ❌ **Cannot Finish Task:** Only PM can finish after verification

---

## 🎯 **IMPLEMENTATION CHECKLIST:**

### **✅ Already Implemented:**
1. ✅ Role-based task assignment (PM only)
2. ✅ Task CRUD operations
3. ✅ Task status updates
4. ✅ Workload redistribution requests
5. ✅ Deadline extension requests
6. ✅ Request approval/rejection
7. ✅ Role switcher for testing
8. ✅ Fixed runtime error (team.slice)

### **❌ Pending Implementation:**

#### **🔴 HIGH PRIORITY:**

**1. Project Selector Fix**
- [ ] Add collapse/close functionality to project dropdown
- [ ] Click outside to close
- [ ] ESC key to close

**2. Workspace Permissions**
- [ ] Filter projects by role (employees see only assigned)
- [ ] Hide "Create Project" button for non-owners
- [ ] Client tab: Read-only for PM & Employee
- [ ] Advertise tab: Hide for non-owners
- [ ] Settings tab: Limit to theme for non-owners

**3. Project Team Management**
- [ ] "Add Member" button (Owner & PM only)
- [ ] Show only workspace members in dropdown
- [ ] Role selector when adding member
- [ ] Enforce single Project Manager rule
- [ ] Remove member functionality (Owner & PM only)

**4. Task Management Enhancements**
- [ ] **Subtasks:** Create subtasks within tasks
- [ ] **Task Types:** Regular, File Upload, Link Upload
- [ ] **File Upload:** Allow file attachment on tasks
- [ ] **Link Upload:** Allow link attachment on tasks
- [ ] **Task Verification:** PM manually verifies before completion
- [ ] **Task Rating:** PM rates completed tasks (1-5 stars)
- [ ] **Finish Button:** PM-only button to mark task as finished
- [ ] **Task Expansion:** Click task to show details + subtasks
- [ ] **Employee View:** Filter to show only assigned tasks

**5. Task List View**
- [ ] Proper list format for all tasks
- [ ] Expandable task cards
- [ ] Show subtasks when expanded
- [ ] Status badges
- [ ] Priority indicators
- [ ] Assigned user avatar
- [ ] Due date display

---

## 📝 **DETAILED SPECIFICATIONS:**

### **Task Structure:**
```typescript
interface Task {
  _id: string;
  title: string;
  description: string;
  type: 'regular' | 'file-upload' | 'link-upload';
  assignedTo: string; // User ID
  assignedToName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'verified';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  dueDate: Date;
  progress: number;
  
  // New fields
  subtasks: Subtask[];
  files: File[];
  links: string[];
  rating?: number; // 1-5, set by PM after completion
  verifiedBy?: string; // PM user ID
  verifiedAt?: Date;
  isFinished: boolean; // True when PM clicks "Finish"
}

interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
}
```

### **Task Workflow:**

```
1. PM Creates Task → Status: "pending"
2. Employee Accepts → Status: "in-progress"
3. Employee Completes Subtasks → Progress updates
4. Employee Marks Complete → Status: "completed"
5. PM Verifies Task → Status: "verified"
6. PM Rates Task → rating: 1-5
7. PM Clicks "Finish" → isFinished: true
```

### **Team Member Addition:**

```
1. PM/Owner clicks "Add Member" button
2. Modal opens with:
   - Dropdown: Only workspace members
   - Role selector: Developer, Designer, Tester, etc.
   - Note: "Only one PM allowed" (if trying to add another PM)
3. Click "Add" → Member added to project team
4. Member appears in Team tab
```

---

## 🎨 **UI MOCKUPS NEEDED:**

### **1. Project Selector with Close:**
```
[Project Name ▼]  [X Close]
└─ Project A
   Project B
   Project C (current)
```

### **2. Task List View:**
```
┌─────────────────────────────────────────────┐
│ 🔴 HIGH │ Build Login Page                  │
│ Assigned: John Doe                          │
│ Due: Nov 15, 2025                           │
│ Status: In Progress                         │
│ [Expand ▼]                                  │
└─────────────────────────────────────────────┘
  When expanded:
  ├─ ☑ Create login form
  ├─ ☐ Add validation
  ├─ ☐ Integrate API
  └─ 📎 Files: design.pdf
  
  [PM View Only]
  ├─ [Verify Task] [Rate: ⭐⭐⭐⭐⭐] [Finish]
```

### **3. Add Member Modal:**
```
┌─────────────────────────────────────┐
│  Add Team Member                    │
├─────────────────────────────────────┤
│  Select Member:                     │
│  [Dropdown: Workspace Members ▼]    │
│                                     │
│  Assign Role:                       │
│  [Dropdown: Developer ▼]            │
│                                     │
│  ⚠️ Note: Only 1 PM allowed         │
│                                     │
│  [Cancel]  [Add Member]             │
└─────────────────────────────────────┘
```

---

## 🚀 **NEXT STEPS:**

**Please confirm which features to implement first:**

### **Option A: Fix Critical Issues (1-2 days)**
1. Fix project selector collapse
2. Implement workspace role-based filtering
3. Add team member management with roles

### **Option B: Complete Task System (3-4 days)**
1. Add subtasks functionality
2. Implement file/link uploads
3. Add task verification & rating
4. Create proper task list view

### **Option C: Both (5-6 days)**
1. All critical fixes
2. Complete task management system
3. Full role-based permissions

**Which option do you prefer? Or should I start with specific features?**

Reply with: "Implement Option A" or "Implement Option B" or "Implement Option C"
Or specify: "Start with features: 1, 2, 3..."
