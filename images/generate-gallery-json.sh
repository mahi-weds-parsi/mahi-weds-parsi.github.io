#!/bin/bash

GALLERY_DIR="gallery"
OUTPUT_FILE="./gallery.json"
shopt -s nullglob

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
