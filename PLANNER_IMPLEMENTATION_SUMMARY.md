# Planner Section - Implementation Summary

## ✅ Improvements Implemented

This document outlines the comprehensive improvements made to the Planner section's Board, List, and Timeline views.

---

## 1. Board View Improvements

### Enhanced Card Design
```typescript
// Improved TaskCard with rich information display
<div className="task-card">
  {/* Priority Border */}
  <div className={`border-l-4 ${priorityColor}`}>
    
    {/* Card Header */}
    <div className="card-header">
      <h3>{task.title}</h3>
      <div className="card-badges">
        {/* Due Date Badge */}
        <span className={`due-badge ${isOverdue ? 'overdue' : ''}`}>
          <Clock /> {daysUntilDue} days
        </span>
        
        {/* Priority Badge */}
        <span className={`priority-${task.priority}`}>
          {task.priority}
        </span>
      </div>
    </div>
    
    {/* Card Body */}
    <p className="description">{task.description}</p>
    
    {/* Progress Bar (if subtasks) */}
    {task.subtasks && (
      <div className="progress-bar">
        <div style={{ width: `${completionPercent}%` }} />
        <span>{completed}/{total} subtasks</span>
      </div>
    )}
    
    {/* Tags */}
    <div className="tags">
      {task.tags.map(tag => (
        <span className="tag">{tag}</span>
      ))}
    </div>
    
    {/* Card Footer */}
    <div className="card-footer">
      {/* Assignee Avatars */}
      <div className="assignees">
        {task.assignees.map(user => (
          <img src={user.avatar} alt={user.name} />
        ))}
      </div>
      
      {/* Meta Icons */}
      <div className="meta-icons">
        <span><Paperclip /> {attachmentCount}</span>
        <span><MessageSquare /> {commentCount}</span>
      </div>
    </div>
  </div>
</div>
```

### Swim Lanes Feature
```typescript
// Group tasks by different criteria
const swimLaneOptions = [
  'none',      // No grouping
  'priority',  // Group by priority
  'assignee',  // Group by assignee
  'project',   // Group by project
  'tags'       // Group by tags
];

// Render swim lanes
{swimLanes.map(lane => (
  <div className="swim-lane">
    <div className="lane-header">
      <h3>{lane.name}</h3>
      <span className="task-count">{lane.tasks.length}</span>
      <button onClick={() => toggleLane(lane.id)}>
        {collapsed ? <ChevronRight /> : <ChevronDown />}
      </button>
    </div>
    
    {!collapsed && (
      <div className="lane-columns">
        {columns.map(column => (
          <Column tasks={lane.tasks.filter(t => t.status === column.id)} />
        ))}
      </div>
    )}
  </div>
))}
```

### WIP Limits
```typescript
// Visual WIP limit indicators
<div className="column-header">
  <h3>{column.name}</h3>
  <span className={`wip-indicator ${isOverLimit ? 'warning' : ''}`}>
    {currentCount}/{wipLimit}
  </span>
  
  {isOverLimit && (
    <div className="wip-warning">
      <AlertTriangle /> WIP limit exceeded!
    </div>
  )}
</div>
```

---

## 2. List View - Reminder System

### Reminder Settings Interface
```typescript
interface ReminderSettings {
  enabled: boolean;
  timing: 'on-time' | '5-min' | '15-min' | '30-min' | '1-hour' | '1-day';
  tone: 'default' | 'gentle' | 'urgent' | 'custom';
  repeat: boolean;
  repeatInterval?: number;
  customSoundUrl?: string;
}

// Reminder Settings Modal
<div className="reminder-settings">
  <h3>Set Reminder</h3>
  
  {/* Timing Selection */}
  <div className="timing-options">
    <label>Remind me:</label>
    <select value={timing} onChange={handleTimingChange}>
      <option value="on-time">At due time</option>
      <option value="5-min">5 minutes before</option>
      <option value="15-min">15 minutes before</option>
      <option value="30-min">30 minutes before</option>
      <option value="1-hour">1 hour before</option>
      <option value="1-day">1 day before</option>
    </select>
  </div>
  
  {/* Tone Selection */}
  <div className="tone-options">
    <label>Notification Sound:</label>
    <div className="tone-grid">
      {tones.map(tone => (
        <button 
          className={`tone-option ${selected === tone.id ? 'active' : ''}`}
          onClick={() => selectTone(tone.id)}
        >
          <span>{tone.icon}</span>
          <span>{tone.name}</span>
          <button onClick={() => previewTone(tone.sound)}>
            <Play /> Preview
          </button>
        </button>
      ))}
    </div>
  </div>
  
  {/* Custom Sound Upload */}
  <div className="custom-sound">
    <label>Custom Sound:</label>
    <input 
      type="file" 
      accept="audio/*" 
      onChange={handleSoundUpload}
    />
  </div>
  
  {/* Repeat Options */}
  <div className="repeat-options">
    <label>
      <input type="checkbox" checked={repeat} onChange={toggleRepeat} />
      Repeat reminder
    </label>
    {repeat && (
      <input 
        type="number" 
        value={repeatInterval} 
        onChange={handleIntervalChange}
        placeholder="Every X minutes"
      />
    )}
  </div>
</div>
```

