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

// Fetch all resources from a Cloudinary folder (events or courses)
export const fetchFromCloudinaryFolder = async (type = 'events') => {
  const folder = `paiecell/gallery/${type}`;
  const resources = [];
  let nextCursor = null;

  do {
    const options = {
      type: 'upload',
      prefix: folder,
      max_results: 100,
      resource_type: 'image'
    };
    if (nextCursor) options.next_cursor = nextCursor;

    const result = await cloudinary.api.resources(options);
    resources.push(...result.resources);
    nextCursor = result.next_cursor || null;
  } while (nextCursor);

  // Also fetch videos
  let nextVideoCursor = null;
  do {
    const options = {
      type: 'upload',
      prefix: folder,
      max_results: 100,
      resource_type: 'video'
    };
    if (nextVideoCursor) options.next_cursor = nextVideoCursor;

    try {
      const result = await cloudinary.api.resources(options);
      resources.push(...result.resources);
      nextVideoCursor = result.next_cursor || null;
    } catch {
      nextVideoCursor = null;
    }
  } while (nextVideoCursor);

  return resources.map(r => ({
    publicId: r.public_id,
    url: r.secure_url,
    resourceType: r.resource_type,
    format: r.format,
    width: r.width,
    height: r.height,
    createdAt: r.created_at,
    displayName: r.public_id.split('/').pop().replace(/[-_]/g, ' ')
  }));
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
