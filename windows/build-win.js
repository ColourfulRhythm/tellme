#!/usr/bin/env node
/**
 * Build TellMe for Windows (.exe)
 * From repo root:
 *   1. SUPABASE_URL=xxx SUPABASE_ANON_KEY=yyy node build.js
 *   2. cd windows && npm install && npm run build:win
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WINDOWS_DIR = __dirname;
const REPO_ROOT = path.join(WINDOWS_DIR, '..');
const TELLME_HTML = path.join(REPO_ROOT, 'tellme.html');
const DEST_HTML = path.join(WINDOWS_DIR, 'tellme.html');
const MAC_ICON = path.join(REPO_ROOT, 'macos', 'TellMe', 'Assets', 'AppIcon.iconset', 'icon_256x256.png');
const WIN_ICON = path.join(WINDOWS_DIR, 'icon.png');

console.log('📦 TellMe Windows Builder');
console.log('========================\n');

// 1. Ensure tellme.html exists
if (!fs.existsSync(TELLME_HTML)) {
  console.error('❌ tellme.html not found. Run from repo root: node build.js (with SUPABASE_URL and SUPABASE_ANON_KEY)');
  process.exit(1);
}

// 2. Copy tellme.html
fs.copyFileSync(TELLME_HTML, DEST_HTML);
console.log('✅ Copied tellme.html');

// 3. Copy icon (electron-builder accepts .png for Windows)
if (fs.existsSync(MAC_ICON)) {
  fs.copyFileSync(MAC_ICON, WIN_ICON);
  console.log('✅ Using app icon');
} else {
  console.warn('⚠️ No icon at macos/TellMe/Assets/AppIcon.iconset/icon_256x256.png — using default');
}

// 4. Run electron-builder
console.log('\n🔨 Building Windows executable...\n');
execSync('npx electron-builder --win', {
  cwd: WINDOWS_DIR,
  stdio: 'inherit',
});

console.log('\n✅ Done! Output in dist-win/');
console.log('   - TellMe Setup 1.0.0.exe (installer)');
console.log('   - TellMe 1.0.0.exe (portable)');