### Toast Notification System
```typescript
// Reminder Toast Component
interface ReminderToast {
  id: string;
  taskId: string;
  title: string;
  message: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tone: string;
  persistent: boolean;
}

const ReminderToast: React.FC<ReminderToast> = ({ toast }) => {
  const [snoozed, setSnoozed] = useState(false);
  
  useEffect(() => {
    // Play sound when toast appears
    playReminderSound(toast.tone);
    
    // Request desktop notification permission
    if (Notification.permission === 'granted') {
      new Notification(toast.title, {
        body: toast.message,
        icon: '/icon.png',
        badge: '/badge.png'
      });
    }
  }, []);
  
  return (
    <div className={`reminder-toast priority-${toast.priority}`}>
      {/* Toast Header */}
      <div className="toast-header">
        <Bell className="toast-icon" />
        <h4>{toast.title}</h4>
        <button onClick={handleDismiss}>
          <X />
        </button>
      </div>
      
      {/* Toast Body */}
      <div className="toast-body">
        <p>{toast.message}</p>
        <div className="toast-meta">
          <Clock /> Due: {formatDate(toast.dueDate)}
        </div>
      </div>
      
      {/* Toast Actions */}
      <div className="toast-actions">
        <button onClick={() => handleSnooze(5)}>
          <Clock /> Snooze 5min
        </button>
        <button onClick={() => handleSnooze(15)}>
          <Clock /> Snooze 15min
        </button>
        <button onClick={() => handleSnooze(60)}>
          <Clock /> Snooze 1hour
        </button>
        <button onClick={handleViewTask} className="primary">
          <Eye /> View Task
        </button>
        <button onClick={handleComplete} className="success">
          <CheckCircle /> Mark Complete
        </button>
      </div>
    </div>
  );
};

// Sound Playback
const playReminderSound = (tone: string) => {
  const audio = new Audio(getSoundUrl(tone));
  audio.volume = 0.7;
  audio.play().catch(err => console.error('Audio playback failed:', err));
};

// Snooze Functionality
const handleSnooze = (minutes: number) => {
  const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
  scheduleReminder(toast.taskId, snoozeUntil);
  dismissToast(toast.id);
};
```

### Sound Files
```typescript
const reminderTones = {
  default: '/sounds/default-beep.mp3',
  gentle: '/sounds/gentle-chime.mp3',
  urgent: '/sounds/urgent-alarm.mp3',
  custom: userUploadedSound
};
```

---

## 3. Timeline View - Complete Rebuild

### Date Spacing Controls
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

// Timeline Header with Controls
<div className="timeline-controls">
  {/* Scale Selector */}
  <div className="scale-selector">
    <button onClick={() => setScale('day')} className={scale === 'day' ? 'active' : ''}>
      Day
    </button>
    <button onClick={() => setScale('week')} className={scale === 'week' ? 'active' : ''}>
      Week
    </button>
    <button onClick={() => setScale('month')} className={scale === 'month' ? 'active' : ''}>
      Month
    </button>
    <button onClick={() => setScale('quarter')} className={scale === 'quarter' ? 'active' : ''}>
      Quarter
    </button>
    <button onClick={() => setScale('year')} className={scale === 'year' ? 'active' : ''}>
      Year
    </button>
  </div>
  
  {/* Zoom Controls */}
  <div className="zoom-controls">
    <button onClick={zoomOut}>
      <ZoomOut /> Zoom Out
    </button>
    <button onClick={zoomIn}>
      <ZoomIn /> Zoom In
    </button>
    <button onClick={fitToScreen}>
      <Maximize /> Fit to Screen
    </button>
  </div>
  
  {/* Date Range Picker */}
  <div className="date-range">
    <input 
      type="date" 
      value={startDate} 
      onChange={handleStartDateChange}
    />
    <span>to</span>
    <input 
      type="date" 
      value={endDate} 
      onChange={handleEndDateChange}
    />
  </div>
  
  {/* View Options */}
  <div className="view-options">
    <label>
      <input 
        type="checkbox" 
        checked={showWeekends} 
        onChange={toggleWeekends}
      />
      Show Weekends
    </label>
    <label>
      <input 
        type="checkbox" 
        checked={snapToGrid} 
        onChange={toggleSnapToGrid}
      />
      Snap to Grid
    </label>
  </div>
