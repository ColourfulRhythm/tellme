# TellMe — Anonymous Questions Platform

A beautiful, privacy-focused anonymous Q&A platform. Users create a link with a handle and PIN, then others can ask anonymous questions. Perfect for content creators who want to collect questions and reply with styled "bento cards" on social media.

## Features

- ✨ **No Email Required** - Just a handle and 4-digit PIN
- 🔒 **100% Anonymous** - Questions are completely anonymous
- 🎨 **Beautiful Bento Cards** - Download styled question cards for Reels, TikTok, Stories
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 💾 **Client-Side Storage** - All data stored locally in browser (privacy-first)
- 🎯 **Simple & Fast** - Single HTML file, no backend needed

## Quick Start

### Option 1: Full Backend Setup (Recommended - Persistent Data)

```bash
# Install dependencies
npm install

# Start the server
npm start

# Server runs on http://localhost:3000
# Open http://localhost:3000/tellme.html in your browser
```

The server will:
- Create a SQLite database (`tellme.db`) automatically
- Store all accounts and messages persistently
- Provide API endpoints for the frontend

### Option 2: Frontend Only (LocalStorage Mode)

```bash
# Python 3
python3 -m http.server 8000

# Or Node.js
npx http-server -p 8000
```

Then open `http://localhost:8000/tellme.html` in your browser.

**Note:** Without the backend, data is stored in localStorage only (per-browser).

### Option 3: Deploy to Production

**Backend + Frontend:**
- Deploy `server.js` to any Node.js hosting (Heroku, Railway, Render, etc.)
- The server serves the frontend automatically
- Database persists on the server

**Frontend Only:**
- Deploy `tellme.html` to static hosting (GitHub Pages, Netlify, Vercel)
- Rename to `index.html` if needed
- Works with localStorage fallback

## How It Works

1. **Create Account**: User picks a handle (e.g., "alex") and a 4-digit PIN
2. **Get Link**: User receives a public link like `yoursite.com/#/u/alex`
3. **Share Link**: Anyone can visit the link and ask anonymous questions
4. **View Dashboard**: User logs in with handle + PIN to see all questions
5. **Download Cards**: User can download beautiful "bento cards" to reply on social media

## Data Storage

**Currently using: LocalStorage Mode**

All data is stored in the browser's `localStorage`:
- ✅ **No server needed** - Works completely offline
- ✅ **Complete privacy** - All data stays in your browser
- ✅ **Fast** - Instant access, no network delays
- ⚠️ **Per-browser/device** - Data is not synced across devices
- ⚠️ **Browser-specific** - Clearing browser data will delete all accounts

**Note:** Backend mode is available but disabled by default. To enable it, change `USE_API = false` to `USE_API = true` in `tellme.html` and run the server.

## Customization

The app uses dynamic URLs based on your current domain. No configuration needed!

To customize:
- **Colors**: Edit CSS variables in the `:root` section
- **Fonts**: Currently uses Google Fonts (Syne & DM Sans)
- **Styling**: All styles are in the `<style>` tag

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- localStorage
- CSS Grid & Flexbox
- html2canvas (for bento card downloads)

## Dependencies

### Frontend
- **Google Fonts** (Syne, DM Sans) - Loaded from CDN
- **html2canvas** - For generating bento card images (loaded from CDN)

### Backend (if using server)
- **Express** - Web server framework
- **SQLite3** - Database for persistent storage
- **CORS** - Cross-origin resource sharing

Install with: `npm install`

## API Endpoints

When using the backend server:

- `POST /api/register` - Create new account
- `POST /api/login` - Login with handle and PIN
- `GET /api/account/:handle` - Get account and messages
- `POST /api/question` - Send anonymous question
- `DELETE /api/message/:id` - Delete a message
- `POST /api/messages/read` - Mark messages as read
- `GET /api/health` - Health check

## Configuration

Create a `.env` file (optional):
```env
PORT=3000
DB_PATH=/path/to/tellme.db
```

If not set, defaults to:
- Port: 3000
- Database: `tellme.db` in project root

## Security Notes

- PINs are hashed using a simple hash function (not cryptographically secure)
- For production, consider:
  - Using stronger password hashing (bcrypt)
  - Adding rate limiting
  - Using HTTPS
  - Implementing proper authentication tokens

## License

Free to use and modify.

