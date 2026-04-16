#!/bin/sh
set -e

SRC_HTML="${SRCROOT}/../tellme.html"
SRC_ICON="${SRCROOT}/../tellme_1080g.jpg"
RES_DIR="${TARGET_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}"
DEST_HTML="${RES_DIR}/tellme.html"
ICONSET_DIR="${TEMP_DIR}/TellMe.iconset"
TMP_ICON_PNG="${TEMP_DIR}/TellMe-source.png"
ROUNDED_ICON_PNG="${TEMP_DIR}/TellMe-source-rounded.png"
DEST_ICON="${RES_DIR}/AppIcon.icns"

if [ ! -f "$SRC_HTML" ]; then
  echo "error: tellme.html not found at $SRC_HTML"
  exit 1
fi

mkdir -p "$RES_DIR"
cp "$SRC_HTML" "$DEST_HTML"
echo "Synced tellme.html -> $DEST_HTML"

if [ -f "$SRC_ICON" ]; then
  rm -rf "$ICONSET_DIR"
  mkdir -p "$ICONSET_DIR"

  sips -s format png "$SRC_ICON" --out "$TMP_ICON_PNG" >/dev/null

  # Round icon corners so Finder/Launchpad do not show a hard square.
  swift - "$TMP_ICON_PNG" "$ROUNDED_ICON_PNG" <<'SWIFT'
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else { exit(1) }
let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])

guard
    let source = NSImage(contentsOf: inputURL),
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: 1024,
        pixelsHigh: 1024,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )
else {
    exit(1)
}

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
guard let context = NSGraphicsContext.current else { exit(1) }

context.imageInterpolation = .high
NSColor.clear.setFill()
NSRect(x: 0, y: 0, width: 1024, height: 1024).fill()

let radius: CGFloat = 220
let clipPath = NSBezierPath(
    roundedRect: NSRect(x: 0, y: 0, width: 1024, height: 1024),
    xRadius: radius,
    yRadius: radius
)
clipPath.addClip()
source.draw(in: NSRect(x: 0, y: 0, width: 1024, height: 1024))

NSGraphicsContext.restoreGraphicsState()

guard let data = rep.representation(using: .png, properties: [:]) else { exit(1) }
try data.write(to: outputURL)
SWIFT

  sips -z 16 16 "$ROUNDED_ICON_PNG" --out "$ICONSET_DIR/icon_16x16.png" >/dev/null
  sips -z 32 32 "$ROUNDED_ICON_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png" >/dev/null
  sips -z 32 32 "$ROUNDED_ICON_PNG" --out "$ICONSET_DIR/icon_32x32.png" >/dev/null
  sips -z 64 64 "$ROUNDED_ICON_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png" >/dev/null
  sips -z 128 128 "$ROUNDED_ICON_PNG" --out "$ICONSET_DIR/icon_128x128.png" >/dev/null
  sips -z 256 256 "$ROUNDED_ICON_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png" >/dev/null
  sips -z 256 256 "$ROUNDED_ICON_PNG" --out "$ICONSET_DIR/icon_256x256.png" >/dev/null
  sips -z 512 512 "$ROUNDED_ICON_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png" >/dev/null
  sips -z 512 512 "$ROUNDED_ICON_PNG" --out "$ICONSET_DIR/icon_512x512.png" >/dev/null
  sips -z 1024 1024 "$ROUNDED_ICON_PNG" --out "$ICONSET_DIR/icon_512x512@2x.png" >/dev/null

  iconutil -c icns "$ICONSET_DIR" -o "$DEST_ICON"
  echo "Synced rounded app icon -> $DEST_ICON"
else
  echo "warning: tellme_1080g.jpg not found at $SRC_ICON; keeping existing app icon"
fi
