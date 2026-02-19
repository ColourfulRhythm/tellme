# Render Backend Setup Guide

## ✅ You've Deployed to Render!

Now let's connect your frontend to the backend.

## 🔗 Step 1: Get Your Render Backend URL

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Click on your `tellme` service
3. Copy the **Service URL** (e.g., `https://tellme-xxxx.onrender.com`)

## 🔧 Step 2: Update Frontend Configuration

You have two options:

### Option A: Update in Code (Recommended)

1. Open `tellme.html` and `index.html`
2. Find this line:
   ```javascript
   const BACKEND_URL = ''; // Leave empty to auto-detect
   ```
3. Update it with your Render URL:
   ```javascript
   const BACKEND_URL = 'https://tellme-xxxx.onrender.com';
   ```
4. Save and push to GitHub
5. Vercel will auto-deploy the update

### Option B: Use Environment Variable (Advanced)

If you want to configure it via Vercel environment variables, we can set that up.

## 🔒 Step 3: Update CORS in Backend

The backend needs to allow requests from your frontend domain.

1. Go to your Render service
2. Open the **Shell** tab or use the Render dashboard
3. Or update `server.js` locally and push:

In `server.js`, the CORS already includes `https://tellme.adparlay.com`, so you should be good!

If you need to add more domains, update the `allowedOrigins` array in `server.js`:

```javascript
const allowedOrigins = [
  'https://tellme.adparlay.com',
  'https://your-frontend-domain.com', // Add more if needed
  'http://localhost:3000',
  'http://localhost:8000'
];
```

## ✅ Step 4: Test the Connection

1. Open your frontend: `https://tellme.adparlay.com`
2. Open browser console (F12)
3. You should see: `✅ Backend API connected - data will persist`

If you see: `ℹ️ Using localStorage mode`, check:
- Backend URL is correct
- CORS is configured properly
- Backend is running on Render

## 🧪 Test Backend Directly

Test your Render backend:

```bash
curl https://your-render-url.onrender.com/api/health
```

Should return: `{"status":"ok","timestamp":...}`

## 📊 Verify It's Working

1. **Create a new account** on `tellme.adparlay.com`
2. **Check Render logs** - you should see the registration request
3. **Data persists** - refresh the page, log in again, data should be there
4. **Cross-device** - try from another device/browser, data should sync

## 🚨 Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Check that `https://tellme.adparlay.com` is in the `allowedOrigins` array
2. Make sure the backend URL in frontend matches exactly
3. Check Render logs for CORS error messages

### 404 on API Calls

- Verify the backend URL is correct
- Check that Render service is running (not sleeping)
- Render free tier services sleep after 15 min of inactivity - first request may be slow

### Database Not Persisting

- Render persists files, so SQLite should work
- Check Render logs for database errors
- Verify the database file is being created

## 🎉 Once Connected

Your app will:
- ✅ Save all data to the database
- ✅ Work across all devices
- ✅ Persist data permanently
- ✅ Keep usernames unique and secure

## 📝 Quick Checklist

- [ ] Render backend deployed and running
- [ ] Backend URL copied
- [ ] Frontend updated with backend URL
- [ ] CORS configured (already done)
- [ ] Tested connection (check console)
- [ ] Created test account
- [ ] Verified data persists

## 🔄 Next Steps

Once everything is working:
- Monitor Render logs for any issues
- Set up database backups (optional)
- Consider adding rate limiting (optional)
- Add monitoring/analytics (optional)

