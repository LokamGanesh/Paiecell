# Environment Variables Setup Guide

## Development Environment

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/paie-cell
JWT_SECRET=paie-cell-secret-key-2024-development
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Production Environment

### Backend (Render/Railway)
Set these environment variables in your hosting platform:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/paie-cell
JWT_SECRET=your_very_secure_random_string_minimum_32_characters
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**Important Notes:**
- Generate a strong JWT_SECRET: `openssl rand -base64 32`
- Use MongoDB Atlas connection string
- Replace `your-app.vercel.app` with your actual Vercel URL

### Frontend (Vercel)
Set these environment variables in Vercel dashboard:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

**Important Notes:**
- Replace `your-backend.onrender.com` with your actual backend URL
- This must be set BEFORE building the frontend

## Step-by-Step Setup

### 1. MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create database user:
   - Username: `paie-admin`
   - Password: Generate strong password
4. Network Access:
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `paie-cell`

Example:
```
mongodb+srv://paie-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/paie-cell?retryWrites=true&w=majority
```

### 2. Deploy Backend (Render.com)
1. Go to https://render.com
2. Create "New Web Service"
3. Connect GitHub: `LokamGanesh/Paiecell`
4. Configure:
   - Name: `paie-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variables (from above)
6. Deploy
7. Copy your backend URL (e.g., `https://paie-backend.onrender.com`)

### 3. Deploy Frontend (Vercel)
1. Go to https://vercel.com
2. Import project: `LokamGanesh/Paiecell`
3. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://paie-backend.onrender.com/api`
5. Deploy
6. Copy your frontend URL (e.g., `https://paie-cell.vercel.app`)

### 4. Update Backend CORS
1. Go back to Render.com
2. Update `FRONTEND_URL` environment variable:
   - `FRONTEND_URL` = `https://paie-cell.vercel.app`
3. Redeploy backend

### 5. Seed Database
```bash
# Clone repo locally
git clone https://github.com/LokamGanesh/Paiecell.git
cd Paiecell/backend

# Create .env with production MongoDB URI
echo "MONGODB_URI=your_production_mongodb_uri" > .env

# Install and seed
npm install
npm run seed
```

This creates:
- Admin: admin@paie.com / admin123
- Student: student@paie.com / student123
- Facilitator: facilitator@paie.com / facilitator123

**⚠️ IMPORTANT: Change these passwords after first login!**

## Verification Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Backend deployed and running
- [ ] Backend health check works: `https://your-backend.onrender.com/api/health`
- [ ] Frontend deployed and accessible
- [ ] Frontend can reach backend (check browser console)
- [ ] CORS configured correctly
- [ ] Database seeded with initial data
- [ ] Can login with default credentials
- [ ] Can create events/courses
- [ ] Can register for events

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check browser console for specific CORS error
- Ensure no trailing slash in URLs

### Frontend Can't Reach Backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend is running: visit `/api/health`
- Rebuild frontend after changing environment variables

### Database Connection Failed
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas (should be 0.0.0.0/0)
- Ensure database user has correct permissions

### Build Fails
- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Check build logs for specific errors

## Security Best Practices

1. **Never commit .env files** (already in .gitignore)
2. **Use strong JWT_SECRET** (32+ random characters)
3. **Change default passwords** immediately after seeding
4. **Use HTTPS** in production (automatic with Vercel/Render)
5. **Restrict CORS** to your specific frontend URL
6. **Keep dependencies updated**: `npm audit fix`
7. **Monitor logs** for suspicious activity

## Quick Reference

### Generate Secure JWT Secret
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Test Backend Health
```bash
curl https://your-backend.onrender.com/api/health
```

### Test Frontend API Connection
Open browser console on your frontend and run:
```javascript
fetch('https://your-backend.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

## Support

If you encounter issues:
1. Check the logs in Render/Vercel dashboard
2. Verify all environment variables are set correctly
3. Test each component individually
4. Check DEPLOYMENT.md for detailed troubleshooting
