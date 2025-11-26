# Simple Manual Integration Guide

Due to file editing limitations, please make these simple manual changes:

## File: client/src/components/DockNavigation.tsx

### Change 1: Add Import (Line 26, after other imports)
```typescript
import AppInfoCard from './AppInfoCard';
```

### Change 2: Add State (Line 41, after `const [showWorkspaces, setShowWorkspaces] = useState(false);`)
```typescript
const [showInfoCard, setShowInfoCard] = useState<'mail' | 'calendar' | 'vault' | null>(null);
```

### Change 3: Replace handleAppClick function (Lines 117-131)

**FIND THIS:**
```typescript
const handleAppClick = (appName: 'mail' | 'calendar' | 'vault') => {
  const url = getAppUrl(appName);
  
  // Pass the token via URL parameter for seamless SSO across subdomains
  // Works for both localhost (dev) and sartthi.com (prod)
  const token = localStorage.getItem('accessToken');
  if (token) {
    const separator = url.includes('?') ? '&' : '?';
    const authUrl = `${url}${separator}token=${token}`;
    window.open(authUrl, '_blank');
    return;
  }
  
  window.open(url, '_blank');
};
```

**REPLACE WITH:**
```typescript
const handleAppClick = (appName: 'mail' | 'calendar' | 'vault') => {
  // Check if module is connected
  const isConnected = state.userProfile.modules?.[appName]?.refreshToken;
  
  if (!isConnected) {
    // Show info card
    setShowInfoCard(appName);
    return;
  }
  
  // Module is connected, open the app
  const url = getAppUrl(appName);
  
  // Pass the token via URL parameter for seamless SSO across subdomains
  const token = localStorage.getItem('accessToken');
  if (token) {
    const separator = url.includes('?') ? '&' : '?';
    const authUrl = `${url}${separator}token=${token}`;
    window.open(authUrl, '_blank');
    return;
  }
  
  window.open(url, '_blank');
};
```

### Change 4: Add AppInfoCard Component (Before the closing `</>`, around line 320)

**ADD THIS BEFORE `</>`:**
```typescript
{/* App Info Card */}
{showInfoCard && (
  <AppInfoCard
    app={showInfoCard}
    onClose={() => setShowInfoCard(null)}
    onConnect={() => {
      window.location.href = `/api/auth/sartthi/connect-${showInfoCard}`;
    }}
  />
)}
```

---

## That's It!

Just these 4 simple changes and the AppInfoCard integration is complete!

The server routes are already added (you did that), so everything should work!
