# Theme and Appearance System Implementation

## Status: Backend Complete ✅ | Frontend In Progress 🔄

## What's Been Done

### Backend ✅
1. **User Model Updated** (`server/src/models/user.model.ts`)
   - Added `preferences` field with:
     - `theme`: 'light' | 'dark' | 'system'
     - `accentColor`: string (hex color)
     - `fontSize`: 'small' | 'medium' | 'large'
     - `density`: 'compact' | 'comfortable' | 'spacious'
     - `animations`: boolean
     - `reducedMotion`: boolean

2. **API Endpoints Created** (`server/src/controllers/userController.ts`)
   - `GET /api/users/preferences` - Get user preferences
   - `PUT /api/users/preferences` - Update user preferences

3. **Routes Added** (`server/src/routes/users.ts`)
   - Preferences routes registered and protected with authentication

## What Needs to Be Done

### Frontend Tasks

#### 1. Enhanced ThemeContext (`client/src/context/ThemeContext.tsx`)
**Current State**: Simple dark/light toggle with localStorage
**Needed**: Full theme system with:
- Support for 'system' theme (follows OS preference)
- Accent color management
- Font size control
- Density settings
- Animation preferences
- Sync with backend API

#### 2. Settings Page Integration (`client/src/components/Settings.tsx`)
**Current State**: UI exists but doesn't apply changes
**Needed**:
- Connect to API endpoints
- Apply theme changes in real-time
- Show current selection as highlighted
- Persist to database

#### 3. Navbar Theme Button (`client/src/components/SharedNavbar.tsx` or similar)
**Current State**: Theme toggle button exists but may not work properly
**Needed**:
- Connect to ThemeContext
- Update to sync with database
- Show current theme state

#### 4. Global CSS Variables
**Needed**: Apply theme settings globally
- Font size CSS variables
- Density spacing variables
- Accent color CSS variables
- Animation duration variables

## Implementation Steps

### Step 1: Update ThemeContext
```typescript
// Add to ThemeContext:
- accentColor state
- fontSize state
- density state
- animations state
- reducedMotion state
- fetchPreferences() from API
- updatePreferences() to API
- applyTheme() function
```

### Step 2: Create Theme Utility
```typescript
// utils/theme.ts
- applyFontSize()
- applyDensity()
- applyAccentColor()
- applyAnimations()
```

### Step 3: Update Settings Component
```typescript
// In renderAppearance():
- Fetch preferences on mount
- Highlight current selections
- Call API on change
- Apply changes immediately
```

### Step 4: Add CSS Variables
```css
:root {
  --font-size-small: 14px;
  --font-size-medium: 16px;
  --font-size-large: 18px;
  
  --density-compact: 0.75rem;
  --density-comfortable: 1rem;
  --density-spacious: 1.5rem;
  
  --accent-color: #FBBF24;
  
  --animation-duration: 200ms;
}
```

## Testing Checklist

- [ ] Theme changes persist after page reload
- [ ] Theme syncs across tabs
- [ ] System theme follows OS preference
- [ ] Accent color applies to buttons/links
- [ ] Font size changes are visible
- [ ] Density affects spacing
- [ ] Animations can be disabled
- [ ] Reduced motion works for accessibility
- [ ] Settings page highlights current selection
- [ ] Navbar theme button works
- [ ] Changes save to database
- [ ] Changes load on login

## API Endpoints

### Get Preferences
```
GET /api/users/preferences
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "theme": "dark",
    "accentColor": "#FBBF24",
    "fontSize": "medium",
    "density": "comfortable",
    "animations": true,
    "reducedMotion": false
  }
}
```

### Update Preferences
```
PUT /api/users/preferences
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "theme": "dark",
  "accentColor": "#3B82F6",
  "fontSize": "large",
  "density": "spacious",
  "animations": false,
  "reducedMotion": true
}

Response:
{
  "success": true,
  "data": { ...updated preferences }
}
```

## Next Steps

1. Push backend changes to VPS
2. Implement enhanced ThemeContext
3. Connect Settings page
4. Test thoroughly
5. Deploy to production

---
**Note**: This is a comprehensive system that affects the entire application. Test thoroughly before deploying!
