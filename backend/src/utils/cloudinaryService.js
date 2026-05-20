import { v2 as cloudinary } from 'cloudinary';

// Configure lazily so dotenv has time to load
const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  return cloudinary;
};

// Upload a file buffer to Cloudinary
// type: 'events' or 'courses' — goes to paiecell/gallery/<type>
// folder: override the full folder path directly (optional)
export const uploadToCloudinary = (fileBuffer, _originalName, type = 'events', folder = null) => {
  return new Promise((resolve, reject) => {
    const targetFolder = folder || `paiecell/gallery/${type}`;
    const cld = getCloudinary();

    const uploadStream = cld.uploader.upload_stream(
      {
        folder: targetFolder,
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

// Fetch all resources from a Cloudinary folder (events or courses)
// Uses Search API which works with both legacy and fixed folder modes
export const fetchFromCloudinaryFolder = async (type = 'events') => {
  const folder = `paiecell/gallery/${type}`;
  const cld = getCloudinary();

  try {
    const result = await cld.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    return (result.resources || []).map(r => ({
      publicId: r.public_id,
      url: r.secure_url,
      resourceType: r.resource_type,
      format: r.format,
      width: r.width,
      height: r.height,
      createdAt: r.created_at,
      displayName: (r.display_name || r.filename || r.public_id.split('/').pop()).replace(/[-_]/g, ' ')
    }));
  } catch (error) {
    console.error('Cloudinary search error:', error);
    throw error;
  }
};

// Delete a file from Cloudinary by public_id
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  const cld = getCloudinary();
  try {
    const result = await cld.uploader.destroy(publicId, {
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
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    const afterUpload = parts.slice(uploadIndex + 1);
    const withoutVersion = afterUpload[0].startsWith('v') ? afterUpload.slice(1) : afterUpload;
    const publicIdWithExt = withoutVersion.join('/');
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

export default cloudinary;
