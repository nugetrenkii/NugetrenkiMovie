#!/bin/bash
set -e

SOURCE_IMAGE="/Users/nugetrenki/APP/NugetrenkiMovie/src/assets/images/app-logo.jpg"
ICONSET_PATH="/Users/nugetrenki/APP/NugetrenkiMovie/ios/NugetrenkiMovie/Images.xcassets/AppIcon.appiconset"

# Resize images using sips
sips -s format png -z 40 40 "$SOURCE_IMAGE" --out "$ICONSET_PATH/icon-20@2x.png"
sips -s format png -z 60 60 "$SOURCE_IMAGE" --out "$ICONSET_PATH/icon-20@3x.png"
sips -s format png -z 58 58 "$SOURCE_IMAGE" --out "$ICONSET_PATH/icon-29@2x.png"
sips -s format png -z 87 87 "$SOURCE_IMAGE" --out "$ICONSET_PATH/icon-29@3x.png"
sips -s format png -z 80 80 "$SOURCE_IMAGE" --out "$ICONSET_PATH/icon-40@2x.png"
sips -s format png -z 120 120 "$SOURCE_IMAGE" --out "$ICONSET_PATH/icon-40@3x.png"
sips -s format png -z 120 120 "$SOURCE_IMAGE" --out "$ICONSET_PATH/icon-60@2x.png"
sips -s format png -z 180 180 "$SOURCE_IMAGE" --out "$ICONSET_PATH/icon-60@3x.png"
sips -s format png -z 1024 1024 "$SOURCE_IMAGE" --out "$ICONSET_PATH/icon-1024.png"

# Update Contents.json with filenames
cat > "$ICONSET_PATH/Contents.json" <<EOF
{
  "images" : [
    {
      "filename" : "icon-20@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-20@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-29@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-29@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-40@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-60@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "icon-60@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "icon-1024.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "iOS Icon set updated successfully!"
