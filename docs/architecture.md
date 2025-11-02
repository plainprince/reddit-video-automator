# Architecture and Codebase Overview

Technical documentation for developers working with the Reddit Video Automator codebase.

## Project Structure

```
reddit-video-automator/
├── src/
│   ├── content-generators/    # Video type-specific generators
│   │   ├── reddit.js          # Reddit Q&A videos
│   │   ├── aita.js            # AITA judgment videos
│   │   ├── til.js             # TIL fact videos
│   │   └── today.js           # Today in History videos
│   ├── utils/                 # Helper utilities
│   │   ├── helpers.js         # Common functions
│   │   └── prerequisites.js   # Dependency checks
│   ├── ai.js                  # AI content generation
│   ├── audio.js               # TTS handling
│   ├── config.js              # Configuration management
│   ├── constants.js           # Constants and enums
│   ├── image.js               # Image generation
│   └── video.js               # Video editing with FFmpeg
├── docs/                      # Documentation
├── audio/                     # Temporary audio files (gitignored)
├── images/                    # Temporary images (gitignored)
├── output/                    # Generated videos (gitignored)
├── videos/                    # Downloaded backgrounds (gitignored)
├── index.js                   # Main entry point
├── uploader.js                # YouTube automation
├── check-setup.js             # Setup verification
├── createVideos.sh            # Bulk generation script
├── cleanup.sh                 # Cleanup script
├── deleteAll.sh               # Full cleanup script
├── package.json               # Dependencies
└── README.md                  # Main documentation
```

## Core Modules

### index.js

**Purpose:** Main entry point for video generation

**Responsibilities:**
- Parse command-line arguments
- Load configuration
- Initialize AI client
- Orchestrate video generation workflow
- Handle cleanup

**Flow:**
1. Display banner
2. Initialize AI and check prerequisites
3. Loop for count of videos to generate
4. For each video:
   - Generate content (based on type)
   - Download background video
   - Edit final video
   - Cleanup temporary files
5. Output results (console or JSON)

### src/config.js

**Purpose:** Configuration management

**Exports:**
- `loadConfig()` - Load and merge configuration from .env and CLI
- `argv` - Parsed command-line arguments
- `rootDir` - Project root directory

**Configuration Priority:**
1. Command-line flags (highest)
2. .env file settings
3. Default values (lowest)

### src/ai.js

**Purpose:** AI content generation using OpenAI-compatible APIs

**Key Functions:**
- `initializeAI(config)` - Initialize OpenAI client
- `generateText(prompt, model, log, systemPrompt)` - Generate text content
- `generateUsername(model, log)` - Generate Reddit-style usernames

**Features:**
- Supports Ollama and OpenAI-compatible endpoints
- Configurable model selection
- System prompts for different content types
- Error handling and retries

### src/audio.js

**Purpose:** Text-to-speech audio generation

**Key Functions:**
- `generateSpeech(text, outputPath, config, scriptDir, log)` - Generate audio

**TTS Services:**
1. **ElevenLabs** (premium, if API key provided)
   - High quality voices
   - Natural intonation
   - Requires API key
2. **Edge TTS** (default, free)
   - Good quality
   - Multiple voices
   - No API key needed
3. **Google TTS** (fallback, free)
   - Basic quality
   - Simple voices
   - No API key needed

**Process:**
1. Try primary service (ElevenLabs if key exists, else Edge TTS)
2. On failure, try next service
3. Apply speedup factor
4. Save as WAV format

### src/image.js

**Purpose:** Generate card images for videos

**Key Functions:**
- `generateImage(text, username, pfpPath, outputPath, log, isQuestion)` - Create card
- `getUsernamePfp(providedPath, type, scriptDir, log)` - Get or generate profile pic

**Image Generation:**
- Uses Jimp for image manipulation
- Creates Reddit-style cards with:
  - Profile picture
  - Username
  - Text content
  - Proper formatting and wrapping

**Profile Pictures:**
- Generates unique colored avatars
- Uses Reddit's color palette
- Caches generated images

### src/video.js

**Purpose:** Video editing and composition with FFmpeg

**Key Functions:**
- `editVideoReddit(...)` - Create two-card Reddit/AITA videos
- `editVideoTIL(...)` - Create single-card TIL/Today videos
- `downloadVideo(url, outputPath, log)` - Download background videos

