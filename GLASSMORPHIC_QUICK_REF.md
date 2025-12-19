# 🎨 Glassmorphic Design - Quick Reference

## 📦 Component Imports
```tsx
import GlassmorphicPageHeader from './ui/GlassmorphicPageHeader';
import GlassmorphicCard from './ui/GlassmorphicCard';
import { useTheme } from '../context/ThemeContext';
import { useDock } from '../context/DockContext';
```

## 🎯 Page Header
```tsx
<GlassmorphicPageHeader
  icon={IconName}
  title="Page Title"
  subtitle="Description"
/>
```

## 📦 Card Component
```tsx
<GlassmorphicCard className="p-6">
  Content here
</GlassmorphicCard>
```

## 🎨 Accent Button
```tsx
<button
  style={{
    background: `linear-gradient(135deg, ${preferences.accentColor} 0%, ${preferences.accentColor}dd 100%)`
  }}
  className="px-6 py-3 text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
>
  Button Text
</button>
```

## 🌈 Page Background
```tsx
className={`min-h-screen ${
  isDarkMode 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
    : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20'
}`}
```

## 📖 Reference
See: `client/src/components/NotesPage.tsx` for complete example
Full Guide: `GLASSMORPHIC_DESIGN_GUIDE.md`
