# Workspace Invitations Feature - Implementation Guide

## Overview
This guide explains how to show **both Join Requests and Invitations** in the Members tab of a workspace.

---

## Current State

✅ **Join Requests** - Already working
- When users request to join a workspace
- Displayed in the Members tab
- Can be approved/declined by workspace owner/admin

❌ **Invitations** - Not displayed yet
- When workspace owner invites members
- Stored in database but not shown in UI
- Need to fetch and display them

---

## Backend Status

✅ **Already implemented:**
- `WorkspaceInvitation` model exists
- `sendWorkspaceInvite` endpoint exists (POST `/workspaces/:id/invite`)
- `getSentInvitations` endpoint exists (GET `/workspaces/:id/invitations`)
- `cancelWorkspaceInvite` endpoint exists (DELETE `/workspaces/:id/invitations/:invitationId`)

---

## Frontend Changes Made

✅ **API Service** (`client/src/services/api.ts`):
```typescript
async getWorkspaceInvitations(workspaceId: string): Promise<any[]> {
  const response = await this.get(`/workspaces/${workspaceId}/invitations`);
  return response.data || [];
}

async cancelWorkspaceInvitation(workspaceId: string, invitationId: string): Promise<void> {
  await this.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`);
}
```

---

## Next Steps - Update Members Tab

### 1. Add State for Invitations

In `WorkspaceMembersTab.tsx`, add:
```typescript
const [invitations, setInvitations] = useState<Invitation[]>([]);
```

### 2. Add Invitation Interface

```typescript
interface Invitation {
  _id: string;
  invitee: {
    _id: string;
    fullName: string;
    email: string;
    username?: string;
    avatarUrl?: string;
  };
  inviter: {
    fullName: string;
    email: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  message?: string;
}
```

### 3. Fetch Invitations

Add this useEffect alongside the join requests fetch:
```typescript
useEffect(() => {
  if (!canManageMembers || !workspaceId) return;

  const loadInvitations = async () => {
    try {
      console.log('🔍 [MEMBERS TAB] Fetching invitations for workspace:', workspaceId);
      const invites = await api.getWorkspaceInvitations(workspaceId);
      console.log('✅ [MEMBERS TAB] Received invitations:', invites);
      setInvitations(invites);
    } catch (error) {
      console.error('❌ [MEMBERS TAB] Failed to load invitations:', error);
    }
  };

  loadInvitations();
}, [workspaceId, canManageMembers]);
```

### 4. Add Cancel Invitation Handler

```typescript
const handleCancelInvitation = async (invitationId: string) => {
  try {
    await api.cancelWorkspaceInvitation(workspaceId, invitationId);
    
    // Remove from local state
    setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Invitation cancelled',
        duration: 2500
      }
    });
  } catch (error: any) {
    console.error('Failed to cancel invitation:', error);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: error?.message || 'Failed to cancel invitation',
        duration: 3000
      }
    });
  }
};
```

### 5. Update UI to Show Invitations

Add a new section in the render, after the Join Requests section:

```tsx
{/* Pending Invitations Section */}
{canManageMembers && invitations.length > 0 && (
  <div className="mb-8">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <Mail className="w-5 h-5" />
      {t('workspace.members.pendingInvitations')} ({invitations.length})
    </h3>
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <div
          key={invitation._id}
          className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div className="flex items-center gap-3">
            {invitation.invitee.avatarUrl ? (
              <img
                src={invitation.invitee.avatarUrl}
                alt={invitation.invitee.fullName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {invitation.invitee.fullName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div>
              <p className="font-medium">{invitation.invitee.fullName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invitation.invitee.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Invited {new Date(invitation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCancelInvitation(invitation._id)}
            className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel Invitation
          </button>
        </div>
      ))}
    </div>
  </div>
)}
```

### 6. Add Translation Keys

Add to `client/src/locales/en.json`:
```json
{
  "workspace": {
    "members": {
      "pendingInvitations": "Pending Invitations",
      "invitationCancelled": "Invitation cancelled",
      "cancelInvitation": "Cancel Invitation"
    }
  }
}
```

---

## Summary

**What this achieves:**

1. ✅ **Join Requests** section shows users who requested to join
2. ✅ **Pending Invitations** section shows users the owner invited
3. ✅ Owner can cancel pending invitations
4. ✅ Both sections managed in the same Members tab
5. ✅ Proper database management (invitations stored in `WorkspaceInvitation` collection)

**Database Collections:**
- `joinrequests` - User-initiated join requests
- `workspaceinvitations` - Owner-initiated invitations

Both are now visible and manageable from the Members tab!

---

## Testing

1. As workspace owner, invite a user via "Add Member"
2. Go to Members tab
3. You should see two sections:
   - **Join Requests** (users requesting to join)
   - **Pending Invitations** (users you invited)
4. You can cancel invitations that haven't been accepted yet

---

## Files Modified

- ✅ `client/src/services/api.ts` - Added API methods
- ⏳ `client/src/components/workspace-detail/WorkspaceMembersTab.tsx` - Need to add UI
- ⏳ `client/src/locales/en.json` - Need to add translations

The backend is already complete! Just need to update the frontend UI.
