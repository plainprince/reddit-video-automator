# Troubleshooting Guide

Solutions to common issues and errors.

## Installation Issues

### FFmpeg Not Found

**Symptom:**
```
Error: FFmpeg not found
```

**Solution:**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# Windows (Chocolatey)
choco install ffmpeg

# Verify installation
ffmpeg -version
```

### Bun Installation Failed

**Symptom:**
```
command not found: bun
```

**Solution:**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Restart terminal, then verify
bun --version

# Install project dependencies
bun install
```

### Dependency Installation Errors

**Symptom:**
```
error: package not found
```

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install

# If still failing, try with npm
npm install
```

## AI Generation Issues

### AI Service Not Running

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Solution:**
```bash
# Start Ollama
ollama serve

# In another terminal, test
curl http://localhost:11434/api/tags

# Pull required model
ollama pull llama3.2:1b
```

### Model Not Found

**Symptom:**
```
Error: model 'llama3:latest' not found
```

**Solution:**
```bash
# List available models
ollama list

# Pull the required model
ollama pull llama3:latest

# Or use a different model
bun index.js --model llama3.2:1b
```

### Generation Taking Too Long

**Symptom:**
Video generation hangs at "Generating Question" or "Generating Story"

**Solution:**
```bash
# Use a smaller/faster model
bun index.js --model llama3.2:1b

# Reduce story length
bun index.js --min-story-length 50 --max-story-length 100

# Check AI service logs
ollama logs

# Restart AI service
killall ollama
ollama serve
```

### Content Doesn't Meet Requirements

**Symptom:**
```
Story does not meet length requirements (100-250 words). Retrying...
Failed to generate story after 10 attempts
```

**Solution:**
```bash
# Adjust length requirements
bun index.js --min-story-length 80 --max-story-length 300

# Increase retries
bun index.js --generation-retries 20

# Use better model
bun index.js --model llama3:latest

# Check if AI service is overloaded
htop  # or top on macOS
```

## TTS Issues

### ElevenLabs API Errors

**Symptom:**
```
ElevenLabs API error: 401 Unauthorized
```

**Solution:**
```bash
# Verify API key
echo $ELEVENLABS_API_KEY

# Set in .env
ELEVENLABS_API_KEY=your_actual_key_here

# Test without ElevenLabs
bun index.js --tts-service edge
```

### Edge TTS Not Working

**Symptom:**
```
Edge TTS error: command not found
```

**Solution:**
```bash
# Install edge-tts globally
pip install edge-tts

# Or use bun's included version (should work automatically)
bun index.js --tts-service edge

# Fallback to Google TTS
bun index.js --tts-service google
```

### TTS Audio Files Empty

**Symptom:**
Generated audio files are 0 bytes or very small

**Solution:**
```bash
# Check TTS service
edge-tts --list-voices

# Verify text isn't empty
cat your-script.txt

# Try different TTS service
bun index.js --tts-service google

# Check for special characters
# (some characters may break TTS)
```

## Video Generation Issues

### FFmpeg Encoding Errors

**Symptom:**
```
Error: FFmpeg exited with code 1
```

**Solution:**
```bash
# Test FFmpeg directly
ffmpeg -version

# Use different codec
bun index.js --video-codec libx264

# Lower quality for faster testing
bun index.js --preset ultrafast --crf 28

# Check disk space
df -h
```

### Background Video Download Fails

**Symptom:**
```
Error downloading video: 403 Forbidden
```

**Solution:**
```bash
# Use different background video
bun index.js --video-url "https://www.youtube.com/watch?v=DIFFERENT_ID"

# Check if video exists and is public
# Visit the URL in browser

# Try with yt-dlp directly
yt-dlp "https://www.youtube.com/watch?v=VIDEO_ID"

# If yt-dlp not installed
pip install yt-dlp
```

### Video Output Is Corrupted

**Symptom:**
Video plays but shows glitches or artifacts

**Solution:**
```bash
# Use different codec
bun index.js --video-codec libx264 --preset slow

