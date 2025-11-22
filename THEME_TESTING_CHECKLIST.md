# Theme & Appearance Testing Checklist

## 🎯 Test URL
**Navigate to:** `http://localhost:3000/settings`

## ✅ Pre-Test Checklist
- [ ] Client is running on `http://localhost:3000`
- [ ] Server is running on `http://localhost:5000`
- [ ] You are logged in to the application
- [ ] Browser DevTools (F12) is open to Console tab

---

## 📋 Test 1: Settings Page Loads
**Steps:**
1. Navigate to `http://localhost:3000/settings`
2. Click on "Appearance" tab

**Expected:**
- [ ] Page loads without errors
- [ ] Appearance tab shows theme settings
- [ ] No errors in browser console

**Screenshot Location:** If issues, take screenshot

---

## 📋 Test 2: Theme Selection Highlighting
**Current State Check:**

**Expected:**
- [ ] One theme button (Light/Dark/System) has yellow background + ring
- [ ] One accent color has a ring around it
- [ ] One font size button is highlighted
- [ ] One density button is highlighted
- [ ] Animation toggles show current state

**What to look for:**
- Selected items should have `ring-2 ring-accent ring-offset-2` styling
- Should be visually obvious which option is selected

---

## 📋 Test 3: Theme Change (Light/Dark/System)
**Steps:**
1. Click on "Dark" button
2. Wait 1 second

**Expected:**
- [ ] Page immediately switches to dark mode
- [ ] Toast notification appears: "Theme changed to dark"
- [ ] Dark button now has yellow background + ring
- [ ] Check DevTools Network tab: See PUT request to `/api/users/preferences`
- [ ] Response status: 200 OK

**Repeat for:**
- [ ] Light theme
- [ ] System theme

---

## 📋 Test 4: Accent Color Change
**Steps:**
1. Click on a different color circle (e.g., blue #3B82F6)
2. Wait 1 second

**Expected:**
- [ ] Color circle gets a ring around it
- [ ] Toast notification: "Accent color updated"
- [ ] Buttons on page change to new accent color
- [ ] Network request to `/api/users/preferences` with status 200

**Test multiple colors:**
- [ ] Yellow (#FBBF24)
- [ ] Blue (#3B82F6)
- [ ] Red (#EF4444)
- [ ] Green (#10B981)

---

## 📋 Test 5: Font Size Change
**Steps:**
1. Click "Small" button
2. Observe text size changes
3. Click "Large" button
4. Observe text size changes

**Expected:**
- [ ] Text size changes immediately
- [ ] Selected button has yellow background + ring
- [ ] Toast notification appears
- [ ] Network request successful

---

## 📋 Test 6: Density Change
**Steps:**
1. Click "Compact" button
2. Click "Spacious" button

**Expected:**
- [ ] Spacing adjusts (may be subtle)
- [ ] Selected button highlighted
- [ ] Toast notification appears
- [ ] Network request successful

---

## 📋 Test 7: Animation Toggles
**Steps:**
1. Toggle "Animations" switch OFF
2. Toggle "Reduced Motion" switch ON

**Expected:**
- [ ] Switches move smoothly
- [ ] Switch background color changes (yellow when ON)
- [ ] No toast notifications (by design)
- [ ] Network requests successful

---

## 📋 Test 8: Persistence After Reload
**Steps:**
1. Make several changes (theme, color, font size)
2. Note your selections
3. Refresh the page (F5)
4. Navigate back to Settings > Appearance

**Expected:**
- [ ] All your selections are still highlighted
- [ ] Theme is still applied
- [ ] Accent color is still applied
- [ ] Font size is still applied

---

## 📋 Test 9: API Verification
**Check Browser DevTools > Network Tab:**

**For each change, verify:**
- [ ] Request URL: `http://localhost:5000/api/users/preferences`
- [ ] Request Method: `PUT`
- [ ] Status Code: `200 OK`
- [ ] Request Payload contains the changed preference
- [ ] Response contains updated preferences

**Example Request Payload:**
```json
{
  "theme": "dark"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Preferences updated successfully",
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

---

## 📋 Test 10: Console Error Check
**Check Browser DevTools > Console Tab:**

**Expected:**
- [ ] No red error messages
- [ ] No warnings about failed API calls
- [ ] May see debug logs (these are OK)

**Common Issues to Look For:**
- ❌ "Failed to fetch" errors
- ❌ "Cannot read property of undefined" errors
- ❌ CORS errors
- ❌ 401 Unauthorized errors
- ❌ 500 Server errors

---

## 🐛 Troubleshooting

### If theme doesn't change:
1. Check browser console for errors
2. Verify ThemeContext is loaded
3. Check if `updatePreferences` function is being called

### If selections aren't highlighted:
1. Check if `preferences` object exists in ThemeContext
2. Verify comparison logic (e.g., `preferences.theme === theme`)

### If API calls fail:
1. Check server is running on port 5000
2. Verify you're logged in (check localStorage for `accessToken`)
3. Check server logs for errors

### If changes don't persist:
1. Check API response is successful
2. Verify database is connected
3. Check user model has `preferences` field

---

## 📊 Test Results Summary

**Date:** _______________
**Tester:** _______________

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| Settings Page Loads | ☐ | ☐ | |
| Theme Highlighting | ☐ | ☐ | |
| Theme Change Works | ☐ | ☐ | |
| Accent Color Works | ☐ | ☐ | |
| Font Size Works | ☐ | ☐ | |
| Density Works | ☐ | ☐ | |
| Animation Toggles | ☐ | ☐ | |
| Persistence | ☐ | ☐ | |
| API Calls | ☐ | ☐ | |
| No Console Errors | ☐ | ☐ | |

**Overall Status:** ☐ PASS | ☐ FAIL

**Issues Found:**
_____________________________________________
_____________________________________________
_____________________________________________

**Screenshots/Evidence:**
_____________________________________________
