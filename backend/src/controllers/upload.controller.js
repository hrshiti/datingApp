import Profile from '../models/Profile.model.js';
import { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

// @desc    Upload single photo
// @route   POST /api/upload/photo
// @access  Private
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user._id;
    const { isMain, order } = req.body;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'dating-app/photos'
    );

    // Get or create profile
    let profile = await Profile.findOne({ userId: userId });
    if (!profile) {
      profile = await Profile.create({ userId: userId });
    }

    // Add photo to profile
    const photoData = {
      url: result.secure_url,
      cloudinaryId: result.public_id,
      isMain: isMain === 'true' || isMain === true,
      order: order ? parseInt(order) : profile.photos.length
    };

    // If this is main photo, unset other main photos
    if (photoData.isMain) {
      profile.photos.forEach(photo => {
        photo.isMain = false;
      });
    }

    profile.photos.push(photoData);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: photoData,
      profile: profile
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photo',
      error: error.message
    });
  }
};

// @desc    Upload multiple photos
// @route   POST /api/upload/photos
// @access  Private
export const uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    if (req.files.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 photos allowed'
      });
    }

    const userId = req.user._id;

    // Upload all files to Cloudinary
    const fileBuffers = req.files.map(file => file.buffer);
    const results = await uploadMultipleToCloudinary(
      fileBuffers,
      'dating-app/photos'
    );

    // Get or create profile
    let profile = await Profile.findOne({ userId: userId });
    if (!profile) {
      profile = await Profile.create({ userId: userId });
    }

    // Add photos to profile
    const photosData = results.map((result, index) => ({
      url: result.secure_url,
      cloudinaryId: result.public_id,
      isMain: index === 0, // First photo is main by default
      order: index,
      uploadedAt: new Date()
    }));

    // If adding new photos, unset existing main photo if first new photo should be main
    if (photosData[0] && photosData[0].isMain && profile.photos.length > 0) {
      profile.photos.forEach(photo => {
        photo.isMain = false;
      });
    }

    profile.photos.push(...photosData);
    await profile.save();

    res.status(200).json({
      success: true,
      message: `${photosData.length} photos uploaded successfully`,
      photos: photosData,
      profile: profile
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photos',
      error: error.message
    });
  }
};

// @desc    Delete photo
// @route   DELETE /api/upload/photo/:photoId
// @access  Private
export const deletePhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    const photoId = req.params.photoId;

    const profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const photo = profile.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Delete from Cloudinary
    if (photo.cloudinaryId) {
      try {
        await deleteFromCloudinary(photo.cloudinaryId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        // Continue even if Cloudinary deletion fails
      }
    }

    // Remove from profile
    profile.photos.pull(photoId);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting photo',
      error: error.message
    });
  }
};

// @desc    Set main photo
// @route   PUT /api/upload/photo/:photoId/set-main
// @access  Private
export const setMainPhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    const photoId = req.params.photoId;

    const profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const photo = profile.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Unset all main photos
    profile.photos.forEach(p => {
      p.isMain = false;
    });

    // Set this photo as main
    photo.isMain = true;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Main photo updated successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Set main photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating main photo',
      error: error.message
    });
  }
};

// @desc    Upload verification photo
// @route   POST /api/upload/verification
// @access  Private
export const uploadVerificationPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user._id;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'dating-app/verification'
    );

    // Get or create profile
    let profile = await Profile.findOne({ userId: userId });
    if (!profile) {
      profile = await Profile.create({ userId: userId });
    }

    // Update verification photo
    profile.verificationPhoto = {
      url: result.secure_url,
      cloudinaryId: result.public_id,
      status: 'pending',
      submittedAt: new Date()
    };

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Verification photo uploaded successfully',
      verificationPhoto: profile.verificationPhoto
    });
  } catch (error) {
    console.error('Upload verification photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading verification photo',
      error: error.message
    });
  }
};

