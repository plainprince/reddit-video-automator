#!/bin/bash

# This script cleans up the temporary directories used by the Reddit Video Automator.
# Run this from the root of the project to remove generated audio and images.

echo "--- Cleaning up temporary folders ---"

# Check if the audio directory exists and remove it
if [ -d "./audio" ]; then
    echo "> Removing ./audio directory..."
    rm -rf "./audio"
    echo "> Done."
fi

# Check if the images directory exists and remove it
if [ -d "./images" ]; then
    echo "> Removing ./images directory..."
    rm -rf "./images"
    echo "> Done."
fi

echo "--- Cleanup complete ---" 