**Video Editing Process:**
1. Download background video (if needed)
2. Generate audio for cards
3. Create image overlays
4. Composite with FFmpeg:
   - Scale background video
   - Overlay card images
   - Sync with audio
   - Add transitions/pauses
   - Optionally add outro
5. Save final video

**FFmpeg Features:**
- Hardware acceleration support
- Custom codecs (h264, hevc)
- Quality control (CRF, preset)
- Chroma keying for outros

### src/constants.js

**Purpose:** Centralized constants and enums

**Exports:**
- `VIDEO_TYPES` - Enum for video types
- `TIL_CATEGORIES` - Available TIL categories
- `REDDIT_PFP_COLORS` - Reddit avatar colors
- `MODEL_QUALITY_MAP` - Model quality presets

## Content Generators

Each video type has a dedicated generator module following a common pattern.

### Common Pattern

```javascript
// Generate content and assets
export async function generate{Type}Video(config, scriptDir, runId, log) {
    // 1. Generate or use provided content
    // 2. Generate usernames
    // 3. Generate images
    // 4. Generate speech
    // 5. Return video data object
}

// Edit video
export async function edit{Type}Video(videoData, backgroundPath, outputPath, config, log) {
    // Call appropriate video editing function
}
```

### src/content-generators/reddit.js

**Reddit Q&A Videos**

**Content Generation:**
- Questions: "Have you ever..." or "If you could..." formats
- Answers: Narrative unfolding or hypothetical exploration
- Two distinct story structures based on question type

**Features:**
- Duplicate detection via title history
- Word count validation with retries
- Two-card format (question + answer)

### src/content-generators/aita.js

**AITA Judgment Videos**

**Content Generation:**
- Questions: "AITA for..." format
- Answers: Verdict (YTA/NTA/ESH/NAH) + reasoning

**Features:**
- Moral dilemma prompts
- Multi-perspective analysis
- Two-card format (question + judgment)

### src/content-generators/til.js

**TIL Educational Videos**

**Content Generation:**
- Fascinating facts from various categories
- "Today I learned that..." format
- Includes surprising elements

**Features:**
- 15+ categories
- Random or specified category
- Single-card format

### src/content-generators/today.js

**Today in History Videos**

**Content Generation:**
- Historical events on specific dates
- Three content types: events, inventions, special days
- Special Caps Lock Day handling (October 22)

**Features:**
- Date-specific content
- Ordinal date formatting
- All-caps mode for Caps Lock Day
- Single-card format

## Utilities

### src/utils/helpers.js

**Purpose:** Common helper functions

**Key Functions:**
- `setupFolders(scriptDir)` - Create necessary directories
- `createLogger(jsonMode)` - Create logging function
- `cleanupAiText(text)` - Clean AI-generated text
- `sanitizeForSpeech(text)` - Prepare text for TTS
- `logStep(step, message)` - Log generation steps
- `colors` - Terminal color utilities

### src/utils/prerequisites.js

**Purpose:** Check system dependencies

**Key Functions:**
- `checkCoquiPrerequisites(scriptDir, log)` - Verify Coqui TTS setup

## YouTube Automation

### uploader.js

**Purpose:** Automated YouTube upload scheduling

**Key Components:**

**OAuth Authentication:**
- Create OAuth2 client
- Generate auth URL
- Exchange code for tokens
- Refresh token storage

**Video Generation:**
- Call `generateVideos(count, type, date)`
- Uses main `index.js` script
- Passes `--json-output` flag

**Upload Workflow:**
- Clean output directory
- Generate videos (10 per day)
- Upload each sequentially
- Retry on failures
- Increment video index
- Clean up uploaded files

**Scheduling:**
- Uses Cron for daily runs
- Default: 10:00 AM
- Waits for next scheduled time

**Modes:**
- Default: Continuous scheduling
- `--run-once`: Single run then exit
- `--upload-only`: Upload existing videos
- `--setup-auth`: Authentication only

## Data Flow

### Video Generation Flow

```
User Input (CLI/ENV)
    ↓
Config Loading
    ↓
Content Generation
    ├→ AI: Generate text
    ├→ AI: Generate usernames
    ├→ Image: Generate cards
    └→ Audio: Generate speech
    ↓
Video Editing
    ├→ Download background
    ├→ FFmpeg composition
    └→ Add outro (optional)
    ↓
Output Video
    ↓
Cleanup Temporary Files
```

