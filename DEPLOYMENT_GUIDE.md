# 🚀 Deployment Guide - LegacyMap

## Quick Deployment Options

### Option 1: Railway (Recommended for Backend) ⚡
**Free tier available, easiest setup**

### Option 2: Render (Good for Backend)
**Free tier available**

### Option 3: Vercel (Frontend Already There!)
**Your frontend is already on Vercel**

---

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Backend for Deployment

Create `railway.json` in backend root:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `Procfile`:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Update `app/main.py` CORS to allow your Vercel domain:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://vercel.app",
        "https://*.vercel.app",
        "*"  # For testing, remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 2: Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **Sign in with GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. **Select**: `TECHIEErizz/legacymap` (your backend repo)
5. **Railway will auto-detect** Python and deploy
6. **Get your URL**: Something like `https://legacymap-backend-production.up.railway.app`

### Step 3: Test Backend
```bash
curl https://your-railway-url.railway.app/
# Should return: {"message": "FastAPI is working!"}
```

---

## 🎨 Frontend Deployment (Update Vercel)

### Step 1: Push Updated Files to GitHub

```bash
# Go to your local frontend repo (not /tmp)
cd /path/to/your/local/LegacyMap01

# Copy updated files
cp /Applications/Codes/legacymap-backend/frontend-updates/upload.tsx components/
cp /Applications/Codes/legacymap-backend/frontend-updates/dashboard.tsx components/
cp /Applications/Codes/legacymap-backend/frontend-updates/details-modal.tsx components/

# Commit and push
git add .
git commit -m "Integrate with real backend API"
git push origin main
```

### Step 2: Update Environment Variable in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Select your project**: `v0-legacy-code-analysis-tool`
3. **Settings** → **Environment Variables**
4. **Add Variable**:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-url.railway.app`
   - **Environment**: Production, Preview, Development
5. **Save**
6. **Redeploy** (Vercel will auto-deploy on git push)

### Step 3: Test Frontend
Visit your Vercel URL and upload a ZIP file!

---

## 🐳 Alternative: Docker Deployment

### Backend Dockerfile
Already exists at `Dockerfile/dockerfile`

```bash
# Build
docker build -f Dockerfile/dockerfile -t legacymap-backend .

# Run
docker run -p 8000:8000 legacymap-backend
```

### Deploy to Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app
flyctl launch

# Deploy
flyctl deploy
```

---

## 📋 Deployment Checklist

### Backend
- [ ] Create `railway.json` and `Procfile`
- [ ] Update CORS in `main.py`
- [ ] Push to GitHub
- [ ] Deploy on Railway
- [ ] Test health endpoint
- [ ] Note down backend URL

### Frontend
- [ ] Copy updated components to local repo
- [ ] Push to GitHub
- [ ] Add `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Wait for auto-deploy
- [ ] Test upload functionality

---

## 🔗 Final URLs

After deployment:
- **Backend API**: `https://your-app.railway.app`
- **Backend Docs**: `https://your-app.railway.app/docs`
- **Frontend**: `https://your-vercel-app.vercel.app`

---

## 🐛 Troubleshooting

### Backend not starting on Railway
- Check logs in Railway dashboard
- Ensure `requirements.txt` is correct
- Check PORT environment variable

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Check browser console for errors

### CORS errors
- Add your Vercel domain to `allow_origins` in `main.py`
- Redeploy backend

---

## 💰 Cost

- **Railway**: Free tier (500 hours/month)
- **Vercel**: Free tier (unlimited for personal projects)
- **Total**: **FREE!** 🎉

---

## 🚀 Quick Deploy Commands

```bash
# Backend (Railway CLI)
railway login
railway init
railway up

# Frontend (Already on Vercel)
git push origin main  # Auto-deploys
```

**Ready to deploy!** 🎊