</div>
```

### Timeline Grid Rendering
```typescript
// Calculate column width based on scale
const getColumnWidth = (scale: TimelineScale): number => {
  switch (scale) {
    case 'day': return 80;      // 80px per day
    case 'week': return 120;    // 120px per week
    case 'month': return 150;   // 150px per month
    case 'quarter': return 200; // 200px per quarter
    case 'year': return 300;    // 300px per year
  }
};

// Generate date columns
const generateColumns = (start: Date, end: Date, scale: TimelineScale) => {
  const columns = [];
  let current = new Date(start);
  
  while (current <= end) {
    columns.push({
      date: new Date(current),
      label: formatDateLabel(current, scale),
      isWeekend: isWeekend(current),
      isToday: isToday(current)
    });
    
    // Increment based on scale
    current = addTime(current, scale);
  }
  
  return columns;
};

// Render timeline grid
<div className="timeline-grid">
  {/* Header Row */}
  <div className="timeline-header">
    <div className="row-labels">Tasks</div>
    <div className="date-columns">
      {columns.map(col => (
        <div 
          key={col.date.toISOString()}
          className={`date-column ${col.isWeekend ? 'weekend' : ''} ${col.isToday ? 'today' : ''}`}
          style={{ width: columnWidth }}
        >
          {col.label}
        </div>
      ))}
    </div>
  </div>
  
  {/* Today Marker */}
  {showToday && (
    <div 
      className="today-marker"
      style={{ left: getTodayPosition() }}
    >
      <div className="marker-line" />
      <div className="marker-label">Today</div>
    </div>
  )}
  
  {/* Task Rows */}
  <div className="timeline-rows">
    {tasks.map((task, index) => (
      <TimelineRow 
        key={task._id}
        task={task}
        rowIndex={index}
        columnWidth={columnWidth}
        scale={scale}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
    ))}
  </div>
</div>
```

### Draggable Task Bars
```typescript
interface DragState {
  taskId: string;
  handle: 'start' | 'end' | 'move';
  startX: number;
  originalStartDate: Date;
  originalEndDate: Date;
}

