# Deployment Guide

## Backend Deployment Options

### 1. Railway (Recommended - Easiest)

1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Railway will auto-detect Node.js and deploy
6. Your app will be live at `https://your-app.railway.app`

**Database:** Railway automatically persists the SQLite database.

### 2. Render

1. Push your code to GitHub
2. Go to [Render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
6. Deploy!

**Database:** Render persists files, so SQLite will work.

### 3. Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy: `git push heroku main`
5. Open: `heroku open`

**Note:** Heroku uses ephemeral filesystem. Consider using PostgreSQL addon for production.

### 4. Vercel (Frontend Only)

For frontend-only deployment:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

**Note:** Vercel is serverless. Use this for frontend-only (localStorage mode).

### 5. DigitalOcean App Platform

1. Connect GitHub repository
2. Select Node.js
3. Set build command: `npm install`
4. Set run command: `npm start`
5. Deploy!

## Environment Variables

Set these in your hosting platform:

```env
PORT=3000
DB_PATH=/app/data/tellme.db  # Adjust based on platform
```

## Database Backup

To backup your SQLite database:

```bash
# Copy the database file
cp tellme.db tellme-backup-$(date +%Y%m%d).db
```

## Production Checklist

- [ ] Set up environment variables
- [ ] Enable HTTPS (most platforms do this automatically)
- [ ] Set up database backups
- [ ] Configure CORS if needed (already set to allow all)
- [ ] Monitor server logs
- [ ] Set up error tracking (optional)

## Troubleshooting

### Database not persisting

Some platforms use ephemeral filesystems. Solutions:
1. Use a database service (PostgreSQL, MySQL)
2. Use external storage (S3, etc.)
3. Use a platform that persists files (Railway, Render)

### CORS errors

The server already has CORS enabled. If you still see errors:
- Check that the frontend URL matches the backend origin
- Verify CORS middleware is loaded

### Port issues

Most platforms set `PORT` automatically. If not:
- Set `PORT` environment variable
- Or modify `server.js` default port

