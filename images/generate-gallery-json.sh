#!/bin/bash

set -euo pipefail

GALLERY_DIR="gallery"
OUTPUT_FILE="./gallery.json"
WEBP_QUALITY="${WEBP_QUALITY:-80}"
shopt -s nullglob

convert_to_webp() {
  local input="$1"
  local output="$2"

  if command -v cwebp >/dev/null 2>&1; then
    cwebp -quiet -q "$WEBP_QUALITY" "$input" -o "$output"
    return 0
  fi

  if command -v magick >/dev/null 2>&1; then
    magick "$input" -quality "$WEBP_QUALITY" "$output"
    return 0
  fi

  if command -v sips >/dev/null 2>&1; then
    if sips -s format webp -s formatOptions "$WEBP_QUALITY" "$input" --out "$output" >/dev/null 2>&1; then
      return 0
    fi
  fi

  echo "No WebP converter found (need cwebp, magick, or sips with webp support)." >&2
  exit 1
}

# Convert new JPEGs to WebP
for file in "$GALLERY_DIR"/*.{jpg,jpeg,JPG,JPEG}; do
  [ -e "$file" ] || continue
  filename=$(basename "$file")
  name="${filename%.*}"
  output="$GALLERY_DIR/$name.webp"

  if [ -f "$output" ] && [ "$output" -nt "$file" ]; then
    continue
  fi

  convert_to_webp "$file" "$output"
done

# Start JSON array
echo "[" > "$OUTPUT_FILE"

# Get list of files
files=("$GALLERY_DIR"/*.webp)
count=${#files[@]}
i=0

for file in "${files[@]}"; do
  filename=$(basename "$file")
  i=$((i+1))

  if [ "$i" -lt "$count" ]; then
    echo "  \"$filename\"," >> "$OUTPUT_FILE"
  else
    echo "  \"$filename\"" >> "$OUTPUT_FILE"
  fi
done

# End JSON array
echo "]" >> "$OUTPUT_FILE"

echo "gallery.json generated successfully"
