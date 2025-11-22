# Render Deployment Guide - Dating App Backend

## Step-by-Step Deployment Guide

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Backend code pushed to GitHub repository

---

## Step 1: Prepare Your Code

### 1.1 Create `.gitignore` (if not exists)
Make sure `.env` is in `.gitignore`:
```
node_modules/
.env
*.log
.DS_Store
dist/
build/
```

### 1.2 Create `render.yaml` (Optional but Recommended)
Create `render.yaml` in backend root:

```yaml
services:
  - type: web
    name: dating-app-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### 1.3 Update `package.json` Scripts
Ensure you have:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git (if not done)
```bash
cd backend
git init
git add .
git commit -m "Initial commit - Backend ready for deployment"
```

### 2.2 Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `dating-app-backend`)
3. Don't initialize with README

### 2.3 Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/dating-app-backend.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy on Render

### 3.1 Sign Up / Login to Render
1. Go to https://render.com
2. Sign up or login (you can use GitHub to sign in)

### 3.2 Create New Web Service
1. Click **"New +"** button
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository: `dating-app-backend`
5. Click **"Connect"**

### 3.3 Configure Service Settings

**Basic Settings:**
- **Name**: `dating-app-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., `Singapore` for India)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend` (if backend is in a subfolder, otherwise leave empty)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Plan**: `Free` (or choose paid plan)
- **Auto-Deploy**: `Yes` (deploys on every push to main branch)

---

## Step 4: Configure Environment Variables

### 4.1 Add Environment Variables in Render Dashboard

Go to your service → **Environment** tab → Add these variables:

#### MongoDB Configuration
```
MONGODB_URI=mongodb+srv://aditiparihar:aditiparihar@cluster0.ewvj7vt.mongodb.net/?appName=Cluster0
```

#### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d
```

#### Cloudinary Configuration
```
CLOUDINARY_CLOUD_NAME=dzbmscin0
CLOUDINARY_API_KEY=999935529526942
CLOUDINARY_API_SECRET=FF5u_f62ZOlssOtoxxg44RDNWew
```

#### SMSIndiaHub Configuration
```
SMSINDIAHUB_API_KEY=j8oT8a4QSkuE8UbnoUHqDw
SMSINDIAHUB_SENDER_ID=SMSHUB
```

#### Server Configuration
```
NODE_ENV=production
PORT=10000
```

#### CORS Configuration
```
FRONTEND_URL=https://your-frontend-domain.com
```
(Update this with your actual frontend URL after deploying frontend)

---

## Step 5: Deploy

### 5.1 Manual Deploy
1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for build to complete (usually 2-5 minutes)
3. Check build logs for any errors

### 5.2 Monitor Deployment
- Watch the **"Logs"** tab for build progress
- Check for any errors in the logs
- Build should show: "Build successful"

---

## Step 6: Verify Deployment

### 6.1 Get Your Backend URL
After deployment, Render will provide a URL like:
```
https://dating-app-backend.onrender.com
```

### 6.2 Test Health Endpoint
Open in browser or use curl:
```bash
curl https://your-backend-url.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

### 6.3 Test API Endpoints
```bash
# Test send OTP
curl -X POST https://your-backend-url.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "countryCode": "+91"
  }'
```

---

## Step 7: Update Frontend Configuration

### 7.1 Update Frontend API Base URL
In your frontend code, update the API base URL:
```javascript
// Example: src/config/api.js or similar
const API_BASE_URL = 'https://your-backend-url.onrender.com/api';
```

### 7.2 Update CORS in Backend
Make sure `FRONTEND_URL` in Render environment variables matches your frontend domain.

---

## Common Issues & Solutions

### Issue 1: Build Fails
**Solution**: 
- Check build logs for errors
- Ensure `package.json` has correct scripts
- Verify Node.js version compatibility

### Issue 2: Service Crashes
**Solution**:
- Check logs for runtime errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct
- Check PORT is set to 10000 (Render default)

### Issue 3: CORS Errors
**Solution**:
- Update `FRONTEND_URL` environment variable
- Restart the service after updating env vars

### Issue 4: Database Connection Fails
**Solution**:
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist (add Render IP or 0.0.0.0/0)
- Ensure MongoDB credentials are correct

### Issue 5: Service Goes to Sleep (Free Plan)
**Solution**:
- Free plan services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Consider upgrading to paid plan for always-on service

---

## Important Notes

1. **Free Plan Limitations**:
   - Service sleeps after 15 min inactivity
   - Limited build minutes per month
   - Slower cold starts

2. **Environment Variables**:
   - Never commit `.env` to GitHub
   - Always set env vars in Render dashboard
   - Use strong JWT_SECRET in production

3. **MongoDB Atlas**:
   - Whitelist Render IPs or use 0.0.0.0/0 (less secure)
   - Ensure network access is configured

4. **Cloudinary**:
   - Verify credentials are correct
   - Check Cloudinary dashboard for usage

5. **SMSIndiaHub**:
   - Verify API key and sender ID
   - Check SMS balance in SMSIndiaHub dashboard

---

## Post-Deployment Checklist

- [ ] Service deployed successfully
- [ ] Health endpoint working
- [ ] Environment variables configured
- [ ] MongoDB connection working
- [ ] API endpoints responding
- [ ] CORS configured correctly
- [ ] Frontend updated with new API URL
- [ ] Test OTP sending
- [ ] Test profile creation
- [ ] Test image upload

---

## Support

If you face issues:
1. Check Render logs
2. Check MongoDB Atlas logs
3. Verify all environment variables
4. Test endpoints with Postman/curl
5. Check Render status page

---

## Next Steps

1. Deploy frontend (Vercel, Netlify, etc.)
2. Update frontend API URL
3. Test complete flow
4. Set up monitoring
5. Configure custom domain (optional)

