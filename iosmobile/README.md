# TellMe iOS app

**Cursor/AI cannot open or control Xcode or the Simulator on your Mac.** Everything below runs on your machine.

## What this is

- Native **SwiftUI** shell with **WKWebView** loading your web app.
- On **every build**, a script copies **`../tellme.html`** (repo root) into the app bundle — so the iPhone app always matches whatever you last saved in the web project (including Bento share buttons, dashboard, etc.).

## Before building (required for backend)

The app needs Supabase credentials and the production API URL in `tellme.html`. Run the build script **before** building in Xcode:

```bash
# From repo root — uses .env or SUPABASE_URL / SUPABASE_ANON_KEY
npm run build
```

This injects credentials into `tellme.html`. Then build the iOS app.

## Open in Xcode

1. On your Mac, open **`iosmobile/TellMe.xcodeproj`** in Xcode (double‑click or File → Open).
2. In the top bar, pick a simulator (e.g. **iPhone 14 Pro**).
3. Press **⌘R** to build and run.

If build fails with **“tellme.html not found”**, the project expects this layout:

```text
tellme/
  tellme.html          ← your web app
  iosmobile/
    TellMe.xcodeproj
    TellMe/
      *.swift, Info.plist
```

## Signing (real device)

1. Select the **TellMe** target → **Signing & Capabilities**.
2. Choose your **Team** (Apple ID).
3. Change **Bundle Identifier** if `com.tellme.app` is taken (e.g. `com.yourname.tellme`).

Simulator often runs without a paid team; device needs a valid team.

## Command line (optional)

From the repo root:

```bash
cd iosmobile
xcodebuild -scheme TellMe -destination 'platform=iOS Simulator,name=iPhone 16' -configuration Debug build
```

Then install/run the `.app` with **Simulator** open, or just use **⌘R** in Xcode.

## Files

| Path | Role |
|------|------|
| `TellMe/TellmeApp.swift` | App entry |
| `TellMe/ContentView.swift` | Full‑screen web view |
| `TellMe/WebView.swift` | Loads bundled `tellme.html` |
| **Build phase “Sync tellme.html”** | Copies repo root `tellme.html` into the app |

No need to manually copy HTML into Xcode — edit `tellme.html` at the repo root and rebuild.
