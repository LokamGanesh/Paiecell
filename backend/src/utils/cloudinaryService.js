import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload a file buffer to Cloudinary
// type: 'events' or 'courses'
export const uploadToCloudinary = (fileBuffer, originalName, type = 'events') => {
  return new Promise((resolve, reject) => {
    const folder = `paiecell/gallery/${type}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Delete a file from Cloudinary by public_id
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Extract public_id from a Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  try {
    // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/paiecell/gallery/events/filename.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // Skip version segment (v123...)
    const afterUpload = parts.slice(uploadIndex + 1);
    const withoutVersion = afterUpload[0].startsWith('v') ? afterUpload.slice(1) : afterUpload;
    const publicIdWithExt = withoutVersion.join('/');
    // Remove file extension
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

export default cloudinary;
