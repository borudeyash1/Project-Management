# Workspace Management Implementation Progress

## ✅ Completed Tasks

### 1. API Service Methods (client/src/services/api.ts)
Successfully added all required API methods:
- ✅ `sendJoinRequest(workspaceId, message?)` - Send join request to a workspace
- ✅ `getJoinRequests(workspaceId)` - Get pending join requests for a workspace
- ✅ `approveJoinRequest(workspaceId, requestId)` - Approve a join request
- ✅ `rejectJoinRequest(workspaceId, requestId)` - Reject a join request
- ✅ `updateWorkspaceSettings(workspaceId, settings)` - Update workspace settings
- ✅ `removeMember(workspaceId, memberId, reason, otp)` - Remove member with OTP
- ✅ `sendMemberRemovalOtp(workspaceId)` - Send OTP for member removal
- ✅ `sendClientDeletionOtp(clientId)` - Send OTP for client deletion
- ✅ `deleteClientWithOtp(clientId, otp)` - Delete client with OTP verification
- ✅ `reportMember(data)` - Report a member
- ✅ `getReports(workspaceId)` - Get reports for a workspace

### 2. WorkspaceDiscover Component
- ✅ Updated `handleJoinRequest` to call the actual API instead of just logging
- ✅ Removed TODO comment
- ✅ Proper error handling with toast notifications

### 3. WorkspaceJoinRequests Component
- ✅ Created new component at `client/src/components/WorkspaceJoinRequests.tsx`
- ✅ Displays pending join requests with user details
- ✅ Shows user avatar, name, email, optional message, and request date
- ✅ Approve/Reject buttons with proper API integration
- ✅ Loading and empty states
- ✅ Toast notifications for success/error

---

## 🔄 Remaining Backend Tasks

### 1. Member Removal with OTP
**File**: `server/src/controllers/workspaceController.ts`

Need to add two functions:

```typescript
export const sendMemberRemovalOtp: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!._id;

    // Verify user is workspace owner
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (workspace.owner.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only workspace owner can remove members' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP (use Redis in production)
    global.otpStore = global.otpStore || {};
    global.otpStore[`member-removal-${userId}`] = { otp, expiry: otpExpiry };

    // TODO: Send OTP via email
    console.log(`Member removal OTP for user ${userId}: ${otp}`);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error sending member removal OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const removeMember: RequestHandler = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { reason, otp } = req.query;
    const userId = (req as AuthenticatedRequest).user!._id;

    // Verify OTP
    const storedOtp = global.otpStore?.[`member-removal-${userId}`];
    if (!storedOtp || storedOtp.otp !== otp || new Date() > storedOtp.expiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Verify user is workspace owner
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    if (workspace.owner.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Only workspace owner can remove members' });
    }

    // Remove member
    workspace.members = workspace.members.filter(
      (member: any) => member.user.toString() !== memberId
    );

    await workspace.save();

    // Clear OTP
    delete global.otpStore[`member-removal-${userId}`];

    // Log removal
    console.log(`Member ${memberId} removed from workspace ${id}. Reason: ${reason}`);

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ success: false, message: 'Failed to remove member' });
  }
};
```

**Routes to add** in `server/src/routes/workspaces.ts`:
```typescript
router.post('/:id/members/removal-otp', sendMemberRemovalOtp);
router.delete('/:id/members/:memberId', removeMember);
```

### 2. Client Deletion with OTP
**File**: `server/src/controllers/clientController.ts` (create if doesn't exist)

Similar implementation to member removal:
- `sendClientDeletionOtp` - Generate and send OTP
- `deleteClientWithOtp` - Verify OTP and delete client

**Routes to add** in `server/src/routes/clients.ts`:
```typescript
router.post('/:id/deletion-otp', sendClientDeletionOtp);
router.delete('/:id', deleteClientWithOtp);
```

### 3. Member Reporting System
**File**: `server/src/controllers/reportController.ts` (create new)

Create a Report model and controller:
```typescript
// Model
const reportSchema = new Schema({
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Controller functions
export const reportMember: RequestHandler = async (req, res) => { ... };
export const getReports: RequestHandler = async (req, res) => { ... };
```

**Routes to add** in `server/src/routes/reports.ts` (create new):
```typescript
router.post('/member', reportMember);
router.get('/workspace/:id', getReports);
```

---

## 🎨 Remaining Frontend Tasks

### 1. Integrate WorkspaceJoinRequests into WorkspaceOwner
**File**: `client/src/components/WorkspaceOwner.tsx`

Add a new tab or section to display join requests:
```typescript
import WorkspaceJoinRequests from './WorkspaceJoinRequests';

// In the component, add a new tab:
{activeTab === 'requests' && (
  <WorkspaceJoinRequests workspaceId={workspace._id} />
)}
```

### 2. Enhance Members Tab
Add:
- Member removal modal with:
  - Reason dropdown (Performance Issues, Misconduct, Left Project, etc.)
  - OTP input field
  - Confirmation button
- Report member functionality with categories:
  - Verbal Abuse
  - Harassment
  - Spam
  - Other (with description)

### 3. Enhance Client Tab
- Implement Edit Client modal
- Implement Delete Client with OTP:
  - Button to request OTP
  - Modal to enter OTP
  - Confirmation and deletion

### 4. Projects Tab
Make the three-dot menu functional with options:
- Edit Project
- Archive Project
- Delete Project
- View Details

### 5. Profile Tab
- Remove the role selector component

---

## 📝 Testing Checklist

- [ ] Join request can be sent from Discover tab
- [ ] Join requests appear in WorkspaceJoinRequests component
- [ ] Approve button adds user to workspace
- [ ] Reject button removes the request
- [ ] OTP is sent for member removal
- [ ] Member removal requires valid OTP
- [ ] OTP expires after 5 minutes
- [ ] Client deletion requires OTP
- [ ] Member reporting submits successfully
- [ ] Reports are visible to workspace owner
- [ ] All error cases show appropriate messages
- [ ] Loading states display correctly

---

## 🚀 Next Steps (Priority Order)

1. **High Priority**:
   - Implement backend OTP endpoints for member removal
   - Integrate WorkspaceJoinRequests into WorkspaceOwner
   - Test join request flow end-to-end

2. **Medium Priority**:
   - Implement client deletion with OTP
   - Add member removal UI with OTP verification
   - Make Projects tab menu functional

3. **Low Priority**:
   - Implement member reporting system
   - Remove role selector from Profile tab
   - Add email notifications for OTP

---

## 📌 Notes

- OTP storage currently uses in-memory global object. **Replace with Redis in production**.
- Email sending functionality needs to be implemented for OTP delivery.
- Consider adding rate limiting for OTP requests.
- Add audit logging for all sensitive operations (member removal, client deletion).
- Consider adding confirmation dialogs for destructive actions.

---

## 🔗 Related Files

- `client/src/services/api.ts` - API methods ✅
- `client/src/components/WorkspaceDiscover.tsx` - Join request UI ✅
- `client/src/components/WorkspaceJoinRequests.tsx` - Join requests management ✅
- `client/src/components/WorkspaceOwner.tsx` - Needs integration
- `server/src/controllers/workspaceController.ts` - Needs OTP functions
- `server/src/routes/workspaces.ts` - Needs new routes
- `server/src/controllers/clientController.ts` - Needs creation
- `server/src/controllers/reportController.ts` - Needs creation

---

Last Updated: 2025-11-21
