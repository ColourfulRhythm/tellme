# Backend Setup for Persistent Data Storage

## 🎯 Goal
Set up a backend server so user data persists securely across devices and sessions.

## 🚀 Quick Setup Options

### Option 1: Railway (Recommended - Easiest)

Railway is perfect for this - it supports SQLite with persistent storage.

1. **Go to [railway.app](https://railway.app)** and sign up
2. **Click "New Project"** → **"Deploy from GitHub"**
3. **Select your `tellme` repository**
4. **Railway will auto-detect** Node.js and deploy
5. **Your backend will be live** at `https://your-app.railway.app`

**Environment Variables (optional):**
- `PORT` - Railway sets this automatically
- `DB_PATH` - Leave default (Railway persists files)

**Database:** SQLite database persists automatically on Railway.

**Update Frontend:**
- Your frontend at `tellme.adparlay.com` will automatically connect to the backend
- The API health check will detect it and enable persistent storage

### Option 2: Render

1. **Go to [render.com](https://render.com)** and sign up
2. **Click "New"** → **"Web Service"**
3. **Connect GitHub** and select `tellme` repository
4. **Settings:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. **Deploy!**

**Database:** Render persists files, so SQLite works perfectly.

### Option 3: Separate Backend Server

If you have your own server (VPS, etc.):

1. **SSH into your server**
2. **Clone the repo:**
   ```bash
   git clone https://github.com/ColourfulRhythm/tellme.git
   cd tellme
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start with PM2 (recommended):**
   ```bash
   npm install -g pm2
   pm2 start server.js --name tellme
   pm2 save
   pm2 startup
   ```
5. **Set up reverse proxy** (nginx) to point to port 3000

## 🔒 Security Features

The backend already includes:

- ✅ **PIN Hashing** - PINs are hashed before storage
- ✅ **Handle Validation** - Handles must be unique
- ✅ **No Email Required** - Privacy-first approach
- ✅ **CORS Protection** - Only allows requests from your domain
- ✅ **SQL Injection Protection** - Uses parameterized queries

## 📊 How It Works

1. **Frontend checks** for backend API on load
2. **If backend available** → Uses database (persistent)
3. **If backend unavailable** → Falls back to localStorage
4. **Data structure:**
   - Accounts: `handle`, `pin_hash`, `created_at`
   - Messages: `id`, `handle`, `text`, `is_new`, `created_at`

## 🔧 Configuration

### Backend URL

The frontend automatically uses `window.location.origin` for the API.

If your backend is on a different domain, update in `tellme.html`:

```javascript
const API_BASE = 'https://your-backend.railway.app'; // Your backend URL
```

### Database Location

Default: `tellme.db` in project root

To change:
```bash
DB_PATH=/path/to/database.db npm start
```

## ✅ Testing

1. **Start backend:**
   ```bash
   npm start
   ```

2. **Check health:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should return: `{"status":"ok","timestamp":...}`

3. **Test registration:**
   ```bash
   curl -X POST http://localhost:3000/api/register \
     -H "Content-Type: application/json" \
     -d '{"handle":"test","pin":"1234"}'
   ```

## 🚨 Important Notes

- **Database backups:** Regularly backup `tellme.db` file
- **PIN security:** PINs are hashed, but consider stronger hashing (bcrypt) for production
- **Rate limiting:** Consider adding rate limiting for production
- **HTTPS:** Always use HTTPS in production

## 📈 Monitoring

Check backend logs:
- **Railway:** Dashboard → Logs tab
- **Render:** Dashboard → Logs
- **PM2:** `pm2 logs tellme`

## 🔄 Migration from LocalStorage

If users already have data in localStorage:
- They can continue using it
- New accounts will use the backend
- Old accounts remain in localStorage until they create new ones

## 🎉 Once Deployed

Your app at `tellme.adparlay.com` will:
- ✅ Automatically detect the backend
- ✅ Save all data persistently
- ✅ Work across all devices
- ✅ Keep data secure per user

