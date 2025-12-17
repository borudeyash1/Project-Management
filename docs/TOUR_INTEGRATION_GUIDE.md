# Quick Integration Guide - Onboarding Tours

## 🚀 Quick Start (5 Minutes)

### Step 1: Add to Your Page Component

```tsx
// Example: MailPage.tsx
import React from 'react';
import OnboardingTour from '../components/OnboardingTour';
import { mailTourSteps } from '../utils/tourSteps';
import { useTour } from '../hooks/useTour';

function MailPage() {
  const { isTourOpen, closeTour } = useTour('mail');

  return (
    <div>
      {/* Your existing mail UI */}
      <button data-tour="mail-compose">Compose</button>
      <div data-tour="mail-inbox">Inbox</div>
      <div data-tour="mail-folders">Folders</div>
      <input data-tour="mail-search" placeholder="Search..." />
      <button data-tour="mail-settings">Settings</button>

      {/* Add tour component */}
      <OnboardingTour
        steps={mailTourSteps}
        isOpen={isTourOpen}
        onClose={closeTour}
        onComplete={closeTour}
        tourKey="mail"
      />
    </div>
  );
}
```

### Step 2: Add data-tour Attributes

Just add `data-tour="unique-id"` to elements you want to highlight:

```tsx
// ✅ Good
<button data-tour="mail-compose" onClick={handleCompose}>
  Compose Email
</button>

// ✅ Good
<div data-tour="mail-inbox" className="inbox-container">
  {/* Inbox content */}
</div>

// ❌ Bad - Missing data-tour
<button onClick={handleCompose}>
  Compose Email
</button>
```

### Step 3: Test It!

1. Clear localStorage: `localStorage.clear()`
2. Refresh the page
3. Tour should auto-start after 1 second
4. Complete the tour
5. Refresh again - tour won't show (it's completed)

---

## 📋 Available Tours

### Home Tour
```tsx
import { homeTourSteps } from '../utils/tourSteps';
const { isTourOpen, closeTour } = useTour('home');
```

**Required data-tour attributes:**
- `data-tour="dock"` - Main dock container
- `data-tour="dock-mail"` - Mail icon
- `data-tour="dock-calendar"` - Calendar icon
- `data-tour="dock-vault"` - Vault icon
- `data-tour="user-menu"` - User menu

### Mail Tour
```tsx
import { mailTourSteps } from '../utils/tourSteps';
const { isTourOpen, closeTour } = useTour('mail');
```

**Required data-tour attributes:**
- `data-tour="mail-compose"` - Compose button
- `data-tour="mail-inbox"` - Inbox section
- `data-tour="mail-folders"` - Folders sidebar
- `data-tour="mail-search"` - Search input
- `data-tour="mail-settings"` - Settings button

### Calendar Tour
```tsx
import { calendarTourSteps } from '../utils/tourSteps';
const { isTourOpen, closeTour } = useTour('calendar');
```

**Required data-tour attributes:**
- `data-tour="calendar-create"` - Create event button
- `data-tour="calendar-view"` - View switcher
- `data-tour="calendar-grid"` - Calendar grid
- `data-tour="calendar-sidebar"` - Sidebar with upcoming events
- `data-tour="calendar-settings"` - Settings button

### Vault Tour
```tsx
import { vaultTourSteps } from '../utils/tourSteps';
const { isTourOpen, closeTour } = useTour('vault');
```

**Required data-tour attributes:**
- `data-tour="vault-sidebar"` - Navigation sidebar
- `data-tour="vault-upload"` - Upload button
- `data-tour="vault-search"` - Search input
- `data-tour="vault-view-toggle"` - Grid/List toggle
- `data-tour="vault-files"` - Files container
- `data-tour="vault-storage"` - Storage meter

---

## 🎛️ Advanced Usage

### Manual Tour Control

```tsx
const { isTourOpen, startTour, closeTour, resetTour } = useTour('mail');

// Start tour manually
<button onClick={startTour}>Show Tour</button>

// Close tour
<button onClick={closeTour}>Skip Tour</button>

// Reset and restart tour
<button onClick={resetTour}>Restart Tour</button>
```

### Settings Page Integration

