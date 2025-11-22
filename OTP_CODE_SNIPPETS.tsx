// This file contains the complete OTP integration code for WorkspaceMembersTab.tsx
// Apply these changes to add OTP functionality to member removal

// ===== STEP 1: Add state variables (around line 48) =====
const [otpCode, setOtpCode] = useState('');
const [otpSent, setOtpSent] = useState(false);
const [sendingOtp, setSendingOtp] = useState(false);

// ===== STEP 2: Update handleRemoveMember function (around line 249) =====
const handleRemoveMember = (memberId: string, memberName: string) => {
  setMemberToRemove({ id: memberId, name: memberName });
  setShowRemoveModal(true);
  // Reset OTP state when opening modal
  setOtpSent(false);
  setOtpCode('');
  setRemoveConfirmText('');
};

// ===== STEP 3: Add handleSendOtp function (after handleRemoveMember) =====
const handleSendOtp = async () => {
  if (!memberToRemove) return;

  try {
    setSendingOtp(true);
    await api.sendMemberRemovalOtp(workspaceId);
    
    setOtpSent(true);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'OTP sent to your email',
        duration: 3000
      }
    });
  } catch (error: any) {
    console.error('Failed to send OTP:', error);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: error?.message || 'Failed to send OTP',
        duration: 3000
      }
    });
  } finally {
    setSendingOtp(false);
  }
};

// ===== STEP 4: Update confirmRemoveMember function =====
const confirmRemoveMember = async () => {
  // Validate "REMOVE" text
  if (removeConfirmText !== 'REMOVE') {
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: 'Please type REMOVE to confirm',
        duration: 3000
      }
    });
    return;
  }

  // Validate OTP
  if (!otpCode || otpCode.trim().length === 0) {
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: 'Please enter the OTP sent to your email',
        duration: 3000
      }
    });
    return;
  }

  if (!memberToRemove) return;

  try {
    // Call backend API with OTP
    await api.delete(`/workspaces/${workspaceId}/members/${memberToRemove.id}?otp=${encodeURIComponent(otpCode)}`);
    
    // Refresh workspace data
    const response = await api.get(`/workspaces/${workspaceId}`);
    const updatedWorkspace = response.data;
    
    // Update members list
    const updatedMembers: Member[] = (updatedWorkspace.members || []).map((m: any) => {
      const user = m.user;
      const userId = typeof user === 'string' ? user : user?._id;
      const name = typeof user === 'string' ? user : user?.fullName || user?.username || user?.email || 'Member';
      const email = typeof user === 'string' ? '' : user?.email || '';
      return {
        _id: userId,
        userId,
        name,
        email,
        avatar: typeof user === 'string' ? undefined : user?.avatarUrl,
        role: m.role || 'member',
        joinedAt: m.joinedAt ? new Date(m.joinedAt) : new Date(),
        status: m.status === 'pending' || m.status === 'active' ? m.status : 'active',
      } as Member;
    });
    
    setMembers(updatedMembers);
    
    // Update global workspace state
    const allWorkspaces = await api.getWorkspaces();
    dispatch({ type: 'SET_WORKSPACES', payload: allWorkspaces });
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: `${memberToRemove.name} removed from workspace`,
        duration: 3000
      }
    });
    
    // Reset modal state
    setShowRemoveModal(false);
    setRemoveConfirmText('');
    setMemberToRemove(null);
    setOtpCode('');
    setOtpSent(false);
  } catch (error: any) {
    console.error('Failed to remove member:', error);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: error?.message || 'Failed to remove member. Please check your OTP.',
        duration: 3000
      }
    });
  }
};

// ===== STEP 5: Add OTP UI to modal (in the modal JSX, after the "Type REMOVE" section) =====
/*
Add this section after the "Type REMOVE to confirm" input field:
*/

{/* OTP Section */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Verification Code (OTP)
  </label>
  <div className="flex gap-2">
    <input
      type="text"
      value={otpCode}
      onChange={(e) => setOtpCode(e.target.value)}
      placeholder="Enter 6-digit OTP"
      maxLength={6}
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
      disabled={!otpSent}
    />
    <button
      onClick={handleSendOtp}
      disabled={sendingOtp || otpSent}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {sendingOtp ? 'Sending...' : otpSent ? 'OTP Sent ✓' : 'Send OTP'}
    </button>
  </div>
  <p className="text-xs text-gray-600 mt-1">
    {otpSent 
      ? '✓ OTP sent to your email. Please check your inbox.' 
      : 'Click "Send OTP" to receive a verification code via email.'}
  </p>
</div>

// ===== STEP 6: Update Remove Member button disabled condition =====
/*
Change the disabled condition of the "Remove Member" button to:
*/
disabled={removeConfirmText !== 'REMOVE' || !otpCode || otpCode.trim().length === 0}

// ===== STEP 7: Update Cancel button to reset OTP state =====
/*
Add these lines to the Cancel button's onClick handler:
*/
setOtpCode('');
setOtpSent(false);
