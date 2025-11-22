// Validate member removal OTP (add this after sendMemberRemovalOtp function)
export const validateMemberRemovalOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: workspaceId } = req.params;
    const { otp } = req.body;
    const currentUserId = req.user!._id;

    // Get user
    const user = await User.findById(currentUserId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const userAny = user as any;
    
    // Validate OTP
    if (!userAny.otp || !userAny.otpExpiry || userAny.otp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
      return;
    }

    if (new Date() > userAny.otpExpiry) {
      res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
      return;
    }

    // OTP is valid - DON'T clear it yet (will be cleared on actual removal)
    res.status(200).json({
      success: true,
      message: 'OTP validated successfully'
    });
  } catch (error: any) {
    console.error('Validate member removal OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
