#!/bin/bash
# Script para gerar ícones PWA em diferentes tamanhos
# Requer: sharp-cli ou imagemagick

echo "📱 PWA Icon Generator"
echo "===================="

# Sizes needed for PWA
SIZES=(72 96 128 144 152 192 384 512)

# Check if sharp-cli is available
if command -v sharp &> /dev/null; then
    echo "Using sharp-cli..."
    
    for size in "${SIZES[@]}"; do
        echo "Generating icon-${size}x${size}.png..."
        sharp -i public/icons/icon.svg -o "public/icons/icon-${size}x${size}.png" resize $size $size
    done
    
# Check if imagemagick is available
elif command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    
    for size in "${SIZES[@]}"; do
        echo "Generating icon-${size}x${size}.png..."
        convert -background none -resize ${size}x${size} public/icons/icon.svg "public/icons/icon-${size}x${size}.png"
    done
    
# Check if rsvg-convert is available
elif command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert..."
    
    for size in "${SIZES[@]}"; do
        echo "Generating icon-${size}x${size}.png..."
        rsvg-convert -w $size -h $size public/icons/icon.svg -o "public/icons/icon-${size}x${size}.png"
    done
    
else
    echo "⚠️  No image conversion tool found!"
    echo "Please install one of:"
    echo "  - sharp-cli: npm install -g sharp-cli"
    echo "  - imagemagick: apt-get install imagemagick"
    echo "  - librsvg: apt-get install librsvg2-bin"
    echo ""
    echo "Or use an online tool to convert the SVG to PNG in these sizes:"
    for size in "${SIZES[@]}"; do
        echo "  - ${size}x${size}"
    done
    exit 1
fi

echo ""
echo "✅ Icons generated successfully!"
echo ""
echo "Don't forget to also create:"
echo "  - apple-touch-icon.png (180x180)"
echo "  - favicon-32x32.png"
echo "  - favicon-16x16.png"
