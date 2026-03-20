# TellMe Windows App

Electron-based desktop app for Windows, wrapping the TellMe web app as a standalone .exe.

## Requirements

- Node.js 18+
- `tellme.html` in the repo root (with Supabase env vars injected via `build.js`)

## Build .exe (from any OS)

```bash
# 1. From repo root: inject env vars
SUPABASE_URL=xxx SUPABASE_ANON_KEY=yyy node build.js

# 2. Install deps and build
cd windows && npm install && npm run build:win
```

Output: `dist-win/TellMe Setup 1.0.0.exe` (installer) and `dist-win/TellMe 1.0.0.exe` (portable).

## Best results: build on Windows

Cross-compiling from macOS can be unreliable (especially on Apple Silicon). For production builds:

1. Clone the repo on a Windows machine
2. Run `npm install` in the repo root (for build.js)
3. Run the build steps above

Or use **GitHub Actions** with a Windows runner — add a workflow that runs `build:win` and uploads the .exe as an artifact.

## Run in development

```bash
cd windows && npm install
# Copy tellme.html: cp ../tellme.html .
npm start
```

## Output format

- **NSIS installer** (`TellMe Setup 1.0.0.exe`) — install to Program Files, Start Menu shortcut
- **Portable** (`TellMe 1.0.0.exe`) — single file, no install
