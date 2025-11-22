# Render Deployment - Quick Start Guide

## 🚀 Quick Deployment Steps

### Step 1: Push Code to GitHub
```bash
cd backend
git init
git add .
git commit -m "Ready for Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/dating-app-backend.git
git push -u origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### Step 3: Connect Repository
1. Select your GitHub repository
2. Click "Connect"

### Step 4: Configure Service

**Settings:**
- **Name**: `dating-app-backend`
- **Region**: `Singapore` (or closest to you)
- **Branch**: `main`
- **Root Directory**: `backend` (if backend is in subfolder, else leave empty)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free`

### Step 5: Add Environment Variables

Click "Environment" tab and add ALL these variables:

```
MONGODB_URI=mongodb+srv://aditiparihar:aditiparihar@cluster0.ewvj7vt.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=dzbmscin0
CLOUDINARY_API_KEY=999935529526942
CLOUDINARY_API_SECRET=FF5u_f62ZOlssOtoxxg44RDNWew
SMSINDIAHUB_API_KEY=j8oT8a4QSkuE8UbnoUHqDw
SMSINDIAHUB_SENDER_ID=SMSHUB
NODE_ENV=production
PORT=10000
FRONTEND_URL=http://localhost:5173
```

**Note**: Update `FRONTEND_URL` with your actual frontend URL after deploying frontend.

### Step 6: Deploy
1. Click "Create Web Service"
2. Wait for build (2-5 minutes)
3. Check logs for any errors

### Step 7: Get Your URL
After deployment, you'll get a URL like:
```
https://dating-app-backend.onrender.com
```

### Step 8: Test
```bash
curl https://your-backend-url.onrender.com/health
```

---

## ⚠️ Important Notes

1. **MongoDB Atlas**: 
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allow all) OR add Render's IP ranges

2. **Free Plan**: 
   - Service sleeps after 15 min inactivity
   - First request after sleep takes ~30 seconds

3. **Environment Variables**: 
   - Never commit `.env` file
   - Always set in Render dashboard

4. **CORS**: 
   - Update `FRONTEND_URL` after deploying frontend

---

## 🔧 Troubleshooting

**Build Fails?**
- Check build logs
- Verify `package.json` scripts

**Service Crashes?**
- Check runtime logs
- Verify all env vars are set
- Check MongoDB connection

**CORS Errors?**
- Update `FRONTEND_URL` env var
- Restart service

---

## ✅ Post-Deployment Checklist

- [ ] Service deployed
- [ ] Health endpoint working
- [ ] All env vars set
- [ ] MongoDB connected
- [ ] Test API endpoints
- [ ] Update frontend API URL

