# Usage Examples

Common use cases and practical examples for the Reddit Video Automator.

## Basic Usage

### Generate Your First Video

```bash
# Default Reddit video
bun index.js
```

This creates a single Reddit-style video with default settings in the `./output` folder.

### Generate Multiple Videos

```bash
# Generate 5 videos
bun index.js --count 5

# Generate 10 videos
bun index.js -c 10
```

## Video Type Examples

### Reddit Videos

```bash
# Basic Reddit video
bun index.js --video-type reddit

# With custom question
bun index.js --video-type reddit \
  -q "Have you ever experienced something paranormal?"

# Multiple Reddit videos
bun index.js --video-type reddit --count 3
```

### AITA Videos

```bash
# Basic AITA video
bun index.js --video-type aita

# With custom scenario
bun index.js --video-type aita \
  -q "AITA for refusing to attend my sister's wedding?"

# Generate 5 AITA videos
bun index.js --video-type aita -c 5
```

### TIL Videos

```bash
# Random category
bun index.js --video-type til

# Specific category
bun index.js --video-type til --til-category science

# Multiple with same category
bun index.js --video-type til --til-category history --count 3

# Available categories
bun index.js --video-type til --til-category space
bun index.js --video-type til --til-category technology
bun index.js --video-type til --til-category animals
```

### Today Videos

```bash
# Today's date
bun index.js --video-type today

# Specific date
bun index.js --video-type today --date 2024-12-25

# Caps Lock Day (special formatting)
bun index.js --video-type today --date 2024-10-22

# Generate for next week
bun index.js --video-type today --date 2024-11-15
```

## AI Configuration

### Using Different AI Models

```bash
# Small, fast model
bun index.js --model llama3.2:1b

# Larger, better quality
bun index.js --model llama3:latest

# Custom model
bun index.js --model mistral:latest
```

### Custom AI Endpoint

```bash
# Local Ollama
bun index.js --api-endpoint http://localhost:11434/v1

# Remote server
bun index.js --api-endpoint http://192.168.1.100:11434/v1

# OpenAI compatible
bun index.js \
  --api-endpoint https://api.openai.com/v1 \
  --api-key sk-your-key-here \
  --model gpt-4
```

## TTS Configuration

### ElevenLabs (High Quality)

```bash
# Using ElevenLabs
bun index.js --elevenlabs-api-key "your_key_here"

# With specific video type
bun index.js \
  --video-type reddit \
  --elevenlabs-api-key "your_key_here" \
  --min-speedup 1.0
```

### Edge TTS (Default)

```bash
# Explicitly use Edge TTS
bun index.js --tts-service edge

# Faster playback
bun index.js --tts-service edge --min-speedup 2.0
```

### Google TTS (Fallback)

```bash
# Use Google TTS
bun index.js --tts-service google
```

## Video Quality Settings

### High Quality

```bash
bun index.js \
  --video-codec libx264 \
  --preset slow \
  --crf 18 \
  --framerate 60
```

### Balanced (Default)

```bash
bun index.js \
  --video-codec libx264 \
  --preset medium \
  --crf 23 \
  --framerate 30
```

### Fast Encoding

```bash
bun index.js \
  --video-codec libx264 \
  --preset ultrafast \
  --crf 28 \
  --framerate 24
```

### Hardware Acceleration (Apple Silicon)

```bash
# H.264
bun index.js --video-codec h264_videotoolbox

# HEVC (better compression)
bun index.js --video-codec hevc_videotoolbox --crf 23
```

## Video Customization

### Custom Resolution

```bash
# 4K portrait
bun index.js --width 2160 --height 3840

# Standard HD
bun index.js --width 1080 --height 1920

# Smaller for faster processing
bun index.js --width 720 --height 1280
```

### Custom Background Video

```bash
bun index.js \
  --video-url "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
```

### Add Outro Video

```bash
# Basic outro
bun index.js \
  --outro-video-path ./my-outro.mp4

# Outro with green screen removal
bun index.js \
  --outro-video-path ./my-outro.mp4 \
  --outro-chroma-color green \
  --outro-chroma-tolerance 0.2

# Outro with customization
bun index.js \
  --outro-video-path ./my-outro.mp4 \
  --outro-gap 2 \
  --outro-scale contain \
  --outro-mute true \
  --outro-speedup 1.5
```

## Content Control

### Story Length

```bash
# Shorter stories (quick content)
bun index.js \
  --min-story-length 50 \
  --max-story-length 150

# Longer stories (detailed content)
bun index.js \
  --min-story-length 200 \
  --max-story-length 350

# Very specific length
bun index.js \
  --min-story-length 100 \
  --max-story-length 100
```

### Custom Usernames

```bash
bun index.js \
  --question-username "TechGuru42" \
  --answer-username "LifeCoach99"
```

### Custom Content

```bash
# Provide your own question and answer
bun index.js \
  -q "Have you ever won the lottery?" \
  -r "Yes, I won $10 million last year and here's what happened..."
```

