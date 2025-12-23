# Page Layout Standardization Guide

## 🎯 Standard Page Structure

All pages should follow this consistent structure for smooth navigation:

### **1. Container Structure**
```tsx
<div className={`min-h-screen flex flex-col ${isDarkMode 
  ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
  : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20'
}`}>
```

### **2. Main Content Wrapper**
```tsx
<div
  className="p-4 sm:p-6 transition-all duration-300"
  style={{
    paddingLeft: dockPosition === 'left' ? 'calc(1.5rem + 100px)' : undefined,
    paddingRight: dockPosition === 'right' ? 'calc(1.5rem + 100px)' : undefined
  }}
>
```

### **3. Page Header (First Element)**
```tsx
<GlassmorphicPageHeader
  icon={YourIcon}
  title={t('page.title')}
  subtitle={t('page.subtitle')}
/>
```

### **4. Content Grid (Consistent Spacing)**
```tsx
{/* Main content starts here with consistent gap */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Your content */}
</div>
```

## 📏 Standard Spacing Values

- **Page padding**: `p-4 sm:p-6` (responsive)
- **Dock offset**: `calc(1.5rem + 100px)`
- **Header margin bottom**: `mb-4` (built into GlassmorphicPageHeader)
- **Content grid gap**: `gap-6`
- **Card padding**: `p-4` or `p-6` depending on content density

## ✅ Pages to Standardize

1. `/notes` - ✅ Already correct
2. `/projects` - Needs update
3. `/notifications` - Needs update
4. `/settings` - Needs update
5. `/profile` - Needs update
6. `/workspace` - Needs update
7. `/reports` - Needs update
8. `/goals` - Needs update

## 🔧 Implementation Checklist

For each page:
- [ ] Use standard container with gradient background
- [ ] Apply responsive padding (`p-4 sm:p-6`)
- [ ] Add dock-aware padding
- [ ] Use GlassmorphicPageHeader as first element
- [ ] Ensure consistent gap between header and content
- [ ] Use standard grid layout where applicable
