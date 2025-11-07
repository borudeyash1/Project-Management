# Planner Section - Fixes Required

## 🎯 Overview

This document outlines the specific improvements needed for the Planner section based on your requirements.

---

## 1. Board Tab Improvements

### Current Issues:
- Basic card design with limited information
- No advanced grouping options
- Simple drag-and-drop only

### Required Fixes:

#### A. Better Card Design
```
┌─────────────────────────────────────┐
│ ▌ Review Design Mockups    [⋮]     │ ← Priority color bar
│                                     │
│ Update the homepage design with    │ ← Description
│ new branding guidelines             │
│                                     │
│ ████████████░░░░░░░░ 60%           │ ← Progress bar
│                                     │
│ 🏷️ Design  🏷️ UI/UX               │ ← Tags
│                                     │
│ 👤👤👤  📎 3  💬 5  📅 2 days      │ ← Footer info
└─────────────────────────────────────┘
```

**Features to Add:**
- Priority color-coded left border
- Due date countdown badge
- Progress bar for subtasks
- Tag chips
- Assignee avatars
- Attachment count
- Comment count
- Days until due

#### B. Swim Lanes
```
Priority: High
├── To Do        │ In Progress  │ Done
│   Card 1       │   Card 3     │   Card 5
│   Card 2       │   Card 4     │

Priority: Medium
├── To Do        │ In Progress  │ Done
│   Card 6       │   Card 8     │   Card 10
│   Card 7       │   Card 9     │
```

**Options:**
- Group by Priority
- Group by Assignee
- Group by Project
- Group by Tags
- Collapsible lanes

#### C. WIP Limits
```
In Progress (5/3) ⚠️
└── Visual warning when limit exceeded
```

---

## 2. List Tab - Reminder System

### Current Issues:
- No reminder tone settings
- Toast notifications not working
- Limited reminder options

### Required Fixes:

#### A. Reminder Settings Modal
```
┌─────────────────────────────────────┐
│ Set Reminder for "Review Mockups"  │
├─────────────────────────────────────┤
│                                     │
│ Remind me:                          │
│ ○ At due time                       │
│ ○ 5 minutes before                  │
│ ● 15 minutes before                 │
│ ○ 30 minutes before                 │
│ ○ 1 hour before                     │
│ ○ 1 day before                      │
│                                     │
│ Notification Sound:                 │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 🔔  │ │ 🎵  │ │ ⚠️  │ │ 📁  │   │
│ │Deflt│ │Gentl│ │Urgnt│ │Custm│   │
│ │ ▶️  │ │ ▶️  │ │ ▶️  │ │ 📤  │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│ ☑️ Repeat reminder every 5 minutes │
│                                     │
│          [Cancel]  [Save]           │
└─────────────────────────────────────┘
```

**Features:**
- Timing options (5min, 15min, 30min, 1hr, 1day before)
- 4 tone options (Default, Gentle, Urgent, Custom)
- Preview button for each tone
- Custom sound upload
- Repeat option

#### B. Working Toast Notifications
```
┌─────────────────────────────────────┐
│ 🔔 Task Reminder                    │
│ "Review Design Mockups" is due in   │
│ 15 minutes                          │
│                                     │
│ Due: Today at 3:00 PM               │
│ Priority: High                      │
│                                     │
│ [Snooze 5min] [Snooze 15min]       │
│ [View Task] [Mark Complete] [✕]    │
└─────────────────────────────────────┘
```

**Features:**
- Sound plays when toast appears
- Persistent until dismissed
- Snooze options (5min, 15min, 1hour)
- Action buttons (View, Complete, Dismiss)
- Desktop notification (if permitted)
- Multiple toasts stack vertically

#### C. Sound Files Needed
```
/public/sounds/
  ├── default-beep.mp3      (System beep)
  ├── gentle-chime.mp3      (Soft bell)
  ├── urgent-alarm.mp3      (Alert sound)
  └── custom/               (User uploads)
```

---

## 3. Timeline Tab - Complete Rebuild

### Current Issues:
- Fixed spacing, no customization
- Tasks not properly displayed
- No drag-to-resize functionality
- Not professional looking

### Required Fixes:

