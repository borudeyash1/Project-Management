# Planner Page - Glassmorphic Design Update Guide

## 🎯 Objective
Update the Planner page (`/planner`) to use the glassmorphic design system.

## ✅ What to Update

### 1. Add Import
```tsx
// Add this after line 14
import GlassmorphicCard from './ui/GlassmorphicCard';
```

### 2. Update Main Calendar Card (Line ~462)
**Find:**
```tsx
<div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
```

**Replace with:**
```tsx
<GlassmorphicCard className="p-6">
```

**Don't forget to update the closing tag around line 623:**
```tsx
</GlassmorphicCard>
```

### 3. Update Today's Tasks Card (Line ~645)
**Find:**
```tsx
<div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
```

**Replace with:**
```tsx
<GlassmorphicCard className="p-4">
```

**Update closing tag around line 681:**
```tsx
</GlassmorphicCard>
```

### 4. Update Upcoming Events Card (Line ~684)
**Find:**
```tsx
<div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
```

**Replace with:**
```tsx
<GlassmorphicCard className="p-4">
```

**Update closing tag around line 702:**
```tsx
</GlassmorphicCard>
```

### 5. Update Quick Stats Card (Line ~705)
**Find:**
```tsx
<div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
```

**Replace with:**
```tsx
<GlassmorphicCard className="p-4">
```

**Update closing tag around line 727:**
```tsx
</GlassmorphicCard>
```

## 📝 Notes
- The page already has `GlassmorphicPageHeader` implemented (line 395-399) ✅
- The page already has the gradient background ✅
- The view switcher already uses accent colors ✅
- Only the cards need to be updated

## ⚠️ Important
- Make sure to update BOTH the opening `<div>` AND the closing `</div>` tags
- Test after each change to ensure no syntax errors
- The line numbers are approximate - search for the exact content

## 🎨 Result
After these changes, the Planner page will have:
- ✨ Glassmorphic calendar container
- 💎 Glassmorphic sidebar cards
- 🎨 Consistent design with NotesPage
- 🌙 Perfect dark mode support

## 📖 Reference
See `NotesPage.tsx` for examples of how GlassmorphicCard is used throughout a page.