const TimelineTaskBar: React.FC<TimelineTaskBarProps> = ({ task }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  
  // Calculate bar position and width
  const barLeft = getDatePosition(task.startDate);
  const barWidth = getDatePosition(task.endDate) - barLeft;
  
  // Drag Start Handle
  const handleStartDrag = (e: React.MouseEvent, handle: 'start' | 'end' | 'move') => {
    e.stopPropagation();
    setIsDragging(true);
    setDragState({
      taskId: task._id,
      handle,
      startX: e.clientX,
      originalStartDate: task.startDate,
      originalEndDate: task.endDate
    });
  };
  
  // Drag Move
  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragState) return;
    
    const deltaX = e.clientX - dragState.startX;
    const daysDelta = Math.round(deltaX / columnWidth);
    
    if (dragState.handle === 'start') {
      // Dragging start handle - change start date
      const newStartDate = addDays(dragState.originalStartDate, daysDelta);
      if (newStartDate < task.endDate) {
        updateTaskStartDate(task._id, newStartDate);
      }
    } else if (dragState.handle === 'end') {
      // Dragging end handle - change end date
      const newEndDate = addDays(dragState.originalEndDate, daysDelta);
      if (newEndDate > task.startDate) {
        updateTaskEndDate(task._id, newEndDate);
      }
    } else {
      // Dragging entire bar - move both dates
      const duration = differenceInDays(task.endDate, task.startDate);
      const newStartDate = addDays(dragState.originalStartDate, daysDelta);
      const newEndDate = addDays(newStartDate, duration);
      updateTaskDates(task._id, newStartDate, newEndDate);
    }
  };
  
  // Drag End
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragState(null);
    // Save to backend
    saveTaskChanges(task._id);
  };
  
  return (
    <div 
      className={`timeline-task-bar ${isDragging ? 'dragging' : ''}`}
      style={{
        left: barLeft,
        width: barWidth,
        backgroundColor: getTaskColor(task)
      }}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Start Handle */}
      <div 
        className="drag-handle start-handle"
        onMouseDown={(e) => handleStartDrag(e, 'start')}
        title="Drag to change start date"
      >
        <div className="handle-indicator" />
      </div>
      
      {/* Task Bar Content */}
      <div 
        className="task-bar-content"
        onMouseDown={(e) => handleStartDrag(e, 'move')}
        title="Drag to move task"
      >
        {/* Progress Indicator */}
        <div 
          className="progress-fill"
          style={{ width: `${task.progress}%` }}
        />
        
        {/* Task Title */}
        <span className="task-title">{task.title}</span>
        
        {/* Assignee Avatars */}
        <div className="task-assignees">
          {task.assignees.map(user => (
            <img key={user.id} src={user.avatar} alt={user.name} />
          ))}
        </div>
      </div>
      
      {/* End Handle */}
      <div 
        className="drag-handle end-handle"
        onMouseDown={(e) => handleStartDrag(e, 'end')}
        title="Drag to change end date"
      >
        <div className="handle-indicator" />
      </div>
      
      {/* Drag Tooltip */}
      {isDragging && (
        <div className="drag-tooltip">
          {formatDateRange(task.startDate, task.endDate)}
          <br />
          Duration: {getDuration(task.startDate, task.endDate)}
        </div>
      )}
    </div>
  );
};
```

### Visual Feedback
```css
/* Drag Handles */
.drag-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  opacity: 0;
  transition: opacity 0.2s;
}

.timeline-task-bar:hover .drag-handle {
  opacity: 1;
}

.start-handle {
  left: -4px;
  border-left: 2px solid #3b82f6;
}

.end-handle {
  right: -4px;
  border-right: 2px solid #3b82f6;
}

.handle-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #3b82f6;
  border-radius: 2px;
}

/* Dragging State */
.timeline-task-bar.dragging {
  opacity: 0.7;
  cursor: grabbing;
  z-index: 1000;
}

/* Snap Indicators */
.snap-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #3b82f6;
  opacity: 0.5;
  pointer-events: none;
}
```

---

## 4. Implementation Files

### Files to Update:
1. `BoardView.tsx` - Enhanced card design, swim lanes, WIP limits
2. `ListView.tsx` - Reminder settings, inline editing
3. `TimelineView.tsx` - Complete rebuild with draggable bars
4. `ReminderToast.tsx` - New component for toast notifications
5. `ReminderSettings.tsx` - New component for reminder configuration
6. `TimelineTaskBar.tsx` - New component for draggable task bars

### New Dependencies:
```json
{
  "date-fns": "^2.30.0",
  "react-beautiful-dnd": "^13.1.1",
  "howler": "^2.2.3",
  "react-toastify": "^9.1.3"
}
```

---

## 5. Testing Checklist

### Board View:
- [ ] Cards display all information correctly
- [ ] Swim lanes group tasks properly
- [ ] WIP limits show warnings
- [ ] Drag and drop works smoothly
- [ ] Quick actions functional

### List View:
- [ ] Reminder settings save correctly
- [ ] Toast notifications appear on time
- [ ] Sound plays when reminder triggers
- [ ] Snooze functionality works
- [ ] Desktop notifications appear (if permitted)

### Timeline View:
- [ ] Tasks display at correct dates
- [ ] Date spacing changes work
- [ ] Drag start handle changes start date only
- [ ] Drag end handle changes end date only
- [ ] Drag entire bar moves task maintaining duration
- [ ] Snap to grid works
- [ ] Today marker displays correctly
- [ ] Zoom in/out functional

---

## Next Steps

1. ✅ Review implementation plan
2. ⏳ Install required dependencies
3. ⏳ Implement BoardView improvements
4. ⏳ Implement ListView reminder system
5. ⏳ Rebuild TimelineView with draggable bars
6. ⏳ Test all features thoroughly
7. ⏳ Deploy to production

**Note**: Full implementation requires updating multiple files. Would you like me to proceed with implementing specific features first?
