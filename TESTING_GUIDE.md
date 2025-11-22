# Quick Testing Guide - Workspace Management Features

## 🧪 Test Scenarios

### 1. Join Request Flow

#### A. Send Join Request (User Perspective)
1. Navigate to "Discover Workspaces" tab
2. Find a public workspace
3. Click "Send Join Request" button
4. **Expected**: Success toast appears
5. **Backend**: Check database for new JoinRequest document

#### B. View Join Requests (Owner Perspective)
1. Navigate to your workspace
2. Open WorkspaceJoinRequests component (once integrated)
3. **Expected**: See list of pending requests with user details
4. **Backend**: GET `/api/workspaces/:id/join-requests`

#### C. Approve Join Request
1. Click "Approve" button on a request
2. **Expected**: 
   - Success toast
   - Request disappears from list
   - User added to workspace members
3. **Backend**: POST `/api/workspaces/:id/join-requests/:requestId/approve`

#### D. Reject Join Request
1. Click "Reject" button on a request
2. **Expected**:
   - Success toast
   - Request disappears from list
3. **Backend**: POST `/api/workspaces/:id/join-requests/:requestId/reject`

---

### 2. Member Removal with OTP

#### A. Request OTP
```javascript
// Frontend call
await api.sendMemberRemovalOtp(workspaceId);
```

**Backend Endpoint**: `POST /api/workspaces/:id/members/removal-otp`

**Expected**:
- OTP generated (6 digits)
- Stored in user document
- Email sent with OTP
- Console log: `Member removal OTP for user <userId>: <otp>`

#### B. Remove Member with OTP
```javascript
// Frontend call
await api.removeMember(workspaceId, memberId, "Performance Issues", "123456");
```

**Backend Endpoint**: `DELETE /api/workspaces/:id/members/:memberId?otp=123456&reason=Performance%20Issues`

**Expected**:
- OTP validated
- Member removed from workspace
- OTP cleared
- Console log: `Member <memberId> removed from workspace <id> by <userId>. Reason: Performance Issues`

**Error Cases**:
- Invalid OTP → 400 "Invalid OTP"
- Expired OTP → 400 "OTP has expired"
- No OTP sent → 400 "Invalid OTP"

---

### 3. Workspace Settings Update

```javascript
// Frontend call
await api.updateWorkspaceSettings(workspaceId, {
  isPublic: true,
  allowMemberInvites: false
});
```

**Backend Endpoint**: `PUT /api/workspaces/:id/settings`

**Expected**:
- Settings updated
- Workspace returned with new settings
- If `isPublic` changed, workspace visibility in Discover tab updates

---

## 🔍 Manual Testing Checklist

### Join Requests
- [ ] Can send join request to public workspace
- [ ] Cannot send join request to private workspace
- [ ] Join requests appear in owner's view
- [ ] Approve adds user to workspace
- [ ] Reject removes request
- [ ] Toast notifications work for all actions
- [ ] Loading states display correctly
- [ ] Empty state shows when no requests

### Member Removal
- [ ] OTP is sent to owner's email
- [ ] OTP appears in console logs
- [ ] Valid OTP allows removal
- [ ] Invalid OTP shows error
- [ ] Expired OTP (>5 min) shows error
- [ ] Reason is logged in console
- [ ] Member is actually removed from workspace
- [ ] OTP is cleared after use
- [ ] Cannot reuse same OTP

### Workspace Settings
- [ ] Can update isPublic setting
- [ ] Public workspaces appear in Discover
- [ ] Private workspaces don't appear in Discover
- [ ] Settings persist after page reload

---

## 🐛 Debugging Tips

### Check OTP in Database
```javascript
// In MongoDB shell or Compass
db.users.findOne({ _id: ObjectId("userId") }, { otp: 1, otpExpiry: 1 })
```

### Check Join Requests
```javascript
db.joinrequests.find({ workspace: ObjectId("workspaceId"), status: "pending" })
```

### Check Workspace Members
```javascript
db.workspaces.findOne({ _id: ObjectId("workspaceId") }, { members: 1 })
```

### Server Logs to Watch
```bash
# In server terminal, watch for:
- "Member removal OTP for user <userId>: <otp>"
- "Member <memberId> removed from workspace <id> by <userId>. Reason: <reason>"
- "Failed to send OTP email:" (if email service fails)
```

---

## 📱 API Testing with Postman/Thunder Client

### 1. Send Member Removal OTP
```
POST http://localhost:5000/api/workspaces/{{workspaceId}}/members/removal-otp
Headers:
  Authorization: Bearer {{token}}
```

### 2. Remove Member
```
DELETE http://localhost:5000/api/workspaces/{{workspaceId}}/members/{{memberId}}?otp=123456&reason=Performance%20Issues
Headers:
  Authorization: Bearer {{token}}
```

### 3. Send Join Request
```
POST http://localhost:5000/api/workspaces/{{workspaceId}}/join-request
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body:
{
  "message": "I would like to join this workspace"
}
```

### 4. Get Join Requests
```
GET http://localhost:5000/api/workspaces/{{workspaceId}}/join-requests
Headers:
  Authorization: Bearer {{token}}
```

### 5. Approve Join Request
```
POST http://localhost:5000/api/workspaces/{{workspaceId}}/join-requests/{{requestId}}/approve
Headers:
  Authorization: Bearer {{token}}
```

---

## ⚠️ Common Issues

### Issue: "Invalid OTP" even with correct OTP
**Solution**: Check if OTP has expired (>5 minutes). Request new OTP.

### Issue: OTP not received in email
**Solution**: 
1. Check email service configuration
2. Check console logs for OTP
3. Verify email address is correct

### Issue: Join request button does nothing
**Solution**:
1. Check browser console for errors
2. Verify API endpoint is correct
3. Check if user is authenticated

### Issue: Cannot see join requests
**Solution**:
1. Verify you are the workspace owner
2. Check if WorkspaceJoinRequests component is integrated
3. Verify backend route is working

---

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Join Requests**:
   - ✅ Toast: "Join request sent successfully!"
   - ✅ Request appears in database
   - ✅ Owner can see request in UI

2. **Member Removal**:
   - ✅ Toast: "OTP sent to your email"
   - ✅ Console log with OTP
   - ✅ Toast: "Member removed successfully"
   - ✅ Member no longer in workspace

3. **No Errors**:
   - ✅ No 404 errors
   - ✅ No TypeScript errors
   - ✅ No console errors
   - ✅ All API calls return 200/201

---

Last Updated: 2025-11-21
