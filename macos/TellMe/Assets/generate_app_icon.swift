import AppKit

let size = NSSize(width: 1024, height: 1024)
let image = NSImage(size: size)

image.lockFocus()

let bgRect = NSRect(origin: .zero, size: size)
let cornerRadius: CGFloat = 220
let bgPath = NSBezierPath(roundedRect: bgRect, xRadius: cornerRadius, yRadius: cornerRadius)
NSColor(calibratedRed: 0.06, green: 0.07, blue: 0.09, alpha: 1.0).setFill()
bgPath.fill()

let glyph = "👂" as NSString
let fontSize: CGFloat = 620
let attrs: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: fontSize),
    .foregroundColor: NSColor(calibratedRed: 0.72, green: 1.0, blue: 0.20, alpha: 1.0)
]

let textSize = glyph.size(withAttributes: attrs)
let textRect = NSRect(
    x: (size.width - textSize.width) / 2,
    y: (size.height - textSize.height) / 2 - 15,
    width: textSize.width,
    height: textSize.height
)

glyph.draw(in: textRect, withAttributes: attrs)

image.unlockFocus()

guard
    let tiffData = image.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiffData),
    let pngData = bitmap.representation(using: .png, properties: [:])
else {
    fputs("Failed to create PNG data\n", stderr)
    exit(1)
}

let outputPath = "/Users/mac/tellme/macos/TellMe/Assets/AppIcon-1024.png"
do {
    try pngData.write(to: URL(fileURLWithPath: outputPath))
    print("Wrote \(outputPath)")
} catch {
    fputs("Write failed: \(error)\n", stderr)
    exit(1)
}
