# Configuration Reference

Complete list of all configuration options for the Reddit Video Automator.

## Overview

Configuration can be set via:
1. **Command-line flags** (highest priority)
2. **`.env` file** (via `--dotenv-path`)
3. **Default values** (lowest priority)

## Configuration Options

### AI Configuration

| Flag | Environment Variable | Description | Default |
|------|---------------------|-------------|---------|
| `--model`, `-m` | `MODEL` | AI model to use for text generation | `llama3.2:1b` |
| `--api-endpoint`, `-ae` | `API_ENDPOINT` | OpenAI-compatible API endpoint | `http://localhost:11434/v1` |
| `--api-key`, `-ak` | `API_KEY` | API key for the AI service | `ollama` |

**Example:**
```bash
bun index.js --model llama3:latest --api-endpoint http://localhost:11434/v1
```

### Content Configuration

| Flag | Environment Variable | Description | Default |
|------|---------------------|-------------|---------|
| `--video-type`, `-vt` | `VIDEO_TYPE` | Type of video to generate (reddit, til, aita, today) | `reddit` |
| `--question-text`, `-q` | `QUESTION_TEXT` | Pre-written question text | (generated) |
| `--response-text`, `-r` | `RESPONSE_TEXT` | Pre-written response text | (generated) |
| `--question-username`, `-qu` | `QUESTION_USERNAME` | Username for the question | (generated) |
| `--answer-username`, `-au` | `ANSWER_USERNAME` | Username for the answer | (generated) |
| `--min-story-length` | `MIN_STORY_LENGTH` | Minimum word count for stories | `100` |
| `--max-story-length` | `MAX_STORY_LENGTH` | Maximum word count for stories | `250` |
| `--generation-retries` | `GENERATION_RETRIES` | Max retries for content generation | `10` |
| `--til-category`, `-tc` | `TIL_CATEGORY` | Category for TIL videos | (random) |
| `--date`, `-d` | `DATE` | Date for "today" videos (YYYY-MM-DD) | (current date) |

**TIL Categories:**
- science, history, technology, nature, space
- human body, animals, geography, physics
- psychology, ancient civilizations, inventions
- medicine, ocean, climate

### TTS Configuration

| Flag | Environment Variable | Description | Default |
|------|---------------------|-------------|---------|
| `--tts-service` | `TTS_SERVICE` | TTS service to use (`edge` or `google`) | `edge` |
| `--elevenlabs-api-key`, `-ek` | `ELEVENLABS_API_KEY` | ElevenLabs API key for premium TTS | `null` |
| `--min-speedup`, `-ms` | `MIN_SPEEDUP` | Minimum audio speedup factor | `1.5` (1.0 with ElevenLabs) |

**TTS Service Priority:**
1. ElevenLabs (if API key provided) - highest quality
2. Edge TTS (default) - good quality, free
3. Google TTS (fallback) - basic quality, free

### Video Configuration

| Flag | Environment Variable | Description | Default |
|------|---------------------|-------------|---------|
| `--video-url`, `-v` | `VIDEO_URL` | YouTube URL for background video | (parkour video) |
| `--width` | `WIDTH` | Output video width | `1080` |
| `--height` | `HEIGHT` | Output video height | `1920` |
| `--framerate`, `-fr` | `FRAMERATE` | Output video framerate | `30` |
| `--padding`, `-p` | `PADDING` | Padding from screen edges | `100` |
| `--max-duration`, `-md` | `MAX_DURATION` | Maximum video duration (seconds) | `60` |
| `--break-duration`, `-bd` | `BREAK_DURATION` | Break between question/answer (seconds) | `0.5` |
| `--video-codec`, `-vc` | `VIDEO_CODEC` | FFmpeg video codec | `libx264` |
| `--crf` | `CRF` | FFmpeg CRF value (lower = higher quality) | `23` |
| `--preset` | `PRESET` | FFmpeg encoding preset | `medium` |

**Video Codecs:**
- `libx264` - Universal, good compatibility
- `h264_videotoolbox` - Hardware acceleration (macOS)
- `hevc_videotoolbox` - HEVC hardware acceleration (Apple Silicon)

**FFmpeg Presets:**
- `ultrafast` - Fastest encoding, larger file
- `medium` - Balanced (default)
- `slow` - Better compression, slower encoding

### Outro Video Configuration

| Flag | Environment Variable | Description | Default |
|------|---------------------|-------------|---------|
| `--outro-video-path`, `-ovp` | `OUTRO_VIDEO_PATH` | Path to custom outro video | `null` |
| `--outro-gap`, `-og` | `OUTRO_GAP` | Gap before outro (seconds) | `1.0` |
| `--outro-padding`, `-op` | `OUTRO_PADDING` | Outro video padding | (same as main) |
| `--outro-scale`, `-os` | `OUTRO_SCALE` | Outro scaling mode (cover, contain) | `contain` |
| `--outro-chroma-color`, `-occ` | `OUTRO_CHROMA_COLOR` | Chroma key color (e.g., green, 0x00FF00) | `null` |
| `--outro-chroma-tolerance`, `-oct` | `OUTRO_CHROMA_TOLERANCE` | Chroma key tolerance (0.01 to 1.0) | `0.1` |
| `--outro-mute`, `-om` | `OUTRO_MUTE` | Mute outro audio | `false` |
| `--outro-speedup`, `-osu` | `OUTRO_SPEEDUP` | Outro speedup factor | `1.0` |

