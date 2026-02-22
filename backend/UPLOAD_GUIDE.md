# Image Upload Guide

## Overview

The application now supports image uploads for Events and Courses. Images can be uploaded directly from the admin panel or provided via URL.

## Features

- Direct file upload from admin panel
- Support for JPEG, JPG, PNG, GIF, and WebP formats
- 5MB file size limit
- Image preview before saving
- Option to use external image URLs
- Automatic file storage in `/uploads` directory

## Backend Setup

### Installation

Install the required dependency:

```bash
cd backend
npm install
```

This will install `multer` for handling file uploads.

### API Endpoints

#### Upload Image
```
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: FormData with 'image' field
```

Response:
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "/uploads/1234567890-123456789.jpg",
  "filename": "1234567890-123456789.jpg"
}
```

#### Delete Image
```
DELETE /api/upload/image/:filename
Authorization: Bearer <token>
```

### File Storage

- Uploaded images are stored in `backend/uploads/`
- Files are named with timestamp + random number to avoid conflicts
- The uploads directory is automatically created if it doesn't exist
- Uploads folder is added to `.gitignore`

## Frontend Usage

### Event Management

1. Navigate to Admin Panel → Events
2. Click "Add Event" or edit an existing event
3. In the image section:
   - Click "Upload" button to select a file from your computer
   - OR paste an external image URL
4. Preview the image before saving
5. Click the X button to remove the image

### Course Management

1. Navigate to Admin Panel → Courses
2. Click "Add Course" or edit an existing course
3. In the image section:
   - Click "Upload" button to select a file from your computer
   - OR paste an external image URL
4. Preview the image before saving
5. Click the X button to remove the image

## Security

- Only authenticated admin users can upload images
- File type validation (only images allowed)
- File size limit (5MB maximum)
- Unique filenames prevent overwrites

## Production Considerations

For production deployment:

1. Consider using cloud storage (AWS S3, Cloudinary, etc.)
2. Implement image optimization/compression
3. Add CDN for faster image delivery
4. Set up proper backup for uploaded files
5. Consider implementing image moderation

## Troubleshooting

### Upload fails
- Check that multer is installed: `npm list multer`
- Verify the uploads directory has write permissions
- Check file size is under 5MB
- Ensure file is a valid image format

### Images not displaying
- Verify the backend server is serving static files from `/uploads`
- Check the image URL in the database
- Ensure CORS is properly configured
