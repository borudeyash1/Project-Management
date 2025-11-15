# Planner Section Improvements - Implementation Plan

## Overview
Comprehensive improvements to the Planner's Board, List, and Timeline views for better user experience and functionality.

---

## 1. Board View Improvements

### Current Issues:
- Basic kanban board with limited visual appeal
- No swim lanes or advanced grouping
- Limited card information display
- Basic drag-and-drop only

### Proposed Enhancements:

#### A. Visual Improvements
- **Better Card Design**
  - Larger, more informative cards
  - Priority color-coded borders
  - Due date badges with countdown
  - Assignee avatars
  - Tag chips
  - Progress indicators for subtasks
  - Attachment and comment count icons

#### B. Advanced Features
- **Swim Lanes**
  - Group by: Priority, Assignee, Project, Tags
  - Collapsible swim lanes
  - Swim lane summaries

- **WIP Limits**
  - Visual warnings when limit exceeded
  - Column capacity indicators
  - Auto-highlight overloaded columns

- **Quick Actions**
  - Inline edit on hover
  - Quick assign
  - Quick priority change
  - Quick due date picker
  - Card templates

#### C. Filtering & Search
- Advanced filters panel
- Saved filter presets
- Multi-criteria filtering
- Real-time search highlighting

---

## 2. List View Improvements

### Current Issues:
- Basic reminder functionality
- No reminder tone settings
- Toast notifications not working properly
- Limited customization

### Proposed Enhancements:

#### A. Reminder System
```typescript
interface ReminderSettings {
  enabled: boolean;
  timing: 'on-time' | '5-min' | '15-min' | '30-min' | '1-hour' | '1-day';
  tone: 'default' | 'gentle' | 'urgent' | 'custom';
  repeat: boolean;
  repeatInterval?: number;
  customSound?: string;
}
```

**Features:**
- **Reminder Timing Options**
  - On time
  - 5 minutes before
  - 15 minutes before
  - 30 minutes before
  - 1 hour before
  - 1 day before
  - Custom timing

- **Tone Selection**
  - Default (system beep)
  - Gentle (soft chime)
  - Urgent (alarm sound)
  - Custom (upload your own)
  - Preview button for each tone

- **Reminder Toast Notifications**
  - Persistent until dismissed
  - Snooze options (5min, 15min, 1hour)
  - Action buttons (View Task, Mark Complete, Dismiss)
  - Sound playback
  - Desktop notifications (if permitted)
  - Multiple reminder stacking

#### B. Enhanced List Features
- **Inline Editing**
  - Click any cell to edit
  - Tab to move between fields
  - Auto-save on blur
  - Undo/redo support

- **Bulk Operations**
  - Select multiple tasks
  - Bulk status change
  - Bulk priority update
  - Bulk assign
  - Bulk delete with confirmation

- **Smart Grouping**
  - Group by any field
  - Nested grouping (2 levels)
  - Collapsible groups
  - Group summaries (count, completion %)

- **Advanced Sorting**
  - Multi-column sort
  - Custom sort orders
  - Save sort preferences

#### C. Reminder Toast Implementation
```typescript
// Toast Component
interface ReminderToast {
  id: string;
  taskId: string;
  title: string;
  message: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tone: string;
  actions: ToastAction[];
}

interface ToastAction {
  label: string;
  action: () => void;
  style: 'primary' | 'secondary' | 'danger';
}

// Features:
- Auto-dismiss after 30 seconds (configurable)
- Snooze functionality
- Play sound on show
- Stack multiple toasts
- Persist across page refresh
- Desktop notification integration
```

---

## 3. Timeline View Improvements

### Current Issues:
- Fixed date spacing
- No drag-to-resize functionality
- Tasks not properly displayed on timeline
- Limited date range options

### Proposed Enhancements:

#### A. Date Spacing Options
```typescript
type TimelineScale = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface TimelineSettings {
  scale: TimelineScale;
  startDate: Date;
  endDate: Date;
  showWeekends: boolean;
  showToday: boolean;
  snapToGrid: boolean;
}
```

**Spacing Controls:**
- **Day View**: Each column = 1 day (24-hour spacing)
- **Week View**: Each column = 1 week (7-day spacing)
- **Month View**: Each column = 1 month
- **Quarter View**: Each column = 3 months
- **Year View**: Each column = 1 year

**Features:**
- Zoom in/out buttons
- Fit to screen
- Custom date range picker
- Toggle weekend display
- Highlight today marker

#### B. Task Display on Timeline
```typescript
interface TimelineTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  color: string;
  row: number; // For vertical positioning
  dependencies: string[]; // Task IDs
}
```

**Visual Representation:**
- **Task Bars**
  - Horizontal bars spanning start to end date
  - Color-coded by status/priority/project
  - Height based on importance
  - Rounded corners
  - Shadow on hover
  - Opacity for completed tasks

- **Task Information**
  - Title displayed on bar
  - Progress indicator (filled portion)
  - Duration tooltip on hover
  - Quick actions menu
  - Assignee avatars

- **Multiple Tasks**
  - Auto-arrange in rows to avoid overlap
  - Swim lanes by project/assignee
  - Compact mode for many tasks
  - Expand/collapse rows

#### C. Draggable Task Bars
```typescript
interface DragHandles {
  startHandle: boolean; // Left edge
  endHandle: boolean;   // Right edge
  moveHandle: boolean;  // Entire bar
}
```

**Drag Functionality:**

1. **Drag Start Handle (Left Edge)**
   - Changes start date
   - Keeps end date fixed
   - Updates duration
   - Visual feedback during drag
   - Snap to grid (day/week boundaries)
   - Min duration constraint

