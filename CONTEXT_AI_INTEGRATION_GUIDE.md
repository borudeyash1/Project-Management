# Context-Aware AI Assistant - Integration Guide

## ✅ Example Integration Complete

I've successfully integrated the ContextAIButton into `WorkspaceOverview.tsx` as a working example.

### What Was Added

**File**: `client/src/components/workspace/WorkspaceOverview.tsx`

```typescript
// 1. Import added
import { ContextAIButton } from '../ai/ContextAIButton';

// 2. Component added at the end (before closing div)
<ContextAIButton 
  pageData={{
    workspaceName: currentWorkspace?.name,
    memberCount: currentWorkspace?.members?.filter((m: any) => m.status === 'active').length || 0,
    activeProjects,
    attendanceRate: attendanceStats.total > 0 
      ? Math.round((attendanceStats.present / attendanceStats.total) * 100) 
      : 0,
    recentActivity: workspaceProjects.slice(0, 5).map(p => ({
      name: p.name,
      status: p.status,
      progress: p.progress
    }))
  }}
/>
```

### How It Works

1. **User navigates** to `/workspace/{id}/overview`
2. **Floating AI button** appears in bottom-right corner (purple gradient with sparkle icon)
3. **User clicks** button → Modal opens with 3 tabs
4. **User clicks** "Analyze Page (15 credits)"
5. **AI analyzes** workspace data and provides insights like:
   ```
   Workspace Health: Strong
   - 5 active members with 92% attendance rate
   - 3 active projects with average 68% progress
   - Recent activity shows consistent team engagement
   
   Recommendations:
   - Team is performing well, maintain current momentum
   - Consider starting new projects given high completion rate
   - Attendance is excellent, no immediate concerns
   ```
6. **Quick questions** appear for easy follow-up

---

## 📋 Integration Template

Use this template to add ContextAIButton to other pages:

### Step 1: Add Import

```typescript
import { ContextAIButton } from '../ai/ContextAIButton';
```

### Step 2: Add Component

Add before the closing `</div>` of your main container:

```typescript
<ContextAIButton 
  pageData={{
    // Pass relevant data from your page
    // Only include what's already loaded!
  }}
/>
```

### Step 3: Prepare Page Data

Extract only the data that's **already loaded** on your page. Don't make extra API calls!

---

## 📝 Integration Examples for Each Page

### Workspace Pages

#### 1. WorkspaceOverview ✅ (Already Done!)
```typescript
<ContextAIButton 
  pageData={{
    workspaceName: currentWorkspace?.name,
    memberCount: currentWorkspace?.members?.filter(m => m.status === 'active').length,
    activeProjects: workspaceProjects.filter(p => p.status === 'active').length,
    attendanceRate: Math.round((attendanceStats.present / attendanceStats.total) * 100),
    recentActivity: workspaceProjects.slice(0, 5)
  }}
/>
```

#### 2. WorkspaceMembers
```typescript
<ContextAIButton 
  pageData={{
    members: members.map(m => ({
      name: m.user.fullName,
      role: m.role,
      status: m.status
    })),
    totalMembers: members.length,
    roleDistribution: members.reduce((acc, m) => {
      acc[m.role] = (acc[m.role] || 0) + 1;
      return acc;
    }, {}),
    activeMembers: members.filter(m => m.status === 'active').length
  }}
/>
```

#### 3. WorkspaceAttendance
```typescript
<ContextAIButton 
  pageData={{
    attendance: {
      rate: attendanceRate,
      present: presentCount,
      absent: absentMembers,
      trends: 'stable' // or calculate from historical data
    }
  }}
/>
```

#### 4. WorkspaceProjects
```typescript
<ContextAIButton 
  pageData={{
    projects: projects.map(p => ({
      name: p.name,
      status: p.status,
      progress: p.progress,
      dueDate: p.dueDate
    })),
    totalProjects: projects.length,
    statusDistribution: projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {}),
    atRiskProjects: projects.filter(p => 
      p.status === 'active' && 
      p.progress < 50 && 
      new Date(p.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )
  }}
/>
```

---

### Project Pages

#### 1. ProjectOverview
```typescript
<ContextAIButton 
  pageData={{
    projectName: project.name,
    status: project.status,
    progress: project.progress,
    teamSize: project.teamMembers.length,
    recentTasks: tasks.slice(0, 5).map(t => ({
      title: t.title,
      status: t.status,
      assignee: t.assignee
    }))
  }}
/>
```

