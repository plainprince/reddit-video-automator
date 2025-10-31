#!/bin/bash

# Delete All Cache Script
# This script removes all cached and generated content

echo "Deleting all cache and generated content..."

# Remove videos cache
if [ -d "videos" ]; then
    echo "  -> Removing videos cache..."
    rm -rf videos/*
fi

# Remove temporary files
if [ -d "temp" ]; then
    echo "  -> Removing temp directory..."
    rm -rf temp/*
fi

# Remove outro videos
if [ -d "outro-videos" ]; then
    echo "  -> Removing outro-videos..."
    rm -rf outro-videos/*
fi

# Remove output videos
if [ -d "output" ]; then
    echo "  -> Removing output directory..."
    rm -rf output/*
fi

# Remove generated images
if [ -d "images" ]; then
    echo "  -> Removing images cache..."
    rm -rf images/*
fi

# Remove generated audio files
if [ -d "audio" ]; then
    echo "  -> Removing audio cache..."
    rm -rf audio/*
fi

# Remove GUI output if exists
if [ -d "gui/public/output" ]; then
    echo "  -> Removing GUI output..."
    rm -rf gui/public/output/*
fi

echo "[OK] All cache deleted successfully!"

