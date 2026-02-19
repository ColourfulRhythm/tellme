# Supabase Setup Guide for TellMe

This guide will walk you through setting up Supabase as your database backend for TellMe.

## Why Supabase?

- ✅ **Persistent storage** - Your data won't get wiped on redeploy
- ✅ **Free tier** - 500MB database, perfect for this app
- ✅ **No server needed** - Direct connection from frontend
- ✅ **Real-time capable** - Can add live updates later
- ✅ **PostgreSQL** - Industry-standard database

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

## Step 2: Create a New Project

1. Click **"New Project"**
2. Fill in the details:
   - **Name**: `tellme` (or any name you like)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (more than enough)
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to initialize

## Step 3: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll see two important values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`
3. **Copy both values** - you'll need them in the next step

## Step 4: Set Up the Database Tables

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase_setup.sql` from this project
4. Copy and paste the entire SQL into the editor
5. Click **"Run"** (or press `Ctrl/Cmd + Enter`)
6. You should see "Success. No rows returned"

## Step 5: Configure TellMe

1. Open `tellme.html` in your code editor
2. Find these lines near the top (around line 332):
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Replace them with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```
4. Save the file

## Step 6: Test It Out

1. Open `tellme.html` in your browser
2. Check the browser console (F12) - you should see:
   ```
   ✅ Supabase connected - data will persist
   ```
3. Try registering a new account
4. Try logging in
5. Send yourself a test question

## Step 7: Deploy to Vercel

1. Push your changes to GitHub:
   ```bash
   git add tellme.html supabase_setup.sql SUPABASE_SETUP.md
   git commit -m "Switch to Supabase backend"
   git push origin main
   ```
2. Vercel will auto-deploy
3. Your app is now live with persistent storage! 🎉

## Troubleshooting

### "Supabase not configured" in console
- Make sure you replaced `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with actual values
- Check that there are no extra quotes or spaces

### "Failed to fetch" errors
- Check your Supabase project is active (not paused)
- Verify the URL and anon key are correct
- Check browser console for CORS errors

### "Account not found" after registration
- Check Supabase dashboard → Table Editor → `accounts` table
- Verify the SQL migration ran successfully
- Check browser console for error messages

### RLS (Row Level Security) errors
- Make sure you ran the `supabase_setup.sql` file completely
- Check Supabase dashboard → Authentication → Policies
- Verify the policies are enabled

## Security Notes

- The **anon key** is safe to use in frontend code (it's public)
- Row Level Security (RLS) policies protect your data
- PINs are hashed before storage (never stored in plain text)
- Anyone can read accounts/messages (needed for public links)
- Only the correct PIN can log in to an account

## What's Next?

- ✅ Your data is now persistent across deployments
- ✅ No more lost accounts on server restarts
- ✅ Works from any device/browser
- 🚀 Optional: Add real-time updates with Supabase Realtime
- 🚀 Optional: Add email notifications
- 🚀 Optional: Add analytics dashboard

## Need Help?

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check the browser console for detailed error messages