#### 2. ProjectWorkload (CRITICAL for Managers!)
```typescript
<ContextAIButton 
  pageData={{
    workload: teamMembers.map(member => ({
      memberName: member.user.fullName,
      role: member.role,
      assignedTasks: member.tasks.length,
      capacity: member.capacity || 10,
      isCurrentUser: member.user._id === currentUser._id
    }))
  }}
/>
```

**AI Output for Managers**:
```
Workload Balance Assessment:
- Sarah (Developer): 12 tasks (capacity: 8) - OVERLOADED by 4 tasks
- John (Designer): 3 tasks (capacity: 10) - UNDERUTILIZED by 7 tasks
- Mike (QA): 8 tasks (capacity: 8) - BALANCED

Task Redistribution Suggestions:
1. Move "UI Polish" and "Icon Design" from Sarah to John (2 tasks)
2. Move "Component Testing" from Sarah to Mike (1 task)
3. Sarah focus on backend API work where she's strongest

Capacity Optimization:
- John can take 7 more tasks
- Consider assigning new design work to John
- Monitor Sarah for burnout risk

Action Plan:
1. Schedule 1-on-1 with Sarah to discuss workload
2. Reassign 3 tasks from Sarah to John and Mike
3. Review task allocation weekly
4. Consider hiring if workload persists
```

#### 3. ProjectTasks
```typescript
<ContextAIButton 
  pageData={{
    tasks: tasks.map(t => ({
      title: t.title,
      status: t.status,
      dueDate: t.dueDate,
      assignee: t.assignee
    })),
    totalTasks: tasks.length,
    statusDistribution: tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {}),
    blockedTasks: tasks.filter(t => t.status === 'blocked'),
    upcomingDeadlines: tasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    )
  }}
/>
```

---

## 🎯 Best Practices

### 1. Only Pass Loaded Data
❌ **Don't do this**:
```typescript
// Making extra API call just for AI
const extraData = await fetchExtraData();
<ContextAIButton pageData={extraData} />
```

✅ **Do this**:
```typescript
// Use data already loaded on the page
<ContextAIButton pageData={existingPageData} />
```

### 2. Keep Data Minimal
❌ **Don't do this**:
```typescript
pageData={{
  fullProject: entireProjectObject, // Too much!
  allTasks: allTasksWithFullDetails, // Wasteful!
  completeHistory: fullAuditLog // Unnecessary!
}}
```

✅ **Do this**:
```typescript
pageData={{
  projectName: project.name,
  status: project.status,
  progress: project.progress,
  teamSize: project.teamMembers.length
}}
```

### 3. Transform Complex Objects
❌ **Don't do this**:
```typescript
pageData={{
  members: fullMemberObjects // Includes passwords, tokens, etc.
}}
```

✅ **Do this**:
```typescript
pageData={{
  members: members.map(m => ({
    name: m.user.fullName,
    role: m.role,
    status: m.status
  }))
}}
```

---

## 🧪 Testing Your Integration

1. **Navigate** to the page you integrated
2. **Verify** floating AI button appears (bottom-right)
3. **Click** button → Modal should open
4. **Click** "Analyze Page"
5. **Verify** AI summary is relevant to your page
6. **Check** quick questions are contextual
7. **Test** asking a custom question
8. **Test** getting smart actions

---

## 🚀 Remaining Pages to Integrate

### Workspace Pages (5 remaining)
- [ ] WorkspaceMembers
- [ ] WorkspaceAttendanceTab
- [ ] WorkspaceProjects
- [ ] WorkspaceProfile
- [ ] WorkspaceInbox

### Project Pages (9 remaining)
- [ ] ProjectOverviewTab
- [ ] ProjectInfoTab
- [ ] ProjectTeamTab
- [ ] ProjectTasksTab
- [ ] ProjectTimelineTab
- [ ] ProjectProgressTab
- [ ] ProjectWorkloadTab ⭐ (High priority for managers!)
- [ ] ProjectReportsTab
- [ ] ProjectDocumentsTab

---

## 💡 Tips

1. **Start with high-value pages**: Workload, Tasks, Overview
2. **Test with real data**: Use actual projects and tasks
3. **Monitor token usage**: Check console logs for token estimates
4. **Gather feedback**: Ask users which insights are most helpful
5. **Iterate on prompts**: Adjust templates based on feedback

---

## 🎉 You're Ready!

The context-aware AI assistant is fully implemented and working on WorkspaceOverview. Simply follow this guide to add it to the remaining pages!
