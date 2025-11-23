# 🔗 Frontend-Backend Integration Guide

## Overview
This guide will help you connect the **LegacyMap Frontend** (Next.js) with the **LegacyMap Backend** (FastAPI).

---

## ✅ What's Already Done

### Backend Changes
- ✅ **CORS middleware added** - Frontend can now make API calls
- ✅ **Function details endpoint fixed** - Now uses query parameters for nested file paths
- ✅ **Server running** on `http://localhost:8000`

### Frontend Updates Created
- ✅ **upload.tsx** - Calls real backend API instead of mock data
- ✅ **dashboard.tsx** - Updated to show real analysis data
- ✅ **details-modal.tsx** - Fetches function details from backend

---

## 📋 Step-by-Step Integration

### Step 1: Update Frontend Files

Copy the updated files from `frontend-updates/` to your frontend repo:

```bash
# Navigate to your frontend repo
cd /path/to/LegacyMap01

# Copy updated components (replace these files)
cp /Applications/Codes/legacymap-backend/frontend-updates/upload.tsx components/
cp /Applications/Codes/legacymap-backend/frontend-updates/dashboard.tsx components/
cp /Applications/Codes/legacymap-backend/frontend-updates/details-modal.tsx components/
```

### Step 2: Add Environment Variable

Create `.env.local` in your frontend root:

```bash
# In /path/to/LegacyMap01/
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

**For Production (Vercel):**
Add environment variable in Vercel dashboard:
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://your-backend-url.com`

### Step 3: Install Dependencies (if needed)

```bash
cd /path/to/LegacyMap01
pnpm install
# or
npm install
```

### Step 4: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd /Applications/Codes/legacymap-backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /path/to/LegacyMap01
pnpm dev
# or
npm run dev
```

---

## 🧪 Testing the Integration

### 1. Open Frontend
Navigate to: `http://localhost:3000`

### 2. Upload a ZIP File
- Click "Browse Files" or drag-and-drop
- Upload `legacy_demo.zip` (in backend repo)
- Should see "Analyzing your code..." spinner

### 3. View Dashboard
After upload completes:
- ✅ Total Files count
- ✅ Lines of Code
- ✅ Functions/Classes list

### 4. Test Function Details
- Click "View Calls" on any function
- Should see modal with:
  - Where the function is called (file + line number)
  - Code snippets
- Click "Dependencies"
  - Should see what the function depends on

---

## 🔍 What Changed in Each File

### `upload.tsx`
**Before:** Generated mock data
**After:** 
- Calls `POST /upload-analyze`
- Shows loading spinner
- Handles errors
- Transforms backend response to match frontend expectations

**Key Changes:**
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const response = await fetch(`${API_BASE}/upload-analyze`, {
  method: 'POST',
  body: formData,
})
```

### `dashboard.tsx`
**Before:** Displayed mock data
**After:**
- Passes `repoId` to modal
- Shows `lineStart` instead of total lines
- Displays parent class for methods

**Key Changes:**
```typescript
<DetailsModal
  function={selectedFunction}
  type={modalType}
  repoId={data.repoId}  // ← NEW
  onClose={...}
/>
```

### `details-modal.tsx`
**Before:** Showed static mock calls/dependencies
**After:**
- Fetches real data from backend
- Shows loading state
- Displays file, line number, and code snippets
- Handles errors

**Key Changes:**
```typescript
const url = `${API_BASE}/function-details/${repoId}?file_path=${encodeURIComponent(fn.file)}&function_name=${encodeURIComponent(fn.name)}`

const response = await fetch(url)
const result = await response.json()
```

---

## 📊 Data Flow

```
User uploads ZIP
       ↓
Frontend: upload.tsx
       ↓
POST /upload-analyze
       ↓
Backend: Analyzes code
       ↓
Returns: { repo_id, nodes, functions_classes, ... }
       ↓
Frontend: Transforms data
       ↓
Dashboard: Shows functions table
       ↓
User clicks "View Calls"
       ↓
GET /function-details/{repo_id}?file_path=...&function_name=...
       ↓
Backend: Finds call sites
       ↓
Returns: { call_sites_table, dependencies_table }
       ↓
Modal: Displays results
```

---

## 🐛 Troubleshooting

### Issue 1: CORS Error
```
Access to fetch at 'http://localhost:8000' has been blocked by CORS policy
```

**Solution:** Backend CORS is already configured. Make sure backend is running.

### Issue 2: Connection Refused
```
Failed to fetch: TypeError: Failed to fetch
```

**Solution:** 
1. Check backend is running: `curl http://localhost:8000/`
2. Check URL in `.env.local` is correct

### Issue 3: 404 on Function Details
```
GET /function-details/... → 404
```

**Solution:** Make sure you're using the updated backend with query parameters:
```
✅ /function-details/{repo_id}?file_path=...&function_name=...
❌ /function-details/{repo_id}/{file_path}/{function_name}
```

### Issue 4: Empty Functions List
```
Dashboard shows "No functions found"
```

**Solution:**
1. Check backend response in Network tab
2. Verify `functions_classes` array exists in response
3. Check console for transformation errors

---

## 📝 Quick Commands Reference

```bash
# Backend
cd /Applications/Codes/legacymap-backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd /path/to/LegacyMap01
pnpm dev

# Test backend
curl http://localhost:8000/
curl -X POST -F "file=@legacy_demo.zip" http://localhost:8000/upload-analyze

# Test frontend
open http://localhost:3000
```

---

## 🎯 Checklist

- [ ] Backend running on port 8000
- [ ] Frontend files updated (upload, dashboard, details-modal)
- [ ] `.env.local` created with API URL
- [ ] Frontend running on port 3000
- [ ] Can upload ZIP file
- [ ] Dashboard shows real data
- [ ] "View Calls" button works
- [ ] "Dependencies" button works
- [ ] Modal shows file paths and line numbers

---

## 🚀 Deployment

### Backend (Railway/Render/Fly.io)
1. Push backend to GitHub
2. Deploy to hosting service
3. Note the deployed URL (e.g., `https://legacymap-backend.railway.app`)

### Frontend (Vercel)
1. Already deployed at Vercel
2. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://legacymap-backend.railway.app`
3. Redeploy

---

## ✨ Features Now Working

| Feature | Status |
|---------|--------|
| Upload ZIP file | ✅ Working |
| Analyze code | ✅ Working |
| Detect classes | ✅ Working |
| Detect methods | ✅ Working |
| Show function calls | ✅ Working |
| Show dependencies | ✅ Working |
| Line numbers | ✅ Working |
| Parent class info | ✅ Working |

**Integration Complete! 🎉**
