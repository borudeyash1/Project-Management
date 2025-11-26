# Sartthi UI Enhancements - Mail, Calendar & Vault

This directory contains three polished UI modules following modern dark-mode design aesthetics:

## 🎨 Design System

All three modules share a cohesive high-density dark mode theme:

### Color Palette
- **App Background**: `#191919` (Deep Gray)
- **Sidebar/Card Background**: `#202020` (Slightly lighter)
- **Hover Background**: `#262626`
- **Border Subtle**: `#2C2C2C`
- **Border Light**: `#333333`
- **Text Primary**: `#E3E3E3`
- **Text Light**: `#D1D5DB`
- **Text Muted**: `#9CA3AF`
- **Text Lighter**: `#6B7280`
- **Accent Blue**: `#2563EB`
- **Accent Red**: `#EF4444`

## 📧 Mail UI (Notion-style)

**Location**: `src/components/mail/`

### Components
- **`InboxPage.tsx`** - Main inbox view with search and filters
- **`MailRow.tsx`** - Individual email list item with hover actions
- **`MailSidebar.tsx`** - Compact navigation sidebar

### Features
- ✅ High-density list view
- ✅ Hover actions (Archive, Delete, Snooze)
- ✅ Unread indicators with blue dots
- ✅ Star/favorite functionality
- ✅ Filter pills (All, Unread, Starred, Important)
- ✅ Compact sidebar with folders and labels
- ✅ Search functionality

### Usage
```tsx
import { InboxPage } from './components/mail';

function App() {
  return <InboxPage />;
}
```

## 📅 Calendar UI (Cron-style)

**Location**: `src/components/calendar/`

### Components
- **`WeekGrid.tsx`** - Week view calendar grid
- **`EventCard.tsx`** - Event cards with pastel colors

### Features
- ✅ Week grid with 24-hour time slots
- ✅ Sticky day headers with current day highlighting
- ✅ "Now" indicator (red line + time badge)
- ✅ Subtle grid lines (`#262626`)
- ✅ Event cards with left border accent
- ✅ Pastel color schemes on dark background
- ✅ Automatic time positioning

### Event Colors
- **Blue**: `bg-blue-500/15 border-blue-500`
- **Gray**: `bg-gray-700/30 border-gray-500`
- **Green**: `bg-green-500/15 border-green-500`
- **Purple**: `bg-purple-500/15 border-purple-500`
- **Orange**: `bg-orange-500/15 border-orange-500`

### Usage
```tsx
import { WeekGrid } from './components/calendar';

function App() {
  return <WeekGrid />;
}
```

## 📁 Vault UI (Finder-style)

**Location**: `src/components/vault/`

### Components
- **`VaultPage.tsx`** - Main file explorer view
- **`AssetCard.tsx`** - Grid view card
- **`AssetRow.tsx`** - List view row

### Features
- ✅ Grid/List view toggle
- ✅ Breadcrumb navigation
- ✅ File type icons (Folder, Image, Video, Audio, Document)
- ✅ Search functionality
- ✅ Hover effects and transitions
- ✅ File metadata (size, modified date)
- ✅ Responsive grid layout

### File Types
- 📁 **Folder** - Yellow/Orange
- 📄 **File** - Gray
- 🖼️ **Image** - Blue
- 🎥 **Video** - Purple
- 🎵 **Audio** - Green

### Usage
```tsx
import { VaultPage } from './components/vault';

function App() {
  return <VaultPage />;
}
```

## 🚀 Demo Application

A unified demo is available in `SarttHiAppsDemo.tsx` that allows switching between all three applications:

```tsx
import SarttHiAppsDemo from './components/SarttHiAppsDemo';

function App() {
  return <SarttHiAppsDemo />;
}
```

## 🎯 Implementation Details

### Tailwind Configuration
The `tailwind.config.js` has been updated with:
- Custom color palette for dark mode
- Font size utilities (`text-13`, `text-2xs`)
- Aspect ratio utilities

### Typography
- **Mail Sender**: Font-Medium, `#E3E3E3`
- **Mail Subject**: Regular, `#D1D5DB`
- **Mail Preview**: Light, `#6B7280`
- **Sidebar Items**: `text-13` (13px)
- **Event Title**: Bold, `text-xs`
- **Event Time**: `text-2xs` (10px), opacity-80

### Interactions
- **Hover States**: Subtle background changes (`hover:bg-sidebar-bg`)
- **Active States**: `bg-hover-bg` with white text
- **Transitions**: All color changes use `transition-colors`
- **Group Hover**: Mail row actions appear on hover

## 📱 Responsive Design

All components are built with responsive design in mind:
- Grid layouts adjust based on screen size
- Flexible sidebar widths
- Mobile-friendly touch targets
- Overflow handling for long content

## 🎨 Customization

### Changing Colors
Update the color values in `tailwind.config.js`:

```js
colors: {
  'app-bg': '#191919',
  'sidebar-bg': '#202020',
  // ... etc
}
```

### Adding New Event Types
In `EventCard.tsx`, add new color schemes:

```tsx
const colorClasses = {
  // ... existing colors
  yellow: 'bg-yellow-500/15 border-yellow-500 text-yellow-100',
};
```

### Adding File Types
In `AssetCard.tsx` and `AssetRow.tsx`, extend the `getIcon()` function:

```tsx
case 'pdf':
  return <FileText {...iconProps} className="text-red-400" />;
```

## 🔧 Development

All components are built with:
- **React** + **TypeScript**
- **Tailwind CSS** for styling
- **Lucide React** for icons
- Fully typed props and interfaces

## 📝 Notes

- All components use the dark mode theme by default
- The design is optimized for desktop/laptop screens
- Icons are from `lucide-react` library
- All animations respect user preferences (can be disabled via data attributes)

---

**Created**: November 2025  
**Design References**: Notion Mail, Cron Calendar, macOS Finder
