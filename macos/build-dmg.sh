#!/bin/bash
# Build TellMe macOS app and create a DMG for distribution

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
DMG_NAME="TellMe-1.0.dmg"

echo "📦 TellMe macOS DMG Builder"
echo "=========================="

# Ensure tellme.html exists
if [ ! -f "$REPO_ROOT/tellme.html" ]; then
  echo "❌ tellme.html not found at $REPO_ROOT/tellme.html"
  exit 1
fi

# Build the app
echo ""
echo "🔨 Building TellMe.app..."
rm -rf "$BUILD_DIR"
xcodebuild -project "$SCRIPT_DIR/TellMe.xcodeproj" \
  -scheme TellMe \
  -configuration Release \
  -derivedDataPath "$BUILD_DIR" \
  clean build

APP_PATH="$BUILD_DIR/Build/Products/Release/TellMe.app"
if [ ! -d "$APP_PATH" ]; then
  echo "❌ Build failed: TellMe.app not found"
  exit 1
fi

# Create DMG
echo ""
echo "📀 Creating DMG..."

DMG_TEMP="$BUILD_DIR/dmg_temp"
DMG_OUT="$REPO_ROOT/$DMG_NAME"

rm -rf "$DMG_TEMP"
mkdir -p "$DMG_TEMP"

# Copy app
cp -R "$APP_PATH" "$DMG_TEMP/"

# Create symlink to Applications
ln -s /Applications "$DMG_TEMP/Applications"

# Remove old DMG if exists
rm -f "$DMG_OUT"

# Create DMG with hdiutil
hdiutil create -volname "TellMe" \
  -srcfolder "$DMG_TEMP" \
  -ov -format UDZO \
  "$DMG_OUT"

# Cleanup
rm -rf "$DMG_TEMP"

echo ""
echo "✅ Done! DMG created: $DMG_OUT"
echo ""
echo "To install: Open the DMG, drag TellMe to Applications."
