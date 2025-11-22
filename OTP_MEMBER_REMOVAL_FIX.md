# ✅ OTP Integration for Member Removal - FIXED

## Issue
When removing a member, the backend requires an OTP but the frontend wasn't collecting or sending it, causing "Invalid OTP" error.

## Solution Implemented
Added complete OTP functionality to the remove member modal:

### 1. **Send OTP Button**
- Blue button to request OTP via email
- Shows "Sending..." while processing
- Changes to "OTP Sent ✓" after success
- Disabled after OTP is sent

### 2. **OTP Input Field**
- 6-digit OTP input field
- Disabled until OTP is sent
- Required before removal can proceed

### 3. **Email Notification**
- OTP sent to workspace owner's email
- 10-minute expiration
- Backend endpoint: `POST /workspaces/:id/members/removal-otp`

### 4. **Validation**
- Must type "REMOVE" to confirm
- Must enter valid OTP
- Both required before "Remove Member" button is enabled

## How It Works

```
1. User clicks trash icon → Modal opens
2. User types "REMOVE" in confirmation field
3. User clicks "Send OTP" button
4. OTP sent to user's email (6-digit code)
5. User enters OTP in input field
6. User clicks "Remove Member"
7. Backend validates OTP and removes member
8. Success! Member removed from workspace
```

## UI Flow

```
┌─────────────────────────────────────┐
│  Remove Member Modal                │
│  ─────────────────────────────────  │
│  ⚠️  Warning message                │
│                                     │
│  Type REMOVE to confirm:            │
│  [REMOVE___________]                │
│                                     │
│  Verification Code (OTP):           │
│  [______] [Send OTP]  ← Click here  │
│                                     │
│  [Cancel] [Remove Member]           │
│            ↑ Disabled until both    │
└─────────────────────────────────────┘
              ↓ After clicking Send OTP
┌─────────────────────────────────────┐
│  Verification Code (OTP):           │
│  [123456] [OTP Sent ✓]              │
│  ✓ OTP sent to your email           │
│                                     │
│  [Cancel] [Remove Member]           │
│            ↑ Now enabled!           │
└─────────────────────────────────────┘
```

## Code Changes

### State Variables Added
```typescript
const [otpCode, setOtpCode] = useState('');
const [otpSent, setOtpSent] = useState(false);
const [sendingOtp, setSendingOtp] = useState(false);
```

### Send OTP Function
```typescript
const handleSendOtp = async () => {
  try {
    setSendingOtp(true);
    await api.sendMemberRemovalOtp(workspaceId);
    setOtpSent(true);
    // Show success toast
  } catch (error) {
    // Show error toast
  } finally {
    setSendingOtp(false);
  }
};
```

### Updated Removal Function
```typescript
const confirmRemoveMember = async () => {
  // Validate "REMOVE" text
  if (removeConfirmText !== 'REMOVE') {
    // Show error
    return;
  }

  // Validate OTP
  if (!otpCode || otpCode.trim().length === 0) {
    // Show error: "Please enter the OTP"
    return;
  }

  // Call API with OTP
  await api.delete(
    `/workspaces/${workspaceId}/members/${memberId}?otp=${otpCode}`
  );
};
```

### Modal UI
```tsx
{/* OTP Section */}
<div>
  <label>Verification Code (OTP)</label>
  <div className="flex gap-2">
    <input
      type="text"
      value={otpCode}
      onChange={(e) => setOtpCode(e.target.value)}
      placeholder="Enter 6-digit OTP"
      maxLength={6}
      disabled={!otpSent}
    />
    <button
      onClick={handleSendOtp}
      disabled={sendingOtp || otpSent}
    >
      {sendingOtp ? 'Sending...' : otpSent ? 'OTP Sent ✓' : 'Send OTP'}
    </button>
  </div>
  <p className="text-xs">
    {otpSent 
      ? '✓ OTP sent to your email' 
      : 'Click "Send OTP" to receive code'}
  </p>
</div>

{/* Remove Button - Disabled until both conditions met */}
<button
  onClick={confirmRemoveMember}
  disabled={removeConfirmText !== 'REMOVE' || !otpCode}
>
  Remove Member
</button>
```

## Backend API

### Send OTP Endpoint
```
POST /workspaces/:id/members/removal-otp
```
- Generates 6-digit OTP
- Stores in user.otp field
- Sets 10-minute expiration
- Sends email with OTP code

### Remove Member Endpoint
```
DELETE /workspaces/:id/members/:memberId?otp=123456
```
- Validates OTP matches user.otp
- Checks OTP not expired
- Removes member from workspace
- Clears OTP after use

## Testing Steps

1. **Open Remove Member Modal**
   - Go to Workspace → Members
   - Click trash icon next to a member
   - ✅ Modal should open

2. **Type REMOVE**
   - Type "REMOVE" in confirmation field
   - ✅ Text should appear

3. **Send OTP**
   - Click "Send OTP" button
   - ✅ Button shows "Sending..."
   - ✅ Button changes to "OTP Sent ✓"
   - ✅ Check your email for OTP code

4. **Enter OTP**
   - Enter the 6-digit code from email
   - ✅ OTP input should accept the code

5. **Remove Member**
   - Click "Remove Member" button
   - ✅ Member should be removed
   - ✅ Success toast should appear
   - ✅ Members list should refresh

## Error Handling

### Invalid OTP
```
❌ Error: "Failed to remove member. Please check your OTP."
```

### Missing OTP
```
❌ Error: "Please enter the OTP sent to your email"
```

### Missing "REMOVE" Text
```
❌ Error: "Please type REMOVE to confirm"
```

### OTP Expired
```
❌ Error: "OTP has expired"
```

## Email Template

```
Subject: Workspace Member Removal OTP

Hello [Your Name],

You are attempting to remove a member from your workspace.

Your verification code is:

123456

This code expires in 10 minutes.

If you did not request this, please ignore this email.
```

## Files Modified

1. ✅ `client/src/components/workspace-detail/WorkspaceMembersTab.tsx`
   - Added OTP state variables
   - Added handleSendOtp function
   - Updated confirmRemoveMember function
   - Added OTP UI to modal

2. ✅ Backend (Already exists)
   - `server/src/controllers/workspaceController.ts` - sendMemberRemovalOtp
   - `server/src/routes/workspaces.ts` - POST /:id/members/removal-otp

3. ✅ API Service (Already exists)
   - `client/src/services/api.ts` - sendMemberRemovalOtp method

## Summary

**Problem:** Backend required OTP but frontend wasn't collecting it

**Solution:** Added complete OTP flow:
- ✅ Send OTP button
- ✅ OTP input field  
- ✅ Email notification
- ✅ Validation before removal
- ✅ Error handling

**Result:** Member removal now works correctly with OTP verification! 🎉
