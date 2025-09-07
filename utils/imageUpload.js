const cloudinary = require('../config/cloudinary');

/**
 * Uploads an image to Cloudinary
 * @param {string} imageBase64 - Base64 encoded image string
 * @param {string} folder - Cloudinary folder to store the image in
 * @returns {Promise<Object>} Cloudinary upload response
 */
const uploadImage = async (imageBase64, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Deletes an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<Object>} Cloudinary deletion response
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

module.exports = {
  uploadImage,
  deleteImage
}; 