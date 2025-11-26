# Implementation Plan - UI Enhancements & Notifications

This plan outlines the steps to upgrade the notification system across all sub-applications and enhance the UI for Calendar and Vault.

## 1. Notification System Upgrade (All Apps)
**Goal:** Replace native `alert()` and `confirm()` with a modern, custom Toast notification system.

### Steps:
1.  **Create Toast Components:**
    *   Create `src/components/Toast.tsx` and `src/components/ToastContainer.tsx` in `sartthi-mail-ui`, `sartthi-calendar-ui`, and `sartthi-vault-ui`.
    *   These will be based on the main client's implementation but adapted for standalone usage (using a local Context or simple state if a full AppContext isn't available/needed).
2.  **Create Toast Context:**
    *   Create `src/context/ToastContext.tsx` in each app to manage the toast state (add/remove toasts).
    *   Wrap the main `App` component with `ToastProvider`.
3.  **Replace Alerts:**
    *   Scan each codebase for `alert(` and `window.confirm(`.
    *   Replace `alert()` with `toast.success()`, `toast.error()`, etc.
    *   Replace `window.confirm()` with a custom `ConfirmationModal` (to be created) or a non-blocking UI pattern where applicable.

## 2. Sartthi Calendar UI Enhancements
**Goal:** Add "more aspect" and polish the UI.

### Steps:
1.  **Visual Polish:**
    *   Refactor `WeekGrid.tsx` to use Tailwind classes instead of inline styles for better consistency and dark mode support.
    *   Improve the "Current Time" indicator visuals.
2.  **Sidebar Improvements:**
    *   Enhance `ContextSidebar.tsx` to show a "Mini Calendar" (date picker) for quick navigation.
    *   Add an "Upcoming Events" list in the sidebar.
3.  **Drag & Drop Implementation:**
    *   Implement the `handleDragEnd` logic in `WeekGrid.tsx` to actually update event times when dragged.

## 3. Sartthi Vault UI Enhancements
**Goal:** Improve file management experience and visuals.

### Steps:
1.  **Recent Files Section:**
    *   Add a "Recent Files" section at the top of `VaultPage.tsx` showing the last 4-5 accessed/modified files.
2.  **Visual Improvements:**
    *   Enhance `AssetCard.tsx` with better hover effects and file type icons.
    *   Improve the "Storage Meter" visual to be more prominent or detailed.
3.  **Upload Experience:**
    *   Add a floating "Upload Progress" toast/widget instead of a blocking modal or simple alert.

## 4. Execution Order
1.  **Notifications:** Implement Toast system in Vault first (as requested by user screenshot), then Calendar, then Mail.
2.  **Vault UI:** Implement Recent Files and Visual improvements.
3.  **Calendar UI:** Implement Visual polish and Sidebar enhancements.