#### A. Proper Date Spacing
```
Controls: [Day] [Week] [Month] [Quarter] [Year]

Day View (80px per day):
|Mon|Tue|Wed|Thu|Fri|Sat|Sun|Mon|Tue|...

Week View (120px per week):
|Week 1|Week 2|Week 3|Week 4|...

Month View (150px per month):
|January|February|March|April|...
```

**Features:**
- Toggle between Day/Week/Month/Quarter/Year
- Zoom in/out buttons
- Fit to screen
- Custom date range picker
- Show/hide weekends toggle
- Today marker line

#### B. Task Display on Timeline
```
Timeline Grid:

Project A  |████████████████████████| Task 1 (Jan 1 - Jan 20)
          |      ████████████|        Task 2 (Jan 5 - Jan 15)
          
Project B |  ████████████████████|    Task 3 (Jan 3 - Jan 22)
          |          ████████|        Task 4 (Jan 10 - Jan 18)
          
Today ↓
```

**Features:**
- Horizontal bars from start to end date
- Color-coded by status/priority/project
- Progress fill (darker shade)
- Task title on bar
- Assignee avatars
- Auto-arrange to avoid overlap
- Swim lanes by project/assignee

#### C. Draggable Task Bars

**Three Drag Modes:**

1. **Drag Left Edge (Start Handle)**
```
Before: |████████████████|
         ↑ Drag left
After:  |████████████████████|
        ← Start date changed, end date fixed
```

2. **Drag Right Edge (End Handle)**
```
Before: |████████████████|
                         ↑ Drag right
After:  |████████████████████|
        End date changed, start date fixed →
```

3. **Drag Entire Bar (Move)**
```
Before:     |████████████████|
            ↑ Drag anywhere on bar
After:          |████████████████|
            ← Entire task moved, duration same →
```

**Implementation:**
```typescript
// Drag handles on task bar
<div className="timeline-task-bar">
  {/* Left handle - changes start date */}
  <div 
    className="start-handle"
    onMouseDown={(e) => startDrag(e, 'start')}
    style={{ cursor: 'ew-resize' }}
  />
  
  {/* Middle - moves entire task */}
  <div 
    className="task-content"
    onMouseDown={(e) => startDrag(e, 'move')}
    style={{ cursor: 'grab' }}
  >
    {task.title}
  </div>
  
  {/* Right handle - changes end date */}
  <div 
    className="end-handle"
    onMouseDown={(e) => startDrag(e, 'end')}
    style={{ cursor: 'ew-resize' }}
  />
</div>
```

**Visual Feedback:**
- Resize cursor (↔️) on handles
- Grab cursor (✋) on bar
- Ghost bar during drag
- Snap to grid lines
- Date tooltip showing new dates
- Minimum duration constraint (1 day)

#### D. Professional Timeline Design

**Reference Examples:**
- Monday.com timeline view
- Asana timeline
- ClickUp Gantt chart
- Microsoft Project timeline

**Key Elements:**
```
┌─────────────────────────────────────────────────────────┐
│ Timeline Controls                                       │
│ [Day][Week][Month] [−][+][⊡] [Jan 1 - Jan 31] [⚙️]    │
├─────────────────────────────────────────────────────────┤
│ Tasks    │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │ 10│... │
│          │Mon│Tue│Wed│Thu│Fri│Sat│Sun│Mon│Tue│Wed│    │
├──────────┼───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴────┤
│ Project A│                                              │
│  Task 1  │   ████████████████████████                  │
│  Task 2  │       ████████████                          │
│          │                                              │
│ Project B│                                              │
│  Task 3  │     ████████████████████                    │
│  Task 4  │             ████████████                    │
│          │                                              │
│          │              ↑ Today                         │
└──────────┴──────────────────────────────────────────────┘
```

**Design Features:**
- Clean grid lines
- Alternating row colors
- Hover effects on tasks
- Smooth animations
- Responsive design
- Dark mode support
- Mini-map for navigation
- Zoom slider

---

## 4. Implementation Priority

### Phase 1: Critical (Do First)
1. ✅ Timeline draggable task bars
2. ✅ Timeline date spacing controls
3. ✅ Reminder toast notifications with sound
4. ✅ Board card improvements

### Phase 2: Important (Do Next)
1. ✅ Reminder tone selection
2. ✅ Timeline professional design
3. ✅ Board swim lanes
4. ✅ List inline editing

