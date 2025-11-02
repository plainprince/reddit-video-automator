# Reddit Video Automator

Automate the creation of engaging Reddit-style videos with AI-powered content generation. Supports multiple video formats including AskReddit, AITA, TIL, and Today in History.

## Quick Start

```bash
# Clone and install
git clone https://github.com/your-username/reddit-video-automator.git
cd reddit-video-automator
bun install

# Install FFmpeg
brew install ffmpeg  # macOS
# sudo apt-get install ffmpeg  # Linux

# Generate your first video
bun index.js
```

## Features

- **AI-Powered Content**: Generate unique questions and engaging stories using OpenAI-compatible APIs
- **Multiple Video Types**: Reddit, AITA, TIL, and Today in History formats
- **Flexible TTS**: ElevenLabs, Microsoft Edge TTS, or Google TTS with automatic fallbacks
- **YouTube Automation**: Automated daily video generation and upload scheduling
- **Customizable Output**: Control resolution, framerate, quality, and more
- **Dynamic Profiles**: Auto-generated Reddit-style usernames and avatars

## Video Types

| Type | Description | Format |
|------|-------------|--------|
| **Reddit** | Classic AskReddit-style Q&A videos | Question + Answer cards |
| **AITA** | Moral dilemma scenarios with judgments | Question + Verdict cards |
| **TIL** | Educational "Today I Learned" facts | Single card |
| **Today** | Historical events on specific dates | Single card |

[Learn more about video types](./docs/video-types.md)

## Usage

### Basic Commands

```bash
# Generate a single video
bun index.js

# Generate multiple videos
bun index.js --count 5

# Generate specific video type
bun index.js --video-type aita

# Use custom configuration
bun index.js --dotenv-path .env.custom
```

### Video Examples

```bash
# Generate AITA video
bun index.js --video-type aita

# Generate TIL video with specific category
bun index.js --video-type til --til-category science

# Generate Today video for specific date
bun index.js --video-type today --date 2024-10-22

# Bulk generation (70 videos across 7 days)
./createVideos.sh
```

[View all examples and options](./docs/usage-examples.md)

## YouTube Automation

Automate daily video uploads to YouTube with the built-in uploader:

```bash
# Setup authentication
bun uploader.js --setup-auth

# Start daily automation (10 videos/day at 10:00 AM)
bun uploader.js

# One-time generation and upload
bun uploader.js --run-once
```

Daily workflow generates and uploads:
- 3 Reddit videos
- 3 AITA videos
- 3 TIL videos
- 1 Today video

[YouTube uploader setup guide](./docs/youtube-uploader.md)

## Configuration

Configure via `.env` file or command-line flags:

```env
# AI Configuration
MODEL=llama3.2:1b
API_ENDPOINT=http://localhost:11434/v1
API_KEY=ollama

# Video Configuration
VIDEO_TYPE=reddit
COUNT=1
WIDTH=1080
HEIGHT=1920

# TTS Configuration
TTS_SERVICE=edge
ELEVENLABS_API_KEY=your_key_here
```

[Complete configuration reference](./docs/configuration.md)

## Helper Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `createVideos.sh` | Bulk generate 70 videos (7 days) | `./createVideos.sh` |
| `cleanup.sh` | Remove temporary files | `./cleanup.sh` |
| `deleteAll.sh` | Remove all generated content | `./deleteAll.sh` |
| `check-setup.js` | Verify YouTube API setup | `bun check-setup.js` |

## Documentation

- [Video Types](./docs/video-types.md) - Detailed information about each video format
- [Configuration](./docs/configuration.md) - Complete list of all configuration options
- [Usage Examples](./docs/usage-examples.md) - Common use cases and examples
- [YouTube Uploader](./docs/youtube-uploader.md) - Setup and usage guide
- [Shell Scripts](./docs/shell-scripts.md) - Helper scripts documentation
- [Architecture](./docs/architecture.md) - Project structure and codebase overview

## Requirements

- **Bun**: JavaScript runtime (recommended over Node.js)
- **FFmpeg**: Video processing
- **AI Service**: Ollama or OpenAI-compatible API
- **Optional**: YouTube API credentials for automation

## Troubleshooting

Common issues and solutions:

- **FFmpeg not found**: Install FFmpeg using your package manager
- **AI generation slow**: Consider using a faster model or GPU acceleration
- **YouTube upload fails**: Check OAuth credentials and API quotas
- **TTS errors**: Verify API keys and try fallback TTS services

[Full troubleshooting guide](./docs/troubleshooting.md)

## Project Structure

```
reddit-video-automator/
├── src/
│   ├── content-generators/   # Video type generators
│   ├── utils/                 # Helper functions
│   ├── ai.js                  # AI content generation
│   ├── audio.js               # TTS handling
│   ├── image.js               # Image generation
│   └── video.js               # Video editing
├── docs/                      # Documentation
├── output/                    # Generated videos
├── index.js                   # Main entry point
└── uploader.js                # YouTube automation
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Support
- [Documentation](./docs/)
- [Issue Tracker](https://github.com/your-username/reddit-video-automator/issues)
- [Discussions](https://github.com/your-username/reddit-video-automator/discussions)
