import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import User from '../models/User';
import { uploadToS3, deleteFromS3 } from '../utils/s3Upload';

const router = Router();

/**
 * @route   POST /api/users/profile/enroll-face
 * @desc    Enroll user's face for attendance verification
 * @access  Private
 */
router.post('/profile/enroll-face', authMiddleware, async (req, res) => {
  try {
    const { faceImages } = req.body;
    const userId = req.user.id;

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

    // Delete old face images if they exist
    if (user.faceData?.images && user.faceData.images.length > 0) {
      for (const imageUrl of user.faceData.images) {
        try {
          // Extract key from URL and delete from S3
          const key = imageUrl.split('.com/')[1];
          if (key) {
            await deleteFromS3(key);
          }
        } catch (error) {
          console.error('Error deleting old face image:', error);
        }
      }
    }

    // Upload new images to S3
    const imageUrls: string[] = [];
    for (let i = 0; i < faceImages.length; i++) {
      try {
        const base64Data = faceImages[i].replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const filename = `face-data/${userId}/face-${Date.now()}-${i}.jpg`;
        
        // Upload to S3
        const imageUrl = await uploadToS3(buffer, filename, 'image/jpeg');
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error('Error uploading face image:', error);
        // Clean up already uploaded images
        for (const url of imageUrls) {
          try {
            const key = url.split('.com/')[1];
            if (key) await deleteFromS3(key);
          } catch (e) {
            console.error('Error cleaning up:', e);
          }
        }
        return res.status(500).json({
          message: 'Failed to upload face images'
        });
      }
    }

    // Update user's face data
    user.faceData = {
      images: imageUrls,
      verified: true,
      lastUpdated: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'Face enrolled successfully',
      data: {
        faceData: user.faceData
      }
    });
  } catch (error) {
    console.error('Face enrollment error:', error);
    res.status(500).json({
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
router.delete('/profile/face-data', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete face images from S3
    if (user.faceData?.images && user.faceData.images.length > 0) {
      for (const imageUrl of user.faceData.images) {
        try {
          const key = imageUrl.split('.com/')[1];
          if (key) {
            await deleteFromS3(key);
          }
        } catch (error) {
          console.error('Error deleting face image:', error);
        }
      }
    }

    // Clear face data
    user.faceData = {
      images: [],
      verified: false,
      lastUpdated: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'Face data deleted successfully'
    });
  } catch (error) {
    console.error('Face data deletion error:', error);
    res.status(500).json({
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
router.get('/profile/face-status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('faceData');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        isEnrolled: user.faceData?.verified || false,
        imageCount: user.faceData?.images?.length || 0,
        lastUpdated: user.faceData?.lastUpdated || null
      }
    });
  } catch (error) {
    console.error('Face status check error:', error);
    res.status(500).json({
      message: 'Failed to get face status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