### Phase 3: Nice to Have
1. ✅ WIP limits
2. ✅ Timeline dependencies
3. ✅ Bulk operations
4. ✅ Advanced filters

---

## 5. Technical Requirements

### Dependencies to Install:
```bash
npm install date-fns
npm install howler          # For audio playback
npm install react-toastify  # For toast notifications
```

### Browser APIs Needed:
- **Notification API** - Desktop notifications
- **Audio API** - Sound playback
- **LocalStorage** - Save preferences
- **Drag Events** - Draggable task bars

---

## 6. Code Examples

### Reminder Toast with Sound
```typescript
import { Howl } from 'howler';
import { toast } from 'react-toastify';

const playReminderSound = (tone: string) => {
  const sound = new Howl({
    src: [`/sounds/${tone}.mp3`],
    volume: 0.7
  });
  sound.play();
};

const showReminderToast = (task: Task, settings: ReminderSettings) => {
  // Play sound
  playReminderSound(settings.tone);
  
  // Show toast
  toast(
    <ReminderToast task={task} />,
    {
      autoClose: false, // Don't auto-dismiss
      closeButton: true,
      position: 'top-right',
      className: 'reminder-toast'
    }
  );
  
  // Desktop notification
  if (Notification.permission === 'granted') {
    new Notification(task.title, {
      body: `Due in ${getTimeUntilDue(task.dueDate)}`,
      icon: '/icon.png'
    });
  }
};
```

### Timeline Drag Handler
```typescript
const handleDrag = (e: MouseEvent, handle: 'start' | 'end' | 'move') => {
  const deltaX = e.clientX - dragStartX;
  const daysDelta = Math.round(deltaX / columnWidth);
  
  if (handle === 'start') {
    // Change start date only
    const newStart = addDays(originalStartDate, daysDelta);
    if (newStart < originalEndDate) {
      updateTask({ startDate: newStart });
    }
  } else if (handle === 'end') {
    // Change end date only
    const newEnd = addDays(originalEndDate, daysDelta);
    if (newEnd > originalStartDate) {
      updateTask({ endDate: newEnd });
    }
  } else {
    // Move entire task
    const duration = differenceInDays(originalEndDate, originalStartDate);
    const newStart = addDays(originalStartDate, daysDelta);
    const newEnd = addDays(newStart, duration);
    updateTask({ startDate: newStart, endDate: newEnd });
  }
};
```

---

## 7. Files to Create/Update

### New Files:
- `ReminderToast.tsx` - Toast notification component
- `ReminderSettings.tsx` - Reminder configuration modal
- `TimelineTaskBar.tsx` - Draggable task bar component
- `TimelineControls.tsx` - Date spacing and zoom controls

### Update Files:
- `BoardView.tsx` - Add better cards, swim lanes, WIP limits
- `ListView.tsx` - Add reminder settings integration
- `TimelineView.tsx` - Complete rebuild with new design
- `PlannerContext.tsx` - Add reminder state management

### Sound Files:
- `/public/sounds/default-beep.mp3`
- `/public/sounds/gentle-chime.mp3`
- `/public/sounds/urgent-alarm.mp3`

---

## 8. Success Criteria

### Board View:
✅ Cards show all relevant information
✅ Swim lanes group tasks correctly
✅ WIP limits display warnings
✅ Drag and drop is smooth

### List View:
✅ Reminder settings save properly
✅ Toast appears at correct time
✅ Sound plays when reminder triggers
✅ Snooze functionality works
✅ Desktop notifications appear

### Timeline View:
✅ Tasks display from start to end date
✅ Date spacing changes work
✅ Can drag left edge to change start date
✅ Can drag right edge to change end date
✅ Can drag bar to move entire task
✅ Snap to grid works
✅ Professional design matches references

---

## Next Steps

1. **Review this document** - Confirm requirements
2. **Install dependencies** - Add required packages
3. **Implement Phase 1** - Critical features first
4. **Test thoroughly** - Each feature individually
5. **Deploy** - Push to production

**Estimated Time:**
- Phase 1: 2-3 days
- Phase 2: 2-3 days
- Phase 3: 1-2 days
- Testing: 1 day

**Total: ~1 week for complete implementation**

---

Would you like me to start implementing any specific feature first?