## Using .env Files

### Basic .env Usage

```bash
# Create .env file
cat > .env << EOF
MODEL=llama3.2:1b
VIDEO_TYPE=reddit
COUNT=3
OUTPUT=./output
EOF

# Use it
bun index.js
```

### Multiple .env Files

```bash
# Production settings
bun index.js --dotenv-path .env.production

# Testing settings
bun index.js --dotenv-path .env.test

# High quality settings
bun index.js --dotenv-path .env.hq
```

### Override .env Settings

```bash
# .env has VIDEO_TYPE=reddit, override to aita
bun index.js --video-type aita

# .env has COUNT=1, override to 5
bun index.js --count 5
```

## Bulk Generation

### Using createVideos.sh

```bash
# Generate 70 videos over 7 days
./createVideos.sh

# What it generates:
# - 21 Reddit videos (3/day × 7 days)
# - 21 TIL videos (3/day × 7 days)
# - 21 AITA videos (3/day × 7 days)
# - 7 Today videos (1/day × 7 days)
```

### Manual Bulk Generation

```bash
# 10 Reddit videos
bun index.js --video-type reddit --count 10

# 5 of each type
for type in reddit aita til today; do
  bun index.js --video-type $type --count 5
done

# Schedule content for a week
for i in {1..7}; do
  date=$(date -v+${i}d +%Y-%m-%d)  # macOS
  bun index.js --video-type today --date $date
done
```

## Advanced Workflows

### JSON Output Mode

```bash
# Get video metadata as JSON
bun index.js --json-output > video-info.json

# Use in scripts
VIDEO_PATH=$(bun index.js --json-output | jq -r '.[0].outputPath')
echo "Generated video: $VIDEO_PATH"
```

### Disable Duplicate Detection

```bash
# Allow duplicate questions
bun index.js --disable-title-history

# Useful for testing or custom content
```

### Custom Title History

```bash
# Use different history file
bun index.js --title-history-path ./custom-history.json

# Separate history per video type
bun index.js --video-type reddit --title-history-path ./reddit-history.json
bun index.js --video-type aita --title-history-path ./aita-history.json
```

## Production Workflows

### Daily Content Schedule

```bash
#!/bin/bash
# daily-generate.sh

# Morning: Reddit content
bun index.js --video-type reddit --count 3

# Midday: Educational content
bun index.js --video-type til --count 3

# Afternoon: AITA content
bun index.js --video-type aita --count 3

# Evening: Today content
date=$(date +%Y-%m-%d)
bun index.js --video-type today --date $date
```

### High-Quality Production

```bash
#!/bin/bash
# hq-generate.sh

bun index.js \
  --video-type reddit \
  --count 5 \
  --model llama3:latest \
  --elevenlabs-api-key "$ELEVENLABS_KEY" \
  --video-codec hevc_videotoolbox \
  --preset slow \
  --crf 18 \
  --width 2160 \
  --height 3840 \
  --framerate 60 \
  --min-story-length 200 \
  --max-story-length 300
```

### Fast Batch Processing

```bash
#!/bin/bash
# fast-batch.sh

bun index.js \
  --count 20 \
  --model llama3.2:1b \
  --tts-service edge \
  --video-codec libx264 \
  --preset ultrafast \
  --crf 28 \
  --min-speedup 2.0 \
  --min-story-length 100 \
  --max-story-length 150
```

## Cleanup and Maintenance

### Clean Temporary Files

```bash
# Using CLI
bun index.js --cleanup

# Using script
./cleanup.sh
```

### Full Cleanup

```bash
# Remove everything including generated videos
./deleteAll.sh

# Selective cleanup
rm -rf ./audio      # Audio files
rm -rf ./images     # Image files
rm -rf ./videos     # Background videos
```

## Testing and Development

### Test Video Generation

```bash
# Quick test with small model
bun index.js \
  --model llama3.2:1b \
  --count 1 \
  --min-story-length 50 \
  --max-story-length 100

# Test different video types
for type in reddit aita til today; do
  echo "Testing $type..."
  bun index.js --video-type $type --count 1
done
```

### Verify Setup

```bash
# Check YouTube setup
bun check-setup.js

# Test single video
bun index.js --count 1

# Test uploader (without scheduling)
bun uploader.js --run-once
```

## Troubleshooting Commands

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* bun index.js

# Check FFmpeg
ffmpeg -version

# Check AI service
curl http://localhost:11434/api/tags
```

### Recovery

```bash
# If generation fails mid-batch
# Check what was created
ls -lh output/

# Resume from where it stopped
# (adjust count based on what's already generated)
bun index.js --count 3  # If 2 out of 5 were generated
```

## See Also

- [Configuration Reference](./configuration.md) - All available options
- [Video Types](./video-types.md) - Understanding different formats
- [YouTube Uploader](./youtube-uploader.md) - Automation guide
- [Troubleshooting](./troubleshooting.md) - Common issues

