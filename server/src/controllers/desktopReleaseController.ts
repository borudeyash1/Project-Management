import { Response } from 'express';
import DesktopRelease from '../models/DesktopRelease';
import { AuthenticatedRequest } from '../types';
import path from 'path';
import fs from 'fs';
import { uploadToR2, deleteFromR2, extractR2Key } from '../services/r2ServiceHybrid';

// Get all releases (public)
export const getAllReleases = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { platform, latest } = req.query;

    console.log('🔍 [RELEASES] Fetching releases...');

    const filter: any = { isActive: true };

    if (platform) {
      filter.platform = platform;
    }

    if (latest === 'true') {
      filter.isLatest = true;
    }

    const releases = await DesktopRelease.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ releaseDate: -1 })
      .lean();

    console.log('✅ [RELEASES] Found', releases.length, 'releases');

    res.status(200).json({
      success: true,
      data: releases
    });
  } catch (error: any) {
    console.error('❌ [RELEASES] Error fetching releases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch releases'
    });
  }
};

// Get latest releases by platform (public)
export const getLatestReleases = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🔍 [RELEASES] Fetching latest releases...');

    const latestReleases = await DesktopRelease.find({
      isLatest: true,
      isActive: true
    })
      .populate('uploadedBy', 'name email')
      .sort({ releaseDate: -1 })
      .lean();

    console.log('✅ [RELEASES] Found', latestReleases.length, 'latest releases');

    res.status(200).json({
      success: true,
      data: latestReleases
    });
  } catch (error: any) {
    console.error('❌ [RELEASES] Error fetching latest releases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest releases'
    });
  }
};

// Get release by ID (public)
export const getReleaseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('🔍 [RELEASES] Fetching release:', id);

    const release = await DesktopRelease.findById(id)
      .populate('uploadedBy', 'name email')
      .lean();

    if (!release) {
      res.status(404).json({
        success: false,
        message: 'Release not found'
      });
      return;
    }

    console.log('✅ [RELEASES] Release found');

    res.status(200).json({
      success: true,
      data: release
    });
  } catch (error: any) {
    console.error('❌ [RELEASES] Error fetching release:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch release'
    });
  }
};

// Create new release (admin only)
export const createRelease = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?._id;
    const { version, versionName, description, releaseNotes, platform, architecture, isLatest } = req.body;
    const file = req.file;

    console.log('🔍 [RELEASES] Creating new release...');
    console.log('🔍 [RELEASES] Admin ID:', adminId);
    console.log('🔍 [RELEASES] File:', file?.originalname);

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    // Read uploaded file from disk
    const fileBuffer = await fs.promises.readFile(file.path);

    // Upload to R2
    const r2Key = `releases/${file.filename}`;
    console.log('📤 [RELEASES] Uploading file:', file.filename);
    const downloadUrl = await uploadToR2(fileBuffer, r2Key, file.mimetype);
    console.log('📥 [RELEASES] Upload complete. Download URL:', downloadUrl);

    // KEEP local file for transparency as requested
    console.log('📁 [RELEASES] File kept locally for transparency. Path:', file.path);

    const release = await DesktopRelease.create({
      version,
      versionName,
      description,
      releaseNotes,
      platform,
      architecture,
      fileName: file.originalname,
      fileSize: file.size,
      filePath: r2Key, // Store R2 key instead of local path
      downloadUrl, // R2 public URL
      fileContentType: file.mimetype,
      isLatest: isLatest === 'true',
      uploadedBy: adminId
    });

    console.log('✅ [RELEASES] Release created:', release._id);

    res.status(201).json({
      success: true,
      message: 'Release created successfully',
      data: release
    });
  } catch (error: any) {
    console.error('❌ [RELEASES] Error creating release:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create release'
    });
  }
};

// Update release (admin only)
export const updateRelease = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { versionName, description, releaseNotes, isLatest, isActive } = req.body;

    console.log('🔍 [RELEASES] Updating release:', id);

    const release = await DesktopRelease.findById(id);

    if (!release) {
      res.status(404).json({
        success: false,
        message: 'Release not found'
      });
      return;
    }

    if (versionName) release.versionName = versionName;
    if (description) release.description = description;
    if (releaseNotes) release.releaseNotes = releaseNotes;
    if (typeof isLatest !== 'undefined') release.isLatest = isLatest;
    if (typeof isActive !== 'undefined') release.isActive = isActive;

    await release.save();

    console.log('✅ [RELEASES] Release updated');

    res.status(200).json({
      success: true,
      message: 'Release updated successfully',
      data: release
    });
  } catch (error: any) {
    console.error('❌ [RELEASES] Error updating release:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update release'
    });
  }
};

