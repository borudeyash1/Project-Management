# Quick Reference - Workspace Management APIs

## 🔐 OTP-Based Operations

### Member Removal

```typescript
// Step 1: Request OTP
POST /api/workspaces/:workspaceId/members/removal-otp
Authorization: Bearer <token>

Response: { success: true, message: "OTP sent to your email" }
Console: "Member removal OTP for user <userId>: 123456"

// Step 2: Remove with OTP
DELETE /api/workspaces/:workspaceId/members/:memberId?otp=123456&reason=Performance%20Issues
Authorization: Bearer <token>

Response: { success: true, message: "Member removed successfully" }
```

### Client Deletion

```typescript
// Step 1: Request OTP
POST /api/clients/:clientId/deletion-otp
Authorization: Bearer <token>

Response: { success: true, message: "OTP sent to your email" }
Console: "Client deletion OTP for user <userId>: 123456"

// Step 2: Delete with OTP
DELETE /api/clients/:clientId/with-otp?otp=123456&reason=No%20longer%20needed
Authorization: Bearer <token>

Response: { success: true, message: "Client deleted successfully" }
```

---

## 📋 Join Requests

```typescript
// Send Join Request
POST /api/workspaces/:workspaceId/join-request
Body: { message: "I would like to join" }
Authorization: Bearer <token>

// Get Join Requests (Owner)
GET /api/workspaces/:workspaceId/join-requests
Authorization: Bearer <token>

// Approve Request
POST /api/workspaces/:workspaceId/join-requests/:requestId/approve
Authorization: Bearer <token>

// Reject Request
POST /api/workspaces/:workspaceId/join-requests/:requestId/reject
Authorization: Bearer <token>
```

---

## ⚙️ Workspace Settings

```typescript
// Update Settings
PUT /api/workspaces/:workspaceId/settings
Body: {
  isPublic: true,
  allowMemberInvites: false
}
Authorization: Bearer <token>
```

---

## 🎨 Frontend API Usage

```typescript
import api from './services/api';

// Member Removal
await api.sendMemberRemovalOtp(workspaceId);
await api.removeMember(workspaceId, memberId, reason, otp);

// Client Deletion
await api.sendClientDeletionOtp(clientId);
await api.deleteClientWithOtp(clientId, reason, otp);

// Join Requests
await api.sendJoinRequest(workspaceId, message);
await api.getJoinRequests(workspaceId);
await api.approveJoinRequest(workspaceId, requestId);
await api.rejectJoinRequest(workspaceId, requestId);

// Settings
await api.updateWorkspaceSettings(workspaceId, settings);

// Reporting (Pending Backend)
await api.reportMember(workspaceId, memberId, reason, description);
await api.getReports(workspaceId);
```

---

## 🔑 OTP Details

- **Format**: 6 digits (e.g., 123456)
- **Validity**: 5 minutes
- **Delivery**: Email
- **Storage**: User document
- **Clearing**: Automatic after use
- **Reuse**: Not allowed

---

## ⚠️ Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Invalid OTP | Wrong OTP entered |
| 400 | OTP has expired | >5 minutes passed |
| 403 | Access denied | Not owner/admin |
| 404 | Not found | Invalid ID |
| 500 | Internal server error | Server issue |

---

## 📊 Access Control

| Operation | Owner | Admin | Manager | Member |
|-----------|-------|-------|---------|--------|
| Send Join Request | ✅ | ✅ | ✅ | ✅ |
| Approve Join Request | ✅ | ❌ | ❌ | ❌ |
| Update Settings | ✅ | ❌ | ❌ | ❌ |
| Remove Member | ✅ | ✅ | ❌ | ❌ |
| Delete Client | ✅ | ✅ | ❌ | ❌ |
| Report Member | ✅ | ✅ | ✅ | ✅ |

---

## 🧪 Testing Checklist

### Member Removal
- [ ] Send OTP request
- [ ] Receive OTP in email/console
- [ ] Remove with valid OTP
- [ ] Try invalid OTP (should fail)
- [ ] Try expired OTP (should fail)
- [ ] Verify member removed
- [ ] Check audit log

### Client Deletion
- [ ] Send OTP request
- [ ] Receive OTP in email/console
- [ ] Delete with valid OTP
- [ ] Try invalid OTP (should fail)
- [ ] Try expired OTP (should fail)
- [ ] Verify client status = inactive
- [ ] Check audit log

### Join Requests
- [ ] Send join request
- [ ] View as owner
- [ ] Approve request
- [ ] Verify member added
- [ ] Reject request
- [ ] Verify request removed

---

## 🚨 Common Issues

**OTP not received**:
- Check email spam folder
- Check console logs for OTP
- Verify SMTP configuration

**"Invalid OTP" error**:
- Check OTP hasn't expired
- Ensure correct OTP entered
- Request new OTP if needed

**"Access denied" error**:
- Verify user is owner/admin
- Check workspace membership
- Ensure correct workspace ID

---

Last Updated: 2025-11-21 18:10 IST
