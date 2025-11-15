# Theme Test Checklist ✅

## Pre-Flight Check

Before testing, ensure:
- [ ] Server is running on `http://localhost:5000`
- [ ] Client is running on `http://localhost:3000`
- [ ] You are logged into the application
- [ ] Browser DevTools Console is open (F12)

---

## Test 1: Profile Loads Without Crashing

### Steps:
1. [ ] Navigate to Profile page
2. [ ] Click on "Preferences" tab
3. [ ] Verify page loads successfully (no errors)

### Expected Result:
✅ Page displays theme options: Light, Dark, System
✅ No errors in browser console
✅ No "Cannot read properties of undefined" error

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 2: Light Theme

### Steps:
1. [ ] Go to Profile → Preferences
2. [ ] Click the "Light" button (with sun icon ☀️)
3. [ ] Observe the UI

### Expected Result:
✅ Light button has blue background (selected state)
✅ Background is light colored (#F7F9FC)
✅ Text is dark colored
✅ All elements are clearly visible
✅ Toast notification: "Preferences updated successfully!"

### Visual Check:
- [ ] Background is light/white
- [ ] Text is readable (dark on light)
- [ ] Buttons and inputs have light styling
- [ ] No visual glitches

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 3: Dark Theme

### Steps:
1. [ ] Go to Profile → Preferences
2. [ ] Click the "Dark" button (with moon icon 🌙)
3. [ ] Observe the UI

### Expected Result:
✅ Dark button has blue background (selected state)
✅ Background turns dark (#1F2937)
✅ Text turns light colored
✅ All elements remain visible and readable
✅ Toast notification: "Preferences updated successfully!"

### Visual Check:
- [ ] Background is dark gray/black
- [ ] Text is light/white and readable
- [ ] Inputs and forms have dark styling
- [ ] Border colors are visible
- [ ] No white flashes or glitches

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 4: System Theme

### Steps:
1. [ ] Note your OS theme setting (Light or Dark)
2. [ ] Go to Profile → Preferences
3. [ ] Click the "System" button (with settings icon ⚙️)
4. [ ] Observe the UI

### Expected Result:
✅ System button has blue background (selected state)
✅ UI matches your OS theme preference
✅ If OS is dark → App is dark
✅ If OS is light → App is light
✅ Toast notification: "Preferences updated successfully!"

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 5: Theme Persistence

### Steps:
1. [ ] Set theme to "Dark"
2. [ ] Verify UI is dark
3. [ ] Refresh the page (F5)
4. [ ] Navigate back to Profile → Preferences

### Expected Result:
✅ Theme remains dark after refresh
✅ Dark button is still selected (blue)
✅ No flash of light theme on page load
✅ localStorage has theme saved

### Browser Console Check:
```javascript
localStorage.getItem('theme') // Should return 'dark'
```

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 6: Theme Across Sessions

### Steps:
1. [ ] Set theme to "Light"
2. [ ] Close the browser completely
3. [ ] Reopen browser and navigate to app
4. [ ] Login if needed
5. [ ] Check if theme is still light

### Expected Result:
✅ Theme persists across browser sessions
✅ Light theme is still active
✅ No need to reset preference

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 7: Smooth Transitions

### Steps:
1. [ ] Go to Profile → Preferences
2. [ ] Switch from Light → Dark
3. [ ] Wait and observe the transition
4. [ ] Switch from Dark → Light
5. [ ] Observe the transition

### Expected Result:
✅ Color transition is smooth (not instant flash)
✅ Transition takes ~0.3 seconds
✅ No jarring visual changes
✅ No elements "jump" or reposition

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 8: Notification Toggles

### Steps:
1. [ ] Go to Profile → Preferences
2. [ ] Toggle "Email Notifications" switch
3. [ ] Toggle "Push Notifications" switch
4. [ ] Toggle "SMS Notifications" switch

### Expected Result:
✅ All toggles work smoothly
✅ Toggle animation is visible
✅ No crashes or errors
✅ Toast notifications appear
✅ Settings are saved

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 9: Privacy Settings

### Steps:
1. [ ] Go to Profile → Preferences
2. [ ] Change "Profile Visibility" dropdown
3. [ ] Toggle "Show Email" switch
4. [ ] Toggle "Show Phone" switch

### Expected Result:
✅ Dropdown changes work
✅ All toggles function properly
✅ No errors in console
✅ Toast notifications appear

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 10: Theme in Different Views

### Steps:
1. [ ] Set theme to Dark
2. [ ] Navigate to different sections:
   - [ ] Dashboard
   - [ ] Projects
   - [ ] Tasks
   - [ ] Team
   - [ ] Reports

### Expected Result:
✅ Dark theme applies to all sections
✅ All pages remain readable
✅ No sections appear broken
✅ Consistent styling throughout

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 11: Form Elements in Dark Mode

### Steps:
1. [ ] Set theme to Dark
2. [ ] Find a form (create project, edit task, etc.)
3. [ ] Test inputs, textareas, selects, buttons

### Expected Result:
✅ Input fields are visible (dark background)
✅ Text in inputs is readable (light color)
✅ Placeholder text is visible
✅ Borders are visible
✅ Dropdowns work and are styled correctly
✅ Buttons are visible and clickable

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 12: Browser Console Check

### Steps:
1. [ ] Open browser DevTools (F12)
2. [ ] Go to Console tab
3. [ ] Perform theme switches
4. [ ] Check for errors

### Expected Result:
✅ No errors in console
✅ No warnings about undefined properties
✅ No React errors
✅ No network errors

### Commands to Run:
```javascript
// Check theme in localStorage
console.log('Saved theme:', localStorage.getItem('theme'));

// Check if dark class is applied
console.log('Dark mode active:', document.documentElement.classList.contains('dark'));

// Check profile data in console
console.log('Has dark class:', document.querySelector('html').classList.contains('dark'));
```

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 13: Edge Cases

### Test 13a: Rapid Theme Switching
1. [ ] Click Light → Dark → System → Light rapidly
2. [ ] Verify no crashes or visual glitches

### Test 13b: Theme While Saving Other Preferences
1. [ ] Toggle a notification setting
2. [ ] Immediately switch theme
3. [ ] Verify both save successfully

### Test 13c: Theme Without Login
1. [ ] Logout
2. [ ] Check if login page respects theme
3. [ ] Login and verify theme persists

### Expected Result:
✅ No crashes during rapid switching
✅ All preferences save independently
✅ Theme persists through login/logout

### Status: ⬜ PASS / ⬜ FAIL

---

## Test 14: Mobile/Responsive View

### Steps:
1. [ ] Open browser DevTools (F12)
2. [ ] Toggle device toolbar (Ctrl+Shift+M)
3. [ ] Test theme switching on mobile view
4. [ ] Try different device sizes

### Expected Result:
✅ Theme buttons are accessible on mobile
✅ Dark/Light mode works on all screen sizes
✅ No layout breaks
✅ Buttons are tappable

### Status: ⬜ PASS / ⬜ FAIL

---

## Browser Compatibility Tests

Test on multiple browsers:

### Chrome/Edge
- [ ] Light theme works
- [ ] Dark theme works
- [ ] System theme works
- [ ] Persistence works

### Firefox
- [ ] Light theme works
- [ ] Dark theme works
- [ ] System theme works
- [ ] Persistence works

### Safari (if available)
- [ ] Light theme works
- [ ] Dark theme works
- [ ] System theme works
- [ ] Persistence works

### Status: ⬜ PASS / ⬜ FAIL

---

## Performance Check

### Steps:
1. [ ] Open DevTools → Performance tab
2. [ ] Start recording
3. [ ] Switch themes multiple times
4. [ ] Stop recording and analyze

### Expected Result:
✅ Theme switch is instant (<100ms)
✅ No frame drops or lag
✅ No memory leaks
✅ Smooth 60fps transitions

### Status: ⬜ PASS / ⬜ FAIL

---

## Final Verification

### All Tests Summary:
- [ ] Test 1: Profile Loads - ⬜ PASS
- [ ] Test 2: Light Theme - ⬜ PASS
- [ ] Test 3: Dark Theme - ⬜ PASS
- [ ] Test 4: System Theme - ⬜ PASS
- [ ] Test 5: Theme Persistence - ⬜ PASS
- [ ] Test 6: Cross Session - ⬜ PASS
- [ ] Test 7: Transitions - ⬜ PASS
- [ ] Test 8: Notifications - ⬜ PASS
- [ ] Test 9: Privacy - ⬜ PASS
- [ ] Test 10: Different Views - ⬜ PASS
- [ ] Test 11: Form Elements - ⬜ PASS
- [ ] Test 12: Console Check - ⬜ PASS
- [ ] Test 13: Edge Cases - ⬜ PASS
- [ ] Test 14: Responsive - ⬜ PASS
- [ ] Browser Compatibility - ⬜ PASS
- [ ] Performance - ⬜ PASS

### Overall Status:
⬜ ALL TESTS PASSED ✅
⬜ SOME TESTS FAILED ❌
⬜ TESTS NOT COMPLETED ⏳

---

## Issues Found (if any)

| Test # | Issue Description | Severity | Status |
|--------|------------------|----------|--------|
| | | | |
| | | | |
| | | | |

---

## Notes

**Tester Name**: _________________

**Date**: _________________

**Browser**: _________________

**OS**: _________________

**Additional Comments**:
```

---

## Quick Fix Commands

If something goes wrong:

```bash
# Clear cache and restart
cd "D:\YASH\Project Management\client"
rm -rf node_modules/.cache
npm start

# Clear localStorage in browser
localStorage.clear()
location.reload()

# Check for build errors
npm run build
```

---

**Test Completed**: ⬜ YES / ⬜ NO  
**Result**: ⬜ SUCCESS / ⬜ NEEDS WORK  
**Sign-off**: _________________