```tsx
// Settings.tsx
import { useTour } from '../hooks/useTour';

function Settings() {
  const mailTour = useTour('mail');
  const calendarTour = useTour('calendar');
  const vaultTour = useTour('vault');
  const homeTour = useTour('home');

  return (
    <div className="settings-section">
      <h3>Help & Tutorials</h3>
      <div className="tour-buttons">
        <button onClick={homeTour.resetTour}>
          🏠 Show Home Tour
        </button>
        <button onClick={mailTour.resetTour}>
          📧 Show Mail Tour
        </button>
        <button onClick={calendarTour.resetTour}>
          📅 Show Calendar Tour
        </button>
        <button onClick={vaultTour.resetTour}>
          🔒 Show Vault Tour
        </button>
      </div>
    </div>
  );
}
```

### Custom Tour Steps

```tsx
// Create your own tour
import { TourStep } from '../components/OnboardingTour';

const customTourSteps: TourStep[] = [
  {
    target: '[data-tour="my-element"]',
    title: 'Welcome!',
    description: 'This is a custom tour step.',
    position: 'bottom',
    action: 'Click here to continue'
  },
  // Add more steps...
];

// Use it
<OnboardingTour
  steps={customTourSteps}
  isOpen={isTourOpen}
  onClose={closeTour}
  onComplete={closeTour}
  tourKey="custom-tour"
/>
```

---

## 🐛 Troubleshooting

### Tour Not Showing?

1. **Check localStorage:**
   ```javascript
   // In browser console
   localStorage.getItem('tour-mail-completed')
   // If it returns 'true', clear it:
   localStorage.removeItem('tour-mail-completed')
   ```

2. **Check data-tour attributes:**
   ```javascript
   // In browser console
   document.querySelector('[data-tour="mail-compose"]')
   // Should return the element, not null
   ```

3. **Check tour is imported:**
   ```tsx
   // Make sure you have:
   import OnboardingTour from '../components/OnboardingTour';
   import { mailTourSteps } from '../utils/tourSteps';
   import { useTour } from '../hooks/useTour';
   ```

### Element Not Highlighting?

- **Wrong selector:** Make sure `data-tour` value matches the tour step's `target`
- **Element not rendered:** Tour runs after 1 second, element must exist
- **Wrong position:** Try changing `position` in tour step definition

### Tooltip Positioning Issues?

```tsx
// Adjust position in tourSteps.ts
{
  target: '[data-tour="my-element"]',
  title: 'Title',
  description: 'Description',
  position: 'top' // Try: 'top', 'bottom', 'left', 'right'
}
```

---

## 📱 Responsive Behavior

Tours automatically:
- ✅ Scroll elements into view
- ✅ Adjust tooltip positioning
- ✅ Work on mobile devices
- ✅ Handle window resizing

---

## ♿ Accessibility

Tours include:
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ High contrast mode support

---

## 🎨 Customization

### Change Colors

Edit `OnboardingTour.tsx`:
```tsx
// Progress bar gradient
className="bg-gradient-to-r from-blue-500 to-purple-500"

// Spotlight border
className="border-4 border-blue-500"

// Button colors
className="bg-gradient-to-r from-blue-500 to-purple-500"
```

### Change Animation Speed

Edit `index.css`:
```css
@keyframes fadeIn {
  /* Change duration in component */
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out; /* Slower */
}
```

### Change Auto-start Delay

Edit `useTour.ts`:
```typescript
const timer = setTimeout(() => {
  setIsTourOpen(true);
}, 2000); // 2 seconds instead of 1
```

---

## 📊 Analytics (Optional)

Track tour completion:

```tsx
const handleComplete = () => {
  // Send analytics event
  analytics.track('Tour Completed', {
    tourKey: 'mail',
    timestamp: new Date()
  });
  
  closeTour();
};

<OnboardingTour
  onComplete={handleComplete}
  // ... other props
/>
```

---

## ✅ Checklist

Before deploying:

- [ ] All `data-tour` attributes added
- [ ] Tours imported in each page
- [ ] "Show Tour Again" buttons in Settings
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Tested in dark mode
- [ ] Tested with screen reader
- [ ] Analytics tracking added (optional)
- [ ] Documentation updated

---

## 🆘 Need Help?

Common issues and solutions in `IMPLEMENTATION_SUMMARY.md`

Happy touring! 🎉
