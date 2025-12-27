# Connection Guards - Usage Guide

## Overview
Connection Guards are reusable components that protect routes and features based on whether a user has connected their account for a specific service (Figma, Slack, GitHub, Dropbox, Notion, etc.).

## Architecture

### Base Component: `ConnectionGuard`
The generic guard that all service-specific guards extend from.

**Location:** `client/src/components/guards/ConnectionGuard.tsx`

**Features:**
- Checks if user has connected account for specified service
- Shows loading state while checking
- Displays helpful error screen if not connected
- Provides "Go Back" and "Open Settings" buttons
- Fully customizable with service name and icon

### Service-Specific Guards

All guards are located in `client/src/components/guards/`:

1. **FigmaGuard** - Protects Figma design features
2. **SlackGuard** - Protects Slack integration features
3. **GitHubGuard** - Protects GitHub repository features
4. **DropboxGuard** - Protects Dropbox file features
5. **NotionGuard** - Protects Notion workspace features

## Usage Examples

### Basic Usage

```typescript
import { FigmaGuard } from '../guards';

const MyFigmaComponent = () => {
  return (
    <FigmaGuard>
      <div>
        {/* Your Figma-specific content */}
        <h1>Figma Designs</h1>
      </div>
    </FigmaGuard>
  );
};
```

### Multiple Services

```typescript
import { SlackGuard, GitHubGuard } from '../guards';

const IntegrationDashboard = () => {
  return (
    <div>
      <SlackGuard>
        <SlackChannels />
      </SlackGuard>
      
      <GitHubGuard>
        <GitHubRepos />
      </GitHubGuard>
    </div>
  );
};
```

### Nested Guards

```typescript
import { NotionGuard } from '../guards';

const WorkspaceNotionTab = () => {
  return (
    <NotionGuard>
      <div className="p-6">
        <h2>Notion Workspaces</h2>
        <NotionWorkspaceList />
      </div>
    </NotionGuard>
  );
};
```

## How It Works

### 1. Connection Check
When a guard mounts, it checks:
```typescript
const serviceAccount = (user?.connectedAccounts as any)?.[service];

if (!serviceAccount?.activeAccountId || !serviceAccount?.accounts?.length) {
  // Not connected - show error screen
}
```

### 2. Loading State
While checking, displays:
```
┌─────────────────────┐
│   [Spinner Icon]    │
│ Checking connection │
└─────────────────────┘
```

### 3. Not Connected Screen
If no connection found:
```
┌──────────────────────────────┐
│    [Warning Icon]            │
│  Service Not Connected       │
│                              │
│  Instructions:               │
│  1. Go to Settings           │
│  2. Find Service             │
│  3. Click Connect            │
│  4. Return here              │
│                              │
│  [Go Back] [Open Settings]   │
└──────────────────────────────┘
```

### 4. Connected
If connected, renders children normally.

## Creating a New Guard

### Step 1: Create Guard Component

```typescript
// components/guards/MyServiceGuard.tsx
import React from 'react';
import ConnectionGuard from './ConnectionGuard';
import { MyIcon } from 'lucide-react';

interface MyServiceGuardProps {
  children: React.ReactNode;
}

const MyServiceGuard: React.FC<MyServiceGuardProps> = ({ children }) => {
  return (
    <ConnectionGuard
      service="myservice"  // Must match connectedAccounts key
      serviceName="My Service"
      serviceIcon={<MyIcon size={32} className="text-blue-600" />}
    >
      {children}
    </ConnectionGuard>
  );
};

export default MyServiceGuard;
```

### Step 2: Export from Index

```typescript
// components/guards/index.ts
export { default as MyServiceGuard } from './MyServiceGuard';
```

### Step 3: Use in Your Component

```typescript
import { MyServiceGuard } from '../guards';

const MyComponent = () => {
  return (
    <MyServiceGuard>
      <div>Protected content</div>
    </MyServiceGuard>
  );
};
```

## Current Implementations

### Workspace Design Tab
**File:** `components/workspace/WorkspaceDesignTab.tsx`
```typescript
<FigmaGuard>
  <div className="p-6 space-y-6">
    {/* Design library content */}
  </div>
</FigmaGuard>
```

### Project Design Hub
**File:** `components/project/ProjectDesignHub.tsx`
```typescript
<FigmaGuard>
  <div className="p-6 space-y-6">
    {/* Project designs content */}
  </div>
</FigmaGuard>
```

## Benefits

✅ **Reusable** - One abstraction for all services
✅ **Consistent UX** - Same experience across all integrations
✅ **Type-Safe** - Full TypeScript support
✅ **Easy to Extend** - Add new services in minutes
✅ **User-Friendly** - Clear instructions and navigation
✅ **Secure** - Prevents access without proper connection

## API Integration

Guards work in conjunction with backend authentication:

1. **Frontend Guard** - Blocks UI access
2. **Backend Auth** - Returns 401 if token invalid/missing
3. **User Experience** - Seamless error handling

## Customization

### Custom Icon
```typescript
<ConnectionGuard
  service="myservice"
  serviceName="My Service"
  serviceIcon={<CustomIcon size={32} />}
>
  {children}
</ConnectionGuard>
```

### Custom Service Name
```typescript
<ConnectionGuard
  service="github"
  serviceName="GitHub Enterprise"
  serviceIcon={<Github size={32} />}
>
  {children}
</ConnectionGuard>
```

## Testing

To test a guard:
1. Disconnect the service in Settings
2. Try to access protected route
3. Should see error screen
4. Click "Open Settings"
5. Connect account
6. Return to route
7. Should see content

## Future Enhancements

- [ ] Add retry button
- [ ] Add connection status indicator
- [ ] Add quick connect from guard screen
- [ ] Add multiple service requirements
- [ ] Add optional vs required connections
