# TellMe macOS App

Native macOS app wrapping TellMe in a WebView, distributable as a DMG.

## Requirements

- macOS 13.0+
- Xcode 15+ (or Xcode command line tools)
- `tellme.html` in the repo root (with Supabase env vars injected via `build.js`)

## Build & Create DMG

```bash
# From repo root: inject env vars first (if deploying)
SUPABASE_URL=xxx SUPABASE_ANON_KEY=yyy node build.js

# Build app and create DMG
cd macos && ./build-dmg.sh
```

The DMG will be created at `TellMe-1.0.dmg` in the repo root.

## Run from Xcode

1. Open `macos/TellMe.xcodeproj` in Xcode
2. Select the TellMe scheme
3. Run (⌘R)

## Notes

- The app loads `tellme.html` from its bundle (copied during build)
- Requires `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the HTML (via `build.js`)
