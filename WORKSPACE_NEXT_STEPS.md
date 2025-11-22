# Workspace Management - Next Steps

## Summary
This document outlines the remaining tasks to complete the workspace management enhancement features based on the checkpoint summary.

## Completed Work (From Previous Session)
1. ✅ Backend join request system (JoinRequest model, controllers, routes)
2. ✅ Workspace settings backend (isPublic flag, updateWorkspaceSettings)
3. ✅ Backend routes for join requests and settings
4. ✅ CreateWorkspaceModal updated with isPublic toggle
5. ✅ Basic API service structure exists

## Remaining Frontend Tasks

### 1. **Update API Service** (`client/src/services/api.ts`)
Add the following methods after the `acceptWorkspaceInvite` method (around line 471):

```typescript
// Join request methods
async sendJoinRequest(workspaceId: string, message?: string): Promise<void> {
  await this.post(`/workspaces/${workspaceId}/join-request`, { message });
}

async getJoinRequests(workspaceId: string): Promise<any[]> {
  const response = await this.get(`/workspaces/${workspaceId}/join-requests`);
  return response.data || [];
}

async approveJoinRequest(workspaceId: string, requestId: string): Promise<void> {
  await this.post(`/workspaces/${workspaceId}/join-requests/${requestId}/approve`, {});
}

async rejectJoinRequest(workspaceId: string, requestId: string): Promise<void> {
  await this.post(`/workspaces/${workspaceId}/join-requests/${requestId}/reject`, {});
}

// Workspace settings
async updateWorkspaceSettings(workspaceId: string, settings: any): Promise<Workspace> {
  const response = await this.put<Workspace>(`/workspaces/${workspaceId}/settings`, { settings });
  return response.data!;
}

// Member management with OTP
async removeMember(workspaceId: string, memberId: string, reason: string, otp: string): Promise<void> {
  await this.delete(`/workspaces/${workspaceId}/members/${memberId}?reason=${encodeURIComponent(reason)}&otp=${otp}`);
}

async sendMemberRemovalOtp(workspaceId: string): Promise<void> {
  await this.post(`/workspaces/${workspaceId}/members/removal-otp`, {});
}

// Client management with OTP
async sendClientDeletionOtp(clientId: string): Promise<void> {
  await this.post(`/clients/${clientId}/deletion-otp`, {});
}

async deleteClientWithOtp(clientId: string, otp: string): Promise<void> {
  await this.delete(`/clients/${clientId}?otp=${otp}`);
}

// Member reporting
async reportMember(data: {
  workspaceId: string;
  reportedUserId: string;
  reason: string;
  description: string;
}): Promise<void> {
  await this.post('/reports/member', data);
}

async getReports(workspaceId: string): Promise<any[]> {
  const response = await this.get(`/reports/workspace/${workspaceId}`);
  return response.data || [];
}
```

### 2. **Update WorkspaceDiscover Component**
File: `client/src/components/WorkspaceDiscover.tsx`

Update the `handleJoinRequest` function (around line 111):
```typescript
const handleJoinRequest = async (workspaceId: string) => {
  try {
    await api.sendJoinRequest(workspaceId);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Join request sent successfully!'
      }
    });
  } catch (error) {
    console.error('Failed to send join request:', error);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to send join request'
      }
    });
  }
};
```

### 3. **Create Join Requests Component**
Create new file: `client/src/components/WorkspaceJoinRequests.tsx`

This component should:
- Display pending join requests for workspace owners
- Show user details (name, email, message)
- Provide approve/reject buttons
- Update the list after actions

### 4. **Enhance WorkspaceOwner Component**
File: `client/src/components/WorkspaceOwner.tsx`

#### Members Tab Enhancements:
- Replace simple delete with a modal that includes:
  - Reason dropdown (Performance Issues, Misconduct, Left Project, etc.)
  - OTP verification field
  - Confirmation button
- Add "Report Member" option with categories:
  - Verbal Abuse
  - Harassment
  - Spam
  - Other (with description field)

#### Projects Tab:
- Make three-dot menu functional with options:
  - Edit Project
  - Archive Project
  - Delete Project
  - View Details

#### Client Tab:
- **Edit Client**: Open modal with client details form
- **Delete Client**: 
  - Send OTP to user email
  - Show OTP input modal
  - Verify OTP before deletion

#### Profile Tab:
- Remove the role selector component

#### Collaborator Tab:
- Ensure invitation emails are sent
- Display pending invitations
- Show accept/reject status with notifications

### 5. **Backend Endpoints to Implement**

#### Member Removal with OTP:
```typescript
// POST /api/workspaces/:id/members/removal-otp
// DELETE /api/workspaces/:id/members/:memberId?reason=...&otp=...
```

#### Client Deletion with OTP:
```typescript
// POST /api/clients/:id/deletion-otp
// DELETE /api/clients/:id?otp=...
```

#### Member Reporting:
```typescript
// POST /api/reports/member
// GET /api/reports/workspace/:id
```

## Implementation Priority

1. **High Priority**:
   - Add API methods to `api.ts`
   - Update `WorkspaceDiscover` join request handler
   - Create Join Requests component

2. **Medium Priority**:
   - Implement member removal with OTP
   - Implement client deletion with OTP
   - Make Projects tab menu functional

3. **Low Priority**:
   - Member reporting system
   - Remove role selector from Profile tab
   - Enhance collaborator invitation flow

## Testing Checklist

- [ ] Join requests can be sent from Discover tab
- [ ] Workspace owners can see and manage join requests
- [ ] Member removal requires OTP verification
- [ ] Client deletion requires OTP verification
- [ ] Projects menu options work correctly
- [ ] Member reporting submits successfully
- [ ] Collaborator invitations send emails
- [ ] Role selector is removed from Profile tab

## Notes
- All OTP operations should have a timeout (e.g., 5 minutes)
- Ensure proper error handling and user feedback
- Add loading states for async operations
- Implement proper authorization checks on backend
