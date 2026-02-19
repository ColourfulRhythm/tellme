# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open in Browser
```
http://localhost:3000/tellme.html
```

That's it! Your data is now saved to a SQLite database and will persist across devices.

## 📊 What Changed?

**Before:** Data stored in browser localStorage
- ❌ Lost when clearing browser data
- ❌ Not synced across devices
- ❌ Per-browser only

**Now:** Data stored in SQLite database
- ✅ Persists forever (until you delete the database)
- ✅ Synced across all devices using the same server
- ✅ Survives browser clearing
- ✅ Automatic fallback to localStorage if server is down

## 🔄 How It Works

1. **Frontend** tries to connect to the API server
2. If server is available → uses database (persistent)
3. If server is down → falls back to localStorage (temporary)

## 🗄️ Database Location

The database file `tellme.db` is created automatically in the project root.

To change location, set environment variable:
```bash
DB_PATH=/path/to/your/database.db npm start
```

## 🛠️ Development Mode

For auto-restart on file changes:
```bash
npm run dev
```

(Requires `nodemon` - install with `npm install -g nodemon` or it's included in devDependencies)

## 📝 Next Steps

- See [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- The frontend automatically detects and uses the backend when available

