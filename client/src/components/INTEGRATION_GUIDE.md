# Integration Guide for Mail, Calendar & Vault UIs

## Quick Start

### Option 1: View All Apps in One Demo

Add this route to your `App.tsx`:

```tsx
import SarttHiAppsDemo from './components/SarttHiAppsDemo';

// Inside your Routes:
<Route path="/apps-demo" element={
  <ProtectedRoute>
    <SarttHiAppsDemo />
  </ProtectedRoute>
} />
```

Then navigate to `/apps-demo` to see all three applications with a tab switcher.

### Option 2: Individual Routes

Add separate routes for each application:

```tsx
import { InboxPage } from './components/mail';
import { WeekGrid } from './components/calendar';
import { VaultPage } from './components/vault';

// Inside your Routes:
<Route path="/mail" element={
  <ProtectedRoute>
    <InboxPage />
  </ProtectedRoute>
} />

<Route path="/calendar" element={
  <ProtectedRoute>
    <WeekGrid />
  </ProtectedRoute>
} />

<Route path="/vault" element={
  <ProtectedRoute>
    <VaultPage />
  </ProtectedRoute>
} />
```

### Option 3: Integrate into Dock Navigation

Update your `DockNavigation.tsx` to include links to these new apps:

```tsx
import { Mail, Calendar, FolderOpen } from 'lucide-react';

// Add to your navigation items:
const navItems = [
  // ... existing items
  { path: '/mail', icon: Mail, label: 'Mail' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/vault', icon: FolderOpen, label: 'Vault' },
];
```

## Customization Examples

### 1. Change Mail Folder Structure

Edit `src/components/mail/MailSidebar.tsx`:

```tsx
const folders: FolderItem[] = [
  { id: 'inbox', label: 'Inbox', icon: <Inbox size={16} />, count: 12 },
  { id: 'drafts', label: 'Drafts', icon: <FileText size={16} />, count: 3 },
  // Add your custom folders
];
```

### 2. Add Calendar Events from API

Edit `src/components/calendar/WeekGrid.tsx`:

```tsx
const [events, setEvents] = useState<Event[]>([]);

useEffect(() => {
  // Fetch events from your API
  fetch('/api/calendar/events')
    .then(res => res.json())
    .then(data => setEvents(data));
}, []);
```

### 3. Connect Vault to Backend

Edit `src/components/vault/VaultPage.tsx`:

```tsx
const [assets, setAssets] = useState<Asset[]>([]);

useEffect(() => {
  // Fetch files from your API
  fetch('/api/vault/files')
    .then(res => res.json())
    .then(data => setAssets(data));
}, [breadcrumbs]);
```

## Styling Notes

All components use the new dark mode color palette defined in `tailwind.config.js`:

- `bg-app-bg` - Main background (#191919)
- `bg-sidebar-bg` - Sidebar/card background (#202020)
- `bg-hover-bg` - Hover state (#262626)
- `border-border-subtle` - Subtle borders (#2C2C2C)
- `text-text-primary` - Primary text (#E3E3E3)
- `text-text-muted` - Muted text (#9CA3AF)

These colors work independently of your existing light/dark mode toggle.

## Making Components Responsive to Theme

If you want these components to respect your existing theme toggle, wrap them:

```tsx
import { useTheme } from './context/ThemeContext';

const ThemedMailPage = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={isDarkMode ? '' : 'light-mode-override'}>
      <InboxPage />
    </div>
  );
};
```

Then add light mode styles in your CSS:

```css
.light-mode-override {
  --app-bg: #F7F9FC;
  --sidebar-bg: #FFFFFF;
  /* ... etc */
}
```

## TypeScript Integration

All components are fully typed. Import types as needed:

```tsx
import type { Mail } from './components/mail/MailRow';
import type { Event } from './components/calendar/WeekGrid';
import type { Asset } from './components/vault/VaultPage';
```

## Performance Tips

1. **Lazy Loading**: Load these components only when needed:

```tsx
const InboxPage = lazy(() => import('./components/mail/InboxPage'));
const WeekGrid = lazy(() => import('./components/calendar/WeekGrid'));
const VaultPage = lazy(() => import('./components/vault/VaultPage'));
```

2. **Memoization**: For large lists, use React.memo:

```tsx
const MailRow = React.memo(MailRowComponent);
```

3. **Virtual Scrolling**: For very long mail lists, consider using `react-window` or `react-virtual`.

## Next Steps

1. Connect to your backend APIs
2. Add authentication checks
3. Implement real-time updates (WebSocket/SSE)
4. Add keyboard shortcuts
5. Implement drag-and-drop for vault
6. Add email composition modal
7. Add calendar event creation/editing
8. Add file upload for vault

## Troubleshooting

### Icons not showing
Make sure `lucide-react` is installed:
```bash
npm install lucide-react
```

### Colors not applying
Rebuild Tailwind CSS:
```bash
npm run build:css
# or restart your dev server
```

### TypeScript errors
Make sure all dependencies are installed:
```bash
npm install
```

## Support

For issues or questions, refer to:
- `UI_ENHANCEMENTS_README.md` - Component documentation
- Individual component files - Inline comments
- Tailwind config - Color definitions
