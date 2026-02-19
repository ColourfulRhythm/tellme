# Environment Variables Setup

This project uses environment variables to keep Supabase credentials secure and out of the source code.

## For Vercel Deployment

1. **Go to your Vercel project dashboard**
2. **Navigate to**: Settings → Environment Variables
3. **Add these two variables**:

   ```
   SUPABASE_URL = https://yakzsrkwhlwwdkonlzem.supabase.co
   SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlha3pzcmt3aGx3d2Rrb25semVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MjQ2MTksImV4cCI6MjA4NzEwMDYxOX0.nhRdfpnyJQ5sR33aA8z7-tek_Ftbnt6t8PICtr-h-Bc
   ```

4. **Select environment**: Production, Preview, and Development (or just Production)
5. **Click "Save"**
6. **Redeploy** your project (Vercel will automatically use the new env vars)

## For Local Development

1. **Create a `.env` file** in the project root:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** and add your values:
   ```
   SUPABASE_URL=https://yakzsrkwhlwwdkonlzem.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlha3pzcmt3aGx3d2Rrb25semVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MjQ2MTksImV4cCI6MjA4NzEwMDYxOX0.nhRdfpnyJQ5sR33aA8z7-tek_Ftbnt6t8PICtr-h-Bc
   ```

3. **Run the build script**:
   ```bash
   npm run build
   ```

4. **Serve the files**:
   ```bash
   python3 -m http.server 8000
   # or
   npx http-server -p 8000
   ```

## How It Works

- The `build.js` script reads environment variables
- It injects them into `tellme.html` and `index.html` at build time
- The actual credentials never appear in your source code
- Vercel automatically runs `npm run build` during deployment

## Security Benefits

✅ **Credentials not in Git** - No secrets in your repository  
✅ **Easy to rotate** - Change keys in Vercel dashboard, redeploy  
✅ **Environment-specific** - Different keys for dev/staging/prod  
✅ **Team-friendly** - Each developer can use their own `.env` file

## Important Notes

- The `.env` file is in `.gitignore` - it won't be committed
- Never commit actual credentials to Git
- The build script will fail if env vars are missing (good for catching mistakes)

