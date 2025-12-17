# App Info Cards & Account Management - Integration Guide

## Overview
This guide explains how to integrate:
1. **App Info Cards** - Show when users click on Mail/Calendar/Vault icons (if not connected)
2. **Connected Accounts Management** - Allow users to disconnect/reconnect in Settings

---

## Part 1: App Info Cards on Dock

### Step 1: Import AppInfoCard in DockNavigation

```tsx
// In DockNavigation.tsx
import { useState } from 'react';
import AppInfoCard from './AppInfoCard';

const DockNavigation: React.FC = () => {
  const [showInfoCard, setShowInfoCard] = useState<'mail' | 'calendar' | 'vault' | null>(null);
  
  // ... existing code
};
```

### Step 2: Add Click Handlers for Dock Icons

```tsx
// In DockNavigation.tsx

const handleDockIconClick = (app: 'mail' | 'calendar' | 'vault') => {
  // Check if module is connected
  const isConnected = state.userProfile.modules?.[app]?.refreshToken;
  
  if (!isConnected) {
    // Show info card
    setShowInfoCard(app);
  } else {
    // Open the app
    if (app === 'mail') {
      window.open('https://mail.sartthi.com', '_blank');
    } else if (app === 'calendar') {
      window.open('https://calendar.sartthi.com', '_blank');
    } else if (app === 'vault') {
      window.open('https://vault.sartthi.com', '_blank');
    }
  }
};
```

### Step 3: Update Dock Icons

```tsx
// In DockNavigation.tsx - Update your dock icons

<DockIcon onClick={() => handleDockIconClick('mail')}>
  <Mail />
</DockIcon>

<DockIcon onClick={() => handleDockIconClick('calendar')}>
  <Calendar />
</DockIcon>

<DockIcon onClick={() => handleDockIconClick('vault')}>
  <Shield />
</DockIcon>
```

### Step 4: Render AppInfoCard

```tsx
// In DockNavigation.tsx - Add at the end of your component

return (
  <>
    {/* Your existing dock UI */}
    
    {/* App Info Card */}
    {showInfoCard && (
      <AppInfoCard
        app={showInfoCard}
        onClose={() => setShowInfoCard(null)}
        onConnect={() => {
          // Redirect to connection flow
          window.location.href = `/api/auth/sartthi/connect-${showInfoCard}`;
        }}
      />
    )}
  </>
);
```

---

## Part 2: Connected Accounts in Settings

### Step 1: Add to Settings Page

```tsx
// In Settings.tsx or SettingsPage.tsx
import ConnectedAccounts from '../components/ConnectedAccounts';

function Settings() {
  return (
    <div className="settings-container">
      {/* Other settings sections */}
      
      {/* Connected Accounts Section */}
      <section className="settings-section">
        <ConnectedAccounts />
      </section>
      
      {/* Other settings sections */}
    </div>
  );
}
```

### Step 2: Register Disconnect Routes in Server

```typescript
// In server/src/index.ts or app.ts
import disconnectRoutes from './routes/disconnect-modules';

// Add the route
app.use('/api/auth/sartthi', disconnectRoutes);
```

---

## Part 3: Backend API Endpoints

The following endpoints are now available:

### Disconnect Mail
```
POST /api/auth/sartthi/disconnect-mail
Headers: Cookie with auth token
Response: { success: true, message: 'Mail disconnected successfully' }
```

### Disconnect Calendar
```
POST /api/auth/sartthi/disconnect-calendar
Headers: Cookie with auth token
Response: { success: true, message: 'Calendar disconnected successfully' }
```

### Disconnect Vault
```
POST /api/auth/sartthi/disconnect-vault
Headers: Cookie with auth token
Response: { success: true, message: 'Vault disconnected successfully' }
```

---

## Features

### App Info Cards
✅ Beautiful animated cards
✅ App-specific information
✅ Feature lists
✅ Privacy notes (for Vault)
✅ Connect/Cancel buttons
✅ Responsive design
✅ Dark mode compatible

