# Quick Deployment Guide

## Current Status
Your frontend is deploying to Vercel. For a complete deployment, follow these steps:

## Step 1: Deploy Backend (Render.com - Recommended)

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `LokamGanesh/Paiecell`
4. Configure:
   - **Name**: paie-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_string_min_32_chars
   NODE_ENV=production
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://paie-backend.onrender.com`)

## Step 2: Update Frontend Environment

1. In Vercel dashboard, go to your project settings
2. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
3. Redeploy frontend

## Step 3: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string
6. Add to Render environment variables

## Step 4: Seed Database

After backend is deployed:
```bash
# Run seed script locally pointing to production DB
cd backend
# Update .env with production MONGODB_URI
npm run seed
```

## Alternative: Deploy Both on Render

If you prefer to deploy everything on Render:

### Backend (as above)

### Frontend
1. Create another Web Service
2. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l 8080`
3. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Backend Can't Connect to MongoDB
- Verify MONGODB_URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Frontend Can't Reach Backend
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is running

## Testing Deployment

1. Visit your frontend URL
2. Try to register/login
3. Check admin dashboard
4. Test event creation

## Default Credentials (After Seeding)

- Admin: admin@paie.com / admin123
- Student: student@paie.com / student123

**⚠️ IMPORTANT: Change these passwords immediately after first login!**

## Need Help?

Check the full DEPLOYMENT.md for detailed instructions.
