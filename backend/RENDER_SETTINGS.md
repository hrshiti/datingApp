# Render Service Settings - Exact Configuration

## 📋 Exact Settings for Render Dashboard

Copy these settings exactly in your Render service:

### Basic Settings:
- **Name**: `dating-app-backend`
- **Region**: `Singapore` (or your preferred region)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ (Important: exactly "backend", no spaces)
- **Runtime**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Plan**: `Free`

### Alternative (If Root Directory doesn't work):

**Root Directory**: Leave **EMPTY** (blank)

**Build Command**: 
```bash
cd backend && npm install
```

**Start Command**: 
```bash
cd backend && npm start
```

---

## 🔍 How to Check Your Repository Structure:

1. Go to your GitHub repository
2. Check if you see `backend/` folder in root
3. Verify `backend/package.json` exists
4. Verify `backend/server.js` exists

If structure is:
```
repo-root/
  └── backend/
      ├── package.json
      └── server.js
```

Then use **Root Directory**: `backend`

---

## ✅ Step-by-Step Fix:

1. **Open Render Dashboard**
2. **Select your service**
3. **Go to Settings tab**
4. **Find "Root Directory" field**
5. **Set to**: `backend` (exactly, no quotes, no spaces)
6. **Update Build Command**: `cd backend && npm install`
7. **Update Start Command**: `cd backend && npm start`
8. **Click "Save Changes"**
9. **Go to "Manual Deploy"**
10. **Click "Deploy latest commit"**
11. **Watch logs** - should work now!

---

## 🐛 If Still Not Working:

Try this alternative:

**Root Directory**: Leave **EMPTY**

**Build Command**:
```bash
npm install --prefix backend
```

**Start Command**:
```bash
npm start --prefix backend
```

Or create a root-level `package.json` with:
```json
{
  "scripts": {
    "install": "cd backend && npm install",
    "start": "cd backend && npm start"
  }
}
```