### Connected Accounts
✅ View all connected accounts
✅ See connection status
✅ View connected email
✅ See connection date
✅ Disconnect with confirmation
✅ Reconnect option
✅ Loading states
✅ Privacy information

---

## User Flow

### New User Flow:
1. User clicks on Mail/Calendar/Vault icon in dock
2. If not connected → **Info card appears**
3. User reads about the app
4. User clicks "Connect Now"
5. Redirected to Google OAuth
6. After connection → App opens

### Existing User Flow:
1. User clicks on Mail/Calendar/Vault icon in dock
2. If connected → **App opens directly**

### Disconnect Flow:
1. User goes to Settings
2. Clicks "Disconnect" on an account
3. Confirmation dialog appears
4. User confirms
5. Account disconnected
6. User can reconnect with a different account

---

## Styling

### App Colors:
- **Mail**: Blue (`from-blue-500 to-blue-600`)
- **Calendar**: Purple (`from-purple-500 to-purple-600`)
- **Vault**: Green (`from-green-500 to-emerald-600`)

### Animations:
- `animate-fadeIn` - Backdrop fade in
- `animate-slideUp` - Card slide up from bottom

---

## Testing Checklist

### App Info Cards:
- [ ] Card appears when clicking on unconnected app
- [ ] Card shows correct app information
- [ ] "Connect Now" redirects to OAuth
- [ ] "Maybe Later" closes the card
- [ ] Backdrop click closes the card
- [ ] Animations are smooth
- [ ] Mobile responsive
- [ ] Dark mode works

### Connected Accounts:
- [ ] Shows all three apps (Mail, Calendar, Vault)
- [ ] Displays connection status correctly
- [ ] Shows connected email
- [ ] Shows connection date
- [ ] Disconnect button works
- [ ] Confirmation dialog appears
- [ ] Loading state shows during disconnect
- [ ] Page reloads after disconnect
- [ ] Reconnect button works
- [ ] Privacy note shows for Vault

---

## Files Created

```
client/src/
├── components/
│   ├── AppInfoCard.tsx          ← Info cards for dock
│   └── ConnectedAccounts.tsx    ← Settings component

server/src/
└── routes/
    └── disconnect-modules.ts    ← Disconnect API endpoints
```

---

## Next Steps

1. **Integrate AppInfoCard** in DockNavigation component
2. **Add ConnectedAccounts** to Settings page
3. **Register disconnect routes** in server
4. **Test the complete flow**
5. **Deploy**

---

## Example Screenshots

### App Info Card (Mail)
```
┌─────────────────────────────────────┐
│  📧  Sartthi Mail                   │
│      Not connected yet              │
├─────────────────────────────────────┤
│                                     │
│  Access your Gmail inbox with a    │
│  beautiful, modern interface...    │
│                                     │
│  Features:                          │
│  • Connect your Gmail account      │
│  • Modern email interface          │
│  • Real-time synchronization       │
│  • Compose and send emails         │
│  • Organize with folders           │
│                                     │
│  [Maybe Later]  [Connect Now →]    │
└─────────────────────────────────────┘
```

### Connected Accounts (Settings)
```
┌─────────────────────────────────────┐
│  📧  Sartthi Mail          ✓        │
│      Gmail integration              │
│      Email: user@gmail.com          │
│      Connected on Nov 27, 2025      │
│                          [Disconnect]│
├─────────────────────────────────────┤
│  📅  Sartthi Calendar      ✓        │
│      Google Calendar integration    │
│      Email: user@gmail.com          │
│      Connected on Nov 27, 2025      │
│                          [Disconnect]│
├─────────────────────────────────────┤
│  🔒  Sartthi Vault         ✓        │
│      Secure file storage            │
│      Email: user@gmail.com          │
│      Connected on Nov 27, 2025      │
│                          [Disconnect]│
│  🔒 Privacy: We only access files   │
│     in your "Sartthi Vault" folder  │
└─────────────────────────────────────┘
```

---

## Support

For issues or questions, refer to:
- `IMPLEMENTATION_SUMMARY.md` - Complete technical overview
- `TOUR_INTEGRATION_GUIDE.md` - Onboarding tours guide

Happy coding! 🚀