// Delete release (admin only)
export const deleteRelease = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('🔍 [RELEASES] Deleting release:', id);

    const release = await DesktopRelease.findById(id);

    if (!release) {
      res.status(404).json({
        success: false,
        message: 'Release not found'
      });
      return;
    }

    // Delete file from R2 or local storage
    try {
      // Extract the key from either downloadUrl or filePath
      let r2Key = release.filePath;

      // If downloadUrl contains a full URL, extract the key
      if (release.downloadUrl) {
        r2Key = extractR2Key(release.downloadUrl);
      }

      console.log('🗑️ [RELEASES] Deleting file with key:', r2Key);
      await deleteFromR2(r2Key);
      console.log('✅ [RELEASES] File deleted from storage');
    } catch (storageError) {
      console.warn('⚠️ [RELEASES] Failed to delete from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    await DesktopRelease.findByIdAndDelete(id);

    console.log('✅ [RELEASES] Release deleted from database');

    res.status(200).json({
      success: true,
      message: 'Release deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ [RELEASES] Error deleting release:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete release'
    });
  }
};

// Download release file (public)
export const downloadRelease = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;

    console.log('🔍 [RELEASES] Download request for:', filename);

    // Try to find by old-style download URL or by R2 key
    let release = await DesktopRelease.findOne({
      downloadUrl: { $regex: filename }
    });

    // If not found, try finding by R2 key in filePath
    if (!release) {
      release = await DesktopRelease.findOne({
        filePath: { $regex: filename }
      });
    }

    if (!release) {
      res.status(404).json({
        success: false,
        message: 'Release not found'
      });
      return;
    }

    // Increment download count
    release.downloadCount += 1;
    await release.save();

    console.log('✅ [RELEASES] Incrementing count to:', release.downloadCount);

    // CHECK FOR LOCAL FILE FIRST
    // Construct potential local path
    // We know uploads are in project_root/uploads/releases
    const uploadsDir = path.join(process.cwd(), 'uploads', 'releases');
    // The filename might be the end of the downloadUrl or filePath
    const targetFileName = path.basename(release.filePath || release.downloadUrl);
    const localFilePath = path.join(uploadsDir, targetFileName);

    console.log('🔍 [RELEASES] Checking local file path:', localFilePath);

    if (fs.existsSync(localFilePath)) {
      console.log('✅ [RELEASES] Serving local file:', localFilePath);
      res.download(localFilePath, release.fileName || targetFileName, (err) => {
        if (err) {
          console.error('❌ [RELEASES] Error sending file:', err);
          if (!res.headersSent) {
            res.status(500).send('Error downloading file');
          }
        }
      });
      return;
    }

    // If local file not found, try redirecting (for R2 or external URLs)
    console.log('⚠️ [RELEASES] Local file not found, trying redirect to:', release.downloadUrl);

    let redirectUrl = release.downloadUrl;

    // Sanitize localhost URL if the request host is not localhost
    if (redirectUrl.includes('localhost') && req.get('host') && !req.get('host')?.includes('localhost')) {
      try {
        const urlObj = new URL(redirectUrl);
        redirectUrl = urlObj.pathname + urlObj.search;
        console.log('🔧 [RELEASES] Sanitized localhost URL to relative path:', redirectUrl);
      } catch (e) {
        console.warn('⚠️ [RELEASES] Failed to sanitize URL:', e);
      }
    }

    // Redirect to R2 public URL
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('❌ [RELEASES] Error downloading release:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download release'
    });
  }
};

// Get release statistics (admin only)
export const getReleaseStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🔍 [RELEASES] Fetching release statistics...');

    const totalReleases = await DesktopRelease.countDocuments({ isActive: true });
    const totalDownloads = await DesktopRelease.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);

    const platformStats = await DesktopRelease.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          downloads: { $sum: '$downloadCount' }
        }
      }
    ]);

    const recentReleases = await DesktopRelease.find({ isActive: true })
      .sort({ releaseDate: -1 })
      .limit(5)
      .populate('uploadedBy', 'name email')
      .lean();

    console.log('✅ [RELEASES] Statistics fetched');

    res.status(200).json({
      success: true,
      data: {
        totalReleases,
        totalDownloads: totalDownloads[0]?.total || 0,
        platformStats,
        recentReleases
      }
    });
  } catch (error: any) {
    console.error('❌ [RELEASES] Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};
