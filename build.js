#!/usr/bin/env node
/**
 * Build script to inject environment variables into HTML files
 * This keeps Supabase credentials out of the source code
 */

const fs = require('fs');
const path = require('path');

// Read environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  console.error('   Set them in Vercel dashboard: Settings → Environment Variables');
  process.exit(1);
}

// Files to process
const files = ['tellme.html', 'index.html'];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${file}`);
    return;
  }

  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the placeholder values (handle both ENV_* placeholders and any existing values)
  content = content.replace(
    /const SUPABASE_URL = ['"][^'"]*['"];?/,
    `const SUPABASE_URL = '${SUPABASE_URL}';`
  );
  
  content = content.replace(
    /const SUPABASE_ANON_KEY = ['"][^'"]*['"];?/,
    `const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';`
  );

  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Injected environment variables into ${file}`);
});

console.log('✅ Build complete!');

