# Documentation Index

Complete documentation for the Reddit Video Automator.

## Getting Started

New to the project? Start here:

1. [Main README](../README.md) - Quick start and overview
2. [Usage Examples](./usage-examples.md) - Common commands and workflows
3. [Configuration](./configuration.md) - Setting up your environment

## Core Documentation

### [Video Types](./video-types.md)
Detailed information about each video format:
- Reddit - Classic Q&A storytelling
- AITA - Moral dilemma judgments
- TIL - Educational facts
- Today - Historical events

**When to read:** Before generating your first videos, to understand format options.

### [Configuration Reference](./configuration.md)
Complete list of all configuration options:
- AI configuration
- TTS settings
- Video quality options
- Content parameters
- All command-line flags and environment variables

**When to read:** When you want to customize video generation settings.

### [Usage Examples](./usage-examples.md)
Practical examples and common use cases:
- Basic commands
- Video type examples
- Quality settings
- Bulk generation
- Production workflows

**When to read:** When you want to see how to accomplish specific tasks.

## Automation

### [YouTube Uploader](./youtube-uploader.md)
Complete guide for automated YouTube uploads:
- Google Cloud setup
- OAuth authentication
- Daily scheduling
- Upload modes
- Troubleshooting

**When to read:** When setting up automated content delivery.

### [Shell Scripts](./shell-scripts.md)
Documentation for helper scripts:
- `createVideos.sh` - Bulk generation
- `cleanup.sh` - Temporary file removal
- `deleteAll.sh` - Complete cleanup

**When to read:** When you want to automate bulk operations.

## Technical Documentation

### [Architecture](./architecture.md)
Codebase overview for developers:
- Project structure
- Core modules
- Data flow
- Design patterns
- Extension points

**When to read:** When you want to understand or modify the codebase.

### [Troubleshooting](./troubleshooting.md)
Solutions to common issues:
- Installation problems
- AI generation errors
- TTS issues
- Video encoding problems
- YouTube upload errors
- Performance issues

**When to read:** When you encounter errors or unexpected behavior.

## Quick Reference

### Common Commands

```bash
# Generate single video
bun index.js

# Generate specific type
bun index.js --video-type aita

# Bulk generation
./createVideos.sh

# YouTube automation
bun uploader.js --setup-auth
bun uploader.js
```

### Configuration Files

- `.env` - Main configuration
- `uploader.env` - YouTube credentials
- `generatedTitles.json` - Title history

### Important Directories

- `output/` - Generated videos
- `docs/` - Documentation (you are here)
- `src/` - Source code
- `audio/` - Temporary audio files
- `images/` - Temporary image files

## Documentation by Task

### First Time Setup
1. [Main README](../README.md) - Installation
2. [Configuration](./configuration.md) - Setup .env
3. [Usage Examples](./usage-examples.md) - First video

### Daily Content Creation
1. [Video Types](./video-types.md) - Choose format
2. [Usage Examples](./usage-examples.md) - Generate commands
3. [Shell Scripts](./shell-scripts.md) - Bulk generation

### YouTube Automation
1. [YouTube Uploader](./youtube-uploader.md) - Complete setup
2. [Troubleshooting](./troubleshooting.md) - OAuth issues

### Customization
1. [Configuration](./configuration.md) - All options
2. [Architecture](./architecture.md) - Code structure
3. [Usage Examples](./usage-examples.md) - Advanced workflows

### Problem Solving
1. [Troubleshooting](./troubleshooting.md) - Common issues
2. [Configuration](./configuration.md) - Verify settings
3. [Architecture](./architecture.md) - Technical details

## External Resources

### Related Files
- [uploader.md](../uploader.md) - Detailed YouTube API setup guide
- [README.backup.md](../README.backup.md) - Original README backup

### Dependencies
- [Bun](https://bun.sh/) - JavaScript runtime
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [Ollama](https://ollama.ai/) - Local AI models
- [YouTube Data API](https://developers.google.com/youtube/v3) - Upload automation

## Contributing to Documentation

When updating documentation:
1. Keep examples practical and tested
2. Include both success and error cases
3. Link to related documentation
4. Update this index when adding new docs
5. No emojis in documentation files
6. Use clear, concise language

## Documentation Structure

```
docs/
├── README.md              # This file - documentation index
├── video-types.md         # Video format specifications
├── configuration.md       # Complete config reference
├── usage-examples.md      # Practical examples
├── youtube-uploader.md    # YouTube automation guide
├── shell-scripts.md       # Script documentation
├── architecture.md        # Technical overview
└── troubleshooting.md     # Problem solving
```

## Version Information

This documentation is current as of the latest version of the Reddit Video Automator.

**Supported video types:** Reddit, AITA, TIL, Today

**Supported platforms:** macOS, Linux, Windows (with WSL)

**Supported AI services:** Ollama, OpenAI-compatible APIs

**Supported TTS:** ElevenLabs, Edge TTS, Google TTS

## Getting Help

1. Check [Troubleshooting](./troubleshooting.md) for your specific issue
2. Search [GitHub Issues](https://github.com/your-username/reddit-video-automator/issues)
3. Review configuration in [Configuration Reference](./configuration.md)
4. Ask in [GitHub Discussions](https://github.com/your-username/reddit-video-automator/discussions)

## Feedback

Found an issue with the documentation?
- [Open an issue](https://github.com/your-username/reddit-video-automator/issues/new)
- Submit a pull request with improvements
- Suggest additions in discussions

---

Return to [Main README](../README.md)

