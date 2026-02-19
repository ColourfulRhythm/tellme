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

### Option 1: Simple HTTP Server (Recommended)

```bash
# Python 3
python3 -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000

# Or Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open `http://localhost:8000/tellme.html` in your browser.

### Option 2: Direct File

You can open `tellme.html` directly in your browser, but some features (like routing) work better with a local server.

### Option 3: Deploy Anywhere

Since it's a single HTML file, you can deploy it to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Just upload `tellme.html` and rename it to `index.html` if needed.

## How It Works

1. **Create Account**: User picks a handle (e.g., "alex") and a 4-digit PIN
2. **Get Link**: User receives a public link like `yoursite.com/#/u/alex`
3. **Share Link**: Anyone can visit the link and ask anonymous questions
4. **View Dashboard**: User logs in with handle + PIN to see all questions
5. **Download Cards**: User can download beautiful "bento cards" to reply on social media

## Data Storage

All data is stored in the browser's `localStorage`. This means:
- ✅ No server needed
- ✅ Complete privacy
- ⚠️ Data is per-browser/device (not synced across devices)
- ⚠️ Clearing browser data will delete all accounts

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

- **Google Fonts** (Syne, DM Sans) - Loaded from CDN
- **html2canvas** - For generating bento card images (loaded from CDN)

## Security Notes

- PINs are hashed using a simple hash function (not cryptographically secure)
- This is a client-side only app - suitable for personal/small-scale use
- For production use with many users, consider adding a backend

## License

Free to use and modify.

