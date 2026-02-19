# Vercel Deployment Guide

## ⚠️ Important: Database Limitation

**Vercel uses serverless functions with an ephemeral filesystem.** This means:

- SQLite database files in `/tmp` are **cleared between deployments**
- Data will **not persist** across function invocations in production
- Each serverless function instance has its own isolated `/tmp` directory

## Solutions

### Option 1: Use External Database (Recommended for Production)

For persistent data on Vercel, use an external database service:

1. **Turso** (SQLite-compatible, serverless-friendly)
2. **PlanetScale** (MySQL)
3. **Supabase** (PostgreSQL)
4. **MongoDB Atlas** (MongoDB)

### Option 2: Frontend-Only Mode

Deploy just the frontend to Vercel (uses localStorage):

1. Remove `server.js` from deployment
2. Update `vercel.json` to only serve static files
3. Data will be stored in browser localStorage

### Option 3: Use a Different Hosting Platform

For SQLite with persistent storage, consider:
- **Railway** (recommended - easy SQLite support)
- **Render** (persists files)
- **DigitalOcean App Platform**
- **Heroku** (with PostgreSQL addon)

## Current Setup

The current configuration will work for **testing**, but data will be lost on each deployment.

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts** to link your project

4. **Your app will be live** at `https://your-project.vercel.app`

## Configuration Files

- `vercel.json` - Routes API requests to server.js, serves static files
- `.vercelignore` - Excludes database files and node_modules from deployment

## Testing Locally

Test the Vercel setup locally:

```bash
vercel dev
```

This will simulate Vercel's serverless environment locally.

## Troubleshooting

### 404 Errors

1. Check that `vercel.json` is in the root directory
2. Verify routes are configured correctly
3. Ensure `server.js` exports the Express app (it does)

### Database Errors

If you see database errors:
- This is expected - SQLite won't persist on Vercel
- Consider using an external database service
- Or use frontend-only mode (localStorage)

### Static Files Not Loading

1. Check that `tellme.html` is in the root
2. Verify the rewrites in `vercel.json`
3. Try accessing `/tellme.html` directly

## Next Steps

For production with persistent data:
1. Set up Turso or another database service
2. Update `server.js` to use the external database
3. Add database connection string to Vercel environment variables

