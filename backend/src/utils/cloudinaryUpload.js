import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Cloudinary folder path
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = (fileBuffer, folder = 'dating-app', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' }
      ],
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array<Buffer>} fileBuffers - Array of file buffers
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Array<Object>>} Array of Cloudinary upload results
 */
export const uploadMultipleToCloudinary = async (fileBuffers, folder = 'dating-app') => {
  const uploadPromises = fileBuffers.map((buffer, index) => 
    uploadToCloudinary(buffer, folder, {
      public_id: `${Date.now()}-${index}-${Math.round(Math.random() * 1E9)}`
    })
  );
  
  return Promise.all(uploadPromises);
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