# Increase quality
bun index.js --crf 18

# Disable hardware acceleration
bun index.js --video-codec libx264

# Check input files
ffprobe audio/question_*.wav
ffprobe images/question_*.png
```

### Out of Disk Space

**Symptom:**
```
ENOSPC: no space left on device
```

**Solution:**
```bash
# Check disk usage
df -h

# Clean temporary files
./cleanup.sh

# Remove old videos
rm output/*.mp4

# Remove downloaded backgrounds
rm -rf videos/

# Full cleanup (WARNING: removes all generated content)
./deleteAll.sh
```

## YouTube Uploader Issues

### OAuth "Access Blocked" Error

**Symptom:**
```
Access blocked: Authorization Error
This app is blocked. This app tried to access sensitive info...
```

**Solution:**
1. Go to Google Cloud Console
2. Navigate to OAuth consent screen
3. Add your email as a test user
4. Ensure app is in "Testing" mode (not "Published")
5. Re-run authentication:
```bash
bun uploader.js --setup-auth
```

See [uploader.md](../uploader.md) for detailed OAuth setup.

### Invalid Refresh Token

**Symptom:**
```
Error: invalid_grant - Token has been expired or revoked
```

**Solution:**
```bash
# Re-authenticate
bun uploader.js --setup-auth

# Check uploader.env has correct credentials
cat uploader.env

# Verify credentials in Google Cloud Console
```

### Quota Exceeded

**Symptom:**
```
Error: quotaExceeded
YouTube Data API quota has been exceeded
```

**Solution:**
- Default quota: 10,000 units/day
- Each upload: ~1,600 units
- You can upload ~6 videos/day

**Options:**
1. Wait until quota resets (midnight Pacific Time)
2. Request quota increase from Google Cloud Console
3. Spread uploads across multiple days
4. Use `--upload-only` mode to retry

### Upload Hangs

**Symptom:**
Upload starts but never completes

**Solution:**
```bash
# Check internet connection
ping google.com

# Check video file size
ls -lh output/

# Try uploading single video
bun uploader.js --upload-only

# Check for API errors in console
# Restart uploader with fresh connection
```

### Wrong YouTube Channel

**Symptom:**
Videos uploaded to wrong channel

**Solution:**
```bash
# Make sure you authenticated with correct account
# Re-authenticate with proper account
bun uploader.js --setup-auth

# When browser opens, use correct Google account
# Check YouTube Studio to verify channel
```

## Configuration Issues

### .env File Not Loaded

**Symptom:**
Settings from .env file are ignored

**Solution:**
```bash
# Verify .env exists
ls -la .env

# Check file format (no spaces around =)
cat .env

# Correct format:
MODEL=llama3.2:1b

# Incorrect format:
MODEL = llama3.2:1b  # has spaces

# Use --dotenv-path explicitly
bun index.js --dotenv-path ./.env
```

### Command-Line Flags Not Working

**Symptom:**
Flags don't override .env settings

**Solution:**
```bash
# Use correct flag syntax
bun index.js --count 5  # Correct
bun index.js -count 5   # Wrong (single dash)

# Check flag names
bun index.js --help

# Make sure flags come after index.js
bun index.js --count 5  # Correct
bun --count 5 index.js  # Wrong (flag before file)
```

### Invalid Configuration Values

**Symptom:**
```
Error: Invalid value for COUNT
```

**Solution:**
```bash
# Check value types
COUNT=5           # Correct (number)
COUNT="5"         # May cause issues (string)

# Boolean values
DISABLE_TITLE_HISTORY=true   # Correct
DISABLE_TITLE_HISTORY=True   # May not work

# Date format
DATE=2024-11-03   # Correct (YYYY-MM-DD)
DATE=11/03/2024   # Wrong
```

## Performance Issues

### Generation Is Very Slow

**Symptom:**
Each video takes 10+ minutes to generate

**Solutions:**

**1. Use Faster AI Model:**
```bash
bun index.js --model llama3.2:1b
```

**2. Reduce Content Length:**
```bash
bun index.js --min-story-length 80 --max-story-length 150
```

**3. Use Hardware Acceleration:**
```bash
# macOS/Apple Silicon
bun index.js --video-codec hevc_videotoolbox

# Linux with NVIDIA GPU
bun index.js --video-codec h264_nvenc
```

**4. Faster Encoding Preset:**
```bash
bun index.js --preset ultrafast
```

**5. Increase Audio Speedup:**
```bash
bun index.js --min-speedup 2.0
```

### High Memory Usage

**Symptom:**
System becomes slow, high RAM usage

**Solution:**
```bash
# Generate videos in smaller batches
bun index.js --count 1
# Then run again for more

# Lower video resolution
bun index.js --width 720 --height 1280

# Close other applications
# Monitor memory:
htop  # Linux
top   # macOS

# Restart AI service if it's using too much memory
killall ollama
ollama serve
```

### High CPU Usage

**Symptom:**
CPU at 100%, fans running loud

**Solution:**
```bash
# Use hardware acceleration
bun index.js --video-codec hevc_videotoolbox  # macOS

# Lower framerate
bun index.js --framerate 24

# Use faster preset (trades quality for speed)
bun index.js --preset ultrafast

# Generate during off-hours
./createVideos.sh  # Run overnight
```

## File and Permission Issues

### Permission Denied

**Symptom:**
```
EACCES: permission denied
```

**Solution:**
```bash
# Fix script permissions
chmod +x createVideos.sh cleanup.sh deleteAll.sh

# Fix directory permissions
chmod -R 755 output/ audio/ images/

# Check ownership
ls -la

# Fix ownership if needed (replace username)
sudo chown -R username:username .
```

### Cannot Write to Output Directory

**Symptom:**
```
EACCES: permission denied, open './output/final_video_*.mp4'
```

**Solution:**
```bash
# Create output directory
mkdir -p output

# Fix permissions
chmod 755 output/

# Use different output path
bun index.js --output ./my-videos
```

### File Already Exists

**Symptom:**
```
Error: EEXIST: file already exists
```

**Solution:**
```bash
# Clean output directory
rm output/*.mp4

# Or use cleanup script
./cleanup.sh

# Or use timestamp-based naming (already default)
# Each file gets unique timestamp
```

## Runtime Errors

### Unhandled Promise Rejection

**Symptom:**
```
UnhandledPromiseRejectionWarning
```

**Solution:**
```bash
# Check logs for actual error
# Often caused by network issues or API errors

# Try with verbose logging
DEBUG=* bun index.js

# Run with --json-output to see structured errors
bun index.js --json-output
```

### Module Not Found

**Symptom:**
```
Error: Cannot find module 'xyz'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules bun.lock
bun install

# If specific module missing
bun add xyz

# Check package.json for required dependencies
```

### Segmentation Fault

**Symptom:**
```
Segmentation fault (core dumped)
```

**Solution:**
```bash
# Usually FFmpeg related
# Update FFmpeg
brew upgrade ffmpeg  # macOS
sudo apt-get update && sudo apt-get upgrade ffmpeg  # Linux

# Try without hardware acceleration
bun index.js --video-codec libx264

# Update Bun
bun upgrade

# Check system logs
dmesg | tail  # Linux
console.app   # macOS
```

## Getting Help

### Collect Debug Information

```bash
# System information
uname -a
bun --version
ffmpeg -version
ollama --version

# Test basic generation
bun index.js --count 1 --video-type reddit

# Check logs
cat output-log.txt

# List files
ls -la output/ audio/ images/
```

### Report Issues

When reporting issues, include:
1. Operating system and version
2. Bun version
3. FFmpeg version
4. Complete error message
5. Configuration used (sanitize API keys!)
6. Steps to reproduce

### Additional Resources

- [Configuration Reference](./configuration.md)
- [Usage Examples](./usage-examples.md)
- [YouTube Uploader](./youtube-uploader.md)
- [Architecture](./architecture.md)
- [Original uploader.md](../uploader.md) for detailed OAuth setup

