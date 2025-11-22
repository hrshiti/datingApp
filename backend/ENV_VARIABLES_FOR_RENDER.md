# Environment Variables for Render Deployment

Copy and paste these environment variables in Render Dashboard → Environment tab:

## 📋 Complete Environment Variables List

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

## 🔐 Security Notes

1. **JWT_SECRET**: Change this to a strong random string in production
   - Generate: `openssl rand -base64 32`
   - Or use: https://randomkeygen.com/

2. **FRONTEND_URL**: Update this after deploying your frontend
   - Example: `https://your-frontend.vercel.app`
   - Or: `https://your-frontend.netlify.app`

## 📝 How to Add in Render

1. Go to your service in Render dashboard
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable one by one:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://aditiparihar:aditiparihar@cluster0.ewvj7vt.mongodb.net/?appName=Cluster0`
5. Click "Save Changes"
6. Repeat for all variables
7. Service will automatically restart after saving

## ⚠️ Important

- Never commit `.env` file to GitHub
- Always set environment variables in Render dashboard
- After adding env vars, service restarts automatically
- Check logs to verify all variables are loaded

