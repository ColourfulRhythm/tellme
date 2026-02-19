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

### Option 1: Supabase Backend (Recommended - Persistent Data) ⭐

**Best for production** - Persistent storage, no server needed!

1. **Set up Supabase** (5 minutes):
   - Follow the guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
   - Get your Supabase URL and anon key
   - Run the SQL migration from `supabase_setup.sql`

2. **Configure TellMe**:
   - Open `tellme.html`
   - Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your values

3. **Run locally**:
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Or Node.js
   npx http-server -p 8000
   ```
   Then open `http://localhost:8000/tellme.html` in your browser.

4. **Deploy to Vercel**:
   - Push to GitHub
   - Connect to Vercel
   - Deploy! (No server needed - just static files)

**Benefits:**
- ✅ Persistent data (never lost on redeploy)
- ✅ No server to manage
- ✅ Free tier (500MB database)
- ✅ Works from any device/browser

### Option 2: Express Server (Legacy)

```bash
# Install dependencies
npm install

# Start the server
npm start

# Server runs on http://localhost:3000
# Open http://localhost:3000/tellme.html in your browser
```

**Note:** This uses SQLite which gets wiped on Render's free tier. Use Supabase instead for persistent storage.

### Option 3: Frontend Only (LocalStorage Mode)

```bash
# Python 3
python3 -m http.server 8000

# Or Node.js
npx http-server -p 8000
```

Then open `http://localhost:8000/tellme.html` in your browser.

**Note:** Without Supabase, data is stored in localStorage only (per-browser, not synced).

## How It Works

1. **Create Account**: User picks a handle (e.g., "alex") and a 4-digit PIN
2. **Get Link**: User receives a public link like `yoursite.com/#/u/alex`
3. **Share Link**: Anyone can visit the link and ask anonymous questions
4. **View Dashboard**: User logs in with handle + PIN to see all questions
5. **Download Cards**: User can download beautiful "bento cards" to reply on social media

## Data Storage

### Supabase Mode (Recommended) ⭐

When configured with Supabase:
- ✅ **Persistent storage** - Data stored in PostgreSQL cloud database
- ✅ **Synced across devices** - Login from any device/browser
- ✅ **Never lost** - Data persists even after clearing browser cache
- ✅ **Free tier** - 500MB database, perfect for this app
- ✅ **No server needed** - Direct connection from frontend

### LocalStorage Mode (Fallback)

If Supabase is not configured, data falls back to browser's `localStorage`:
- ✅ **No setup needed** - Works immediately
- ✅ **Complete privacy** - All data stays in your browser
- ✅ **Fast** - Instant access, no network delays
- ⚠️ **Per-browser/device** - Data is not synced across devices
- ⚠️ **Browser-specific** - Clearing browser data will delete all accounts

**To enable Supabase:** Follow [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

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
- **@supabase/supabase-js** - Supabase client library (loaded from CDN)

### Backend (Optional - Legacy Express Server)
- **Express** - Web server framework
- **SQLite3** - Database for persistent storage
- **CORS** - Cross-origin resource sharing

Install with: `npm install`

**Note:** Supabase mode doesn't require any npm dependencies - everything runs in the browser!

## API Endpoints

### Supabase Mode (Current)

The app uses Supabase directly from the frontend - no API endpoints needed! All operations use Supabase's JavaScript client.

### Express Server Mode (Legacy)

When using the Express server:

- `POST /api/register` - Create new account
- `POST /api/login` - Login with handle and PIN
- `GET /api/account/:handle` - Get account and messages
- `POST /api/question` - Send anonymous question
- `DELETE /api/message/:id` - Delete a message
- `POST /api/messages/read` - Mark messages as read
- `GET /api/health` - Health check

## Configuration

### Supabase Configuration

Open `tellme.html` and set:
```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

Get these values from your Supabase project: Settings → API

See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for detailed instructions.

### Express Server Configuration (Legacy)

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

