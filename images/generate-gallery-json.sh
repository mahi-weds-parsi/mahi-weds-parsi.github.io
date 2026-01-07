#!/bin/bash

GALLERY_DIR="gallery"
OUTPUT_FILE="./gallery.json"

# Start JSON array
echo "[" > "$OUTPUT_FILE"

# Get list of files
files=("$GALLERY_DIR"/*)
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

