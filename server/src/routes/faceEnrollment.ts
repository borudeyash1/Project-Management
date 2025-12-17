import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

const router = Router();

/**
 * @route   POST /api/users/profile/enroll-face
 * @desc    Enroll user's face for attendance verification
 * @access  Private
 */
router.post('/profile/enroll-face', authenticate, async (req, res) => {
  try {
    const { faceImages } = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!._id.toString();

    // Validate input
    if (!faceImages || !Array.isArray(faceImages) || faceImages.length === 0) {
      return res.status(400).json({
        message: 'Please provide at least one face image'
      });
    }

    if (faceImages.length > 5) {
      return res.status(400).json({
        message: 'Maximum 5 face images allowed'
      });
    }

    // Validate base64 images
    for (const img of faceImages) {
      if (!img.startsWith('data:image/')) {
        return res.status(400).json({
          message: 'Invalid image format. Please provide base64 encoded images'
        });
      }
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For now, store base64 images directly
    // TODO: Implement S3 upload or file storage
    const imageUrls = faceImages;

    // Update user's face data
    user.faceData = {
      images: imageUrls,
      verified: true,
      lastUpdated: new Date()
    };

    await user.save();

    return res.json({
      success: true,
      message: 'Face enrolled successfully',
      data: {
        faceData: user.faceData
      }
    });
  } catch (error) {
    console.error('Face enrollment error:', error);
    return res.status(500).json({
      message: 'Failed to enroll face',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   DELETE /api/users/profile/face-data
 * @desc    Delete user's enrolled face data
 * @access  Private
 */
router.delete('/profile/face-data', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!._id.toString();

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear face data
    user.faceData = {
      images: [],
      verified: false,
      lastUpdated: new Date()
    };

    await user.save();

    return res.json({
      success: true,
      message: 'Face data deleted successfully'
    });
  } catch (error) {
    console.error('Face data deletion error:', error);
    return res.status(500).json({
      message: 'Failed to delete face data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   GET /api/users/profile/face-status
 * @desc    Get user's face enrollment status
 * @access  Private
 */
router.get('/profile/face-status', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!._id.toString();

    const user = await User.findById(userId).select('faceData');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      success: true,
      data: {
        isEnrolled: user.faceData?.verified || false,
        imageCount: user.faceData?.images?.length || 0,
        lastUpdated: user.faceData?.lastUpdated || null
      }
    });
  } catch (error) {
    console.error('Face status check error:', error);
    return res.status(500).json({
      message: 'Failed to get face status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
