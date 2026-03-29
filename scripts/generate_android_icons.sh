#!/bin/bash
set -e

SOURCE_IMAGE="/Users/nugetrenki/APP/NugetrenkiMovie/src/assets/images/app-logo.jpg"
RES_PATH="/Users/nugetrenki/APP/NugetrenkiMovie/android/app/src/main/res"

# Function to resize and generate both square and round icons
generate_icon() {
    local size=$1     # e.g., 48
    local folder=$2   # e.g., mipmap-mdpi
    
    # Generate square icon
    sips -s format png -z "$size" "$size" "$SOURCE_IMAGE" --out "$RES_PATH/$folder/ic_launcher.png"
    # Generate round icon
    sips -s format png -z "$size" "$size" "$SOURCE_IMAGE" --out "$RES_PATH/$folder/ic_launcher_round.png"
}

# Generate for different resolutions
generate_icon 48  "mipmap-mdpi"
generate_icon 72  "mipmap-hdpi"
generate_icon 96  "mipmap-xhdpi"
generate_icon 144 "mipmap-xxhdpi"
generate_icon 192 "mipmap-xxxhdpi"

echo "Android icons (mipmap) updated successfully!"