### Output Configuration

| Flag | Environment Variable | Description | Default |
|------|---------------------|-------------|---------|
| `--output`, `-o` | `OUTPUT` | Output directory path | `./output` |
| `--count`, `-c` | `COUNT` | Number of videos to generate | `1` |
| `--json-output`, `-j` | `JSON_OUTPUT` | Output as JSON (suppress logs) | `false` |

### Image Configuration

| Flag | Environment Variable | Description | Default |
|------|---------------------|-------------|---------|
| `--question-username-image-path` | `QUESTION_USERNAME_IMAGE_PATH` | Path to question profile image | (generated) |
| `--answer-username-image-path` | `ANSWER_USERNAME_IMAGE_PATH` | Path to answer profile image | (generated) |

### History & Utilities

| Flag | Environment Variable | Description | Default |
|------|---------------------|-------------|---------|
| `--title-history-path` | `TITLE_HISTORY_PATH` | Path to title history JSON | `./generatedTitles.json` |
| `--disable-title-history` | `DISABLE_TITLE_HISTORY` | Disable duplicate detection | `false` |
| `--dotenv-path` | `DOTENV_PATH` | Path to custom .env file | `null` |
| `--cleanup` | - | Run cleanup and exit | `false` |
| `--answer-at-end` | `ANSWER_AT_END` | Move answer to end of story | `false` |
| `--help`, `-info` | - | Show help message | - |

## Example .env File

```env
# AI Configuration
MODEL=llama3.2:1b
API_ENDPOINT=http://localhost:11434/v1
API_KEY=ollama

# Content Configuration
VIDEO_TYPE=reddit
COUNT=1
MIN_STORY_LENGTH=100
MAX_STORY_LENGTH=250
GENERATION_RETRIES=10

# TTS Configuration
TTS_SERVICE=edge
ELEVENLABS_API_KEY=
MIN_SPEEDUP=1.5

# Video Configuration
VIDEO_URL=https://www.youtube.com/watch?v=your_video_id
WIDTH=1080
HEIGHT=1920
FRAMERATE=30
PADDING=100
MAX_DURATION=60
BREAK_DURATION=0.5
VIDEO_CODEC=libx264
CRF=23
PRESET=medium

# Output Configuration
OUTPUT=./output
TITLE_HISTORY_PATH=./generatedTitles.json
DISABLE_TITLE_HISTORY=false

# Outro Configuration (optional)
OUTRO_VIDEO_PATH=
OUTRO_GAP=1.0
OUTRO_SCALE=contain
OUTRO_MUTE=false
```

## Usage Examples

### Using .env File

```bash
# Create .env file with your settings
cp .env.example .env
# Edit .env with your preferred settings

# Run with .env
bun index.js

# Run with custom .env
bun index.js --dotenv-path .env.production
```

### Command-Line Overrides

Command-line flags always override .env settings:

```bash
# Override model from .env
bun index.js --model llama3:latest

# Override multiple settings
bun index.js --video-type aita --count 5 --output ./custom-output
```

### Hardware Acceleration (Apple Silicon)

```bash
# Use VideoToolbox for faster encoding
bun index.js --video-codec hevc_videotoolbox

# Or in .env:
VIDEO_CODEC=hevc_videotoolbox
```

### High-Quality TTS

```bash
# Use ElevenLabs
bun index.js --elevenlabs-api-key "your_key_here"

# Or in .env:
ELEVENLABS_API_KEY=your_key_here
TTS_SERVICE=edge
```

## Best Practices

1. **Use .env for persistent settings** - Store common configurations
2. **Use CLI flags for one-off changes** - Quick overrides without editing files
3. **Version control .env.example** - Template without secrets
4. **Never commit API keys** - Add .env to .gitignore
5. **Test configurations** - Generate one video before bulk operations

## Performance Tuning

### Fast Generation (Lower Quality)
```env
VIDEO_CODEC=libx264
PRESET=ultrafast
CRF=28
MIN_SPEEDUP=2.0
```

### High Quality (Slower)
```env
VIDEO_CODEC=hevc_videotoolbox
PRESET=slow
CRF=18
ELEVENLABS_API_KEY=your_key
MIN_SPEEDUP=1.0
```

### Balanced (Recommended)
```env
VIDEO_CODEC=libx264
PRESET=medium
CRF=23
TTS_SERVICE=edge
MIN_SPEEDUP=1.5
```