2. **Drag End Handle (Right Edge)**
   - Changes end date
   - Keeps start date fixed
   - Updates duration
   - Visual feedback during drag
   - Snap to grid
   - Min duration constraint

3. **Drag Entire Bar**
   - Moves both start and end dates
   - Maintains duration
   - Visual feedback (ghost bar)
   - Snap to grid
   - Conflict detection

**Implementation Details:**
```typescript
const handleDragStart = (e: React.DragEvent, task: TimelineTask, handle: 'start' | 'end' | 'move') => {
  e.dataTransfer.effectAllowed = 'move';
  setDraggedTask({ task, handle, startX: e.clientX });
};

const handleDrag = (e: React.DragEvent) => {
  if (!draggedTask) return;
  
  const deltaX = e.clientX - draggedTask.startX;
  const daysDelta = Math.round(deltaX / dayWidth);
  
  if (draggedTask.handle === 'start') {
    // Update start date
    const newStartDate = addDays(task.startDate, daysDelta);
    if (newStartDate < task.endDate) {
      updateTaskDates(task.id, newStartDate, task.endDate);
    }
  } else if (draggedTask.handle === 'end') {
    // Update end date
    const newEndDate = addDays(task.endDate, daysDelta);
    if (newEndDate > task.startDate) {
      updateTaskDates(task.id, task.startDate, newEndDate);
    }
  } else {
    // Move entire task
    const newStartDate = addDays(task.startDate, daysDelta);
    const newEndDate = addDays(task.endDate, daysDelta);
    updateTaskDates(task.id, newStartDate, newEndDate);
  }
};

const handleDragEnd = () => {
  setDraggedTask(null);
  // Save to backend
  saveTaskDates();
};
```

**Visual Feedback:**
- Resize cursors on handles
- Ghost bar during drag
- Snap indicators
- Date tooltip during drag
- Conflict warnings
- Undo/redo support

#### D. Additional Timeline Features

**Dependencies:**
- Arrow lines between dependent tasks
- Automatic scheduling based on dependencies
- Highlight dependency chain
- Drag to create dependencies

**Milestones:**
- Diamond markers on timeline
- Milestone labels
- Completion status
- Link to milestone details

**Today Marker:**
- Vertical line showing current date
- Auto-scroll to today
- Highlight overdue tasks

**Zoom & Pan:**
- Mouse wheel to zoom
- Click-drag to pan
- Mini-map for navigation
- Zoom to selection

---

## 4. Implementation Priority

### Phase 1: Critical Improvements (Week 1)
1. ✅ Timeline draggable task bars
2. ✅ Timeline date spacing options
3. ✅ List view reminder toast notifications
4. ✅ Board view better card design

### Phase 2: Enhanced Features (Week 2)
1. ✅ Reminder tone selection
2. ✅ Timeline task display improvements
3. ✅ Board view swim lanes
4. ✅ List view inline editing

### Phase 3: Advanced Features (Week 3)
1. ✅ Timeline dependencies
2. ✅ Board view WIP limits
3. ✅ List view bulk operations
4. ✅ Advanced filtering

---

## 5. Technical Requirements

### Dependencies:
```json
{
  "react-beautiful-dnd": "^13.1.1",  // Drag and drop
  "date-fns": "^2.30.0",              // Date manipulation
  "react-toastify": "^9.1.3",         // Toast notifications
  "howler": "^2.2.3",                 // Audio playback
  "react-window": "^1.8.10"           // Virtual scrolling
}
```

### Browser APIs:
- Notification API (desktop notifications)
- Audio API (reminder sounds)
- LocalStorage (preferences)
- IndexedDB (offline support)

---

## 6. User Experience Improvements

### Accessibility:
- Keyboard navigation for all features
- Screen reader support
- High contrast mode
- Focus indicators
- ARIA labels

### Performance:
- Virtual scrolling for large lists
- Lazy loading for timeline
- Debounced search
- Optimistic updates
- Background sync

### Mobile Responsive:
- Touch-friendly drag handles
- Swipe gestures
- Responsive timeline
- Mobile-optimized modals
- Bottom sheets for actions

---

## 7. Testing Checklist

### Board View:
- [ ] Drag and drop works smoothly
- [ ] WIP limits enforced
- [ ] Swim lanes display correctly
- [ ] Card details visible
- [ ] Quick actions functional

### List View:
- [ ] Reminders trigger on time
- [ ] Toast notifications appear
- [ ] Sound plays correctly
- [ ] Snooze functionality works
- [ ] Inline editing saves properly

### Timeline View:
- [ ] Tasks display at correct dates
- [ ] Drag start handle changes start date
- [ ] Drag end handle changes end date
- [ ] Drag entire bar moves task
- [ ] Date spacing changes work
- [ ] Zoom in/out functional
- [ ] Dependencies display correctly

---

## 8. Success Metrics

### User Satisfaction:
- Reduced time to complete tasks
- Increased task completion rate
- Positive user feedback
- Reduced support tickets

### Performance:
- Page load time < 2s
- Drag response time < 16ms
- Toast display time < 100ms
- Timeline render time < 500ms

### Adoption:
- 80% of users use timeline view
- 60% set reminders
- 90% use board view
- 50% use advanced filters

---

## Next Steps

1. Review and approve this plan
2. Set up development environment
3. Create feature branches
4. Implement Phase 1 features
5. Conduct user testing
6. Iterate based on feedback
7. Deploy to production

---

**Note**: This is a comprehensive improvement plan. Implementation should be done incrementally with user feedback at each phase.