### Upload Flow

```
Scheduler/Manual Trigger
    ↓
Clean Output Directory
    ↓
Generate Videos (x10)
    ├→ 3 Reddit
    ├→ 3 AITA
    ├→ 3 TIL
    └→ 1 Today
    ↓
For Each Video:
    ├→ Read file
    ├→ Upload to YouTube
    ├→ Retry on failure
    ├→ Increment index
    └→ Delete local file
    ↓
Schedule Next Run
```

## Key Design Patterns

### Strategy Pattern

Video type generators implement a common interface:
```javascript
{ generateXVideo, editXVideo }
```

Main script selects strategy based on `VIDEO_TYPE`:
```javascript
if (config.videoType === VIDEO_TYPES.TIL) {
    videoData = await generateTILVideo(...);
}
```

### Template Method

Content generators follow template:
1. Generate/validate content
2. Generate assets (usernames, images, audio)
3. Return standardized video data object

### Retry Pattern

Used throughout for resilient operations:
- AI generation with retries
- TTS with service fallbacks
- YouTube uploads with retry logic

### Factory Pattern

Image and audio generation act as factories:
- Input: Configuration and content
- Output: File paths to generated assets

## Configuration System

### Layered Configuration

1. **Defaults** (in `src/config.js`)
2. **Environment File** (`.env`)
3. **Command-Line Flags** (highest priority)

### Configuration Object

Single source of truth passed to all modules:
```javascript
{
    model: 'llama3.2:1b',
    videoType: 'reddit',
    count: 1,
    width: 1080,
    height: 1920,
    // ... all other settings
}
```

## Error Handling

### Strategies

1. **Graceful Degradation**
   - TTS: Try ElevenLabs → Edge TTS → Google TTS

2. **Retry Logic**
   - AI generation: Retry until valid content
   - YouTube uploads: Retry 3 times

3. **Validation**
   - Word count checks
   - Duplicate detection
   - File existence checks

4. **Logging**
   - Verbose error messages
   - Step-by-step progress
   - JSON output mode for scripts

## Performance Considerations

### Optimizations

- **Caching**: Downloaded videos, profile pictures
- **Parallel Execution**: Potential for future batch processing
- **Cleanup**: Automatic removal of temporary files
- **Hardware Acceleration**: VideoToolbox support

### Bottlenecks

- **AI Generation**: Can be slow with large models
- **FFmpeg Encoding**: CPU/GPU intensive
- **TTS Generation**: API rate limits
- **YouTube Uploads**: Network dependent

## Testing

### Manual Testing

```bash
# Test single video
bun index.js --count 1

# Test each type
for type in reddit aita til today; do
    bun index.js --video-type $type --count 1
done

# Test YouTube upload
bun uploader.js --run-once
```

### Verification

```bash
# Check setup
bun check-setup.js

# Verify output
ls -lh output/

# Check video metadata
ffprobe output/final_video_*.mp4
```

## Extension Points

### Adding New Video Types

1. Create `src/content-generators/newtype.js`
2. Implement `generateNewtypeVideo()` and `editNewtypeVideo()`
3. Add to `VIDEO_TYPES` enum in `constants.js`
4. Add case in `index.js` generation logic
5. Update documentation

### Adding New TTS Services

1. Add service to `src/audio.js`
2. Implement generation function
3. Add to fallback chain
4. Add configuration options

### Custom Video Editing

Extend `src/video.js`:
- Add new overlay styles
- Custom transitions
- Additional effects
- Different layouts

## Dependencies

### Core Dependencies

- **bun**: Runtime environment
- **@ffmpeg-installer/ffmpeg**: FFmpeg binaries
- **jimp**: Image manipulation
- **@google/generative-ai**: AI generation (via OpenAI SDK)
- **googleapis**: YouTube API
- **edge-tts**: TTS service
- **gtts**: Google TTS fallback

### Development

- **dotenv**: Environment configuration
- **yargs**: CLI argument parsing
- **figlet**: ASCII banner
- **gradient-string**: Colored terminal output
- **croner**: Cron scheduling

## See Also

- [Configuration Reference](./configuration.md) - All configuration options
- [Video Types](./video-types.md) - Video type specifications
- [Usage Examples](./usage-examples.md) - Common use cases

