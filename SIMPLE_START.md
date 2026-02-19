# Simple Start - LocalStorage Mode

## 🚀 Quick Start (No Server Needed)

### Option 1: Python Server (Easiest)
```bash
python3 -m http.server 8000
```
Then open: `http://localhost:8000/tellme.html`

### Option 2: Node.js HTTP Server
```bash
npx http-server -p 8000
```
Then open: `http://localhost:8000/tellme.html`

### Option 3: Direct File
Just open `tellme.html` in your browser (some features work better with a server)

## ✅ What Works

- ✅ Create accounts with handle + PIN
- ✅ Ask anonymous questions
- ✅ View dashboard
- ✅ Download bento cards
- ✅ All data stored in browser localStorage

## 📝 How It Works

- **No backend required** - Everything runs in your browser
- **Data stored locally** - In browser's localStorage
- **Privacy-first** - No data leaves your device
- **Works offline** - No internet needed after loading

## ⚠️ Limitations

- Data is **per-browser** - Different browsers = different data
- Data is **per-device** - Not synced across devices
- Clearing browser data **deletes everything**
- No backup - If you lose browser data, accounts are gone

## 🔄 To Enable Backend Mode Later

1. Change `USE_API = false` to `USE_API = true` in `tellme.html`
2. Run `npm install` and `npm start`
3. Data will be stored in SQLite database instead

