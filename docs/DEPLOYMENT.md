# PAIE Cell Deployment Guide

This guide covers deploying the PAIE Cell application to production.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or MongoDB instance)
- Git repository
- Deployment platform account (Vercel, Render, Railway, etc.)

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com/api
```

## Deployment Options

### Option 1: Vercel (Recommended for Frontend + Backend)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add all environment variables from backend/.env
   - Add VITE_API_URL for frontend

### Option 2: Separate Deployments

#### Backend on Render/Railway

1. **Create New Web Service**
2. **Connect GitHub Repository**
3. **Configure Build Settings:**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Root Directory: `backend`

4. **Add Environment Variables:**
   - PORT
   - MONGODB_URI
   - JWT_SECRET
   - NODE_ENV=production

#### Frontend on Vercel/Netlify

1. **Create New Project**
2. **Connect GitHub Repository**
3. **Configure Build Settings:**
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Root Directory: `frontend`

4. **Add Environment Variables:**
   - VITE_API_URL (your backend URL)

### Option 3: VPS/Cloud Server (DigitalOcean, AWS, etc.)

1. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/paie-cell.git
   cd paie-cell
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your values
   nano .env
   
   # Start with PM2
   pm2 start src/index.js --name paie-backend
   pm2 save
   pm2 startup
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with your backend URL
   nano .env
   
   # Build
   npm run build
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/paie-cell
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/paie-cell/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Uploads
       location /uploads {
           proxy_pass http://localhost:5000;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/paie-cell /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (Free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string
6. Add to MONGODB_URI environment variable

### Seed Initial Data

```bash
cd backend
npm run seed
```

This creates:
- Admin user: admin@paie.com / admin123
- Sample events and courses

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Database is connected and accessible
- [ ] Backend API is responding (check /api/health)
- [ ] Frontend loads correctly
- [ ] Login/Registration works
- [ ] File uploads work
- [ ] Admin dashboard accessible
- [ ] SSL certificate installed (HTTPS)
- [ ] Domain configured
- [ ] Monitoring setup (optional)

## Monitoring & Maintenance

### PM2 Commands (if using VPS)
```bash
pm2 status              # Check status
pm2 logs paie-backend   # View logs
pm2 restart paie-backend # Restart
pm2 stop paie-backend   # Stop
```

### Update Application
```bash
git pull origin main
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart paie-backend
```

## Troubleshooting

### Backend not connecting to MongoDB
- Check MONGODB_URI is correct
- Verify IP whitelist in MongoDB Atlas
- Check network connectivity

### Frontend can't reach backend
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Verify backend is running

### File uploads not working
- Check uploads directory exists and has write permissions
- Verify multer configuration
- Check file size limits

## Security Recommendations

1. **Use strong JWT_SECRET** (at least 32 random characters)
2. **Enable HTTPS** (SSL certificate)
3. **Set secure CORS origins** (don't use * in production)
4. **Regular backups** of MongoDB database
5. **Keep dependencies updated** (`npm audit fix`)
6. **Use environment variables** for all secrets
7. **Enable rate limiting** (already implemented)
8. **Monitor logs** for suspicious activity

## Support

For issues or questions:
- Check logs: `pm2 logs` or platform logs
- Review error messages
- Check environment variables
- Verify database connection

## Quick Deploy Commands

```bash
# Build everything
npm run build

# Start production
npm start

# Or deploy to Vercel
vercel --prod
```
