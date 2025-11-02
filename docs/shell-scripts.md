# Shell Scripts Documentation

Helper scripts to automate common tasks and bulk operations.

## Overview

The repository includes several bash scripts to simplify video generation and cleanup operations:

| Script | Purpose | Videos Generated |
|--------|---------|------------------|
| `createVideos.sh` | Bulk generation over 7 days | 70 videos |
| `cleanup.sh` | Remove temporary files | N/A |
| `deleteAll.sh` | Remove all generated content | N/A |

## createVideos.sh

Automated bulk video generation script for creating a week's worth of content.

### What It Does

Generates 70 videos across 7 days:
- **21 Reddit videos** (3 per day)
- **21 TIL videos** (3 per day)
- **21 AITA videos** (3 per day)
- **7 Today videos** (1 per day, with incremental dates)

### How It Works

1. **Backs up `.env`** - Creates `.env.backup` before starting
2. **Loops through 7 days** - Generates content for each day
3. **Modifies `.env`** - Temporarily sets `VIDEO_TYPE`, `COUNT`, and `DATE`
4. **Generates videos** - Calls `bun index.js` for each batch
5. **Tracks progress** - Shows running count (e.g., "35/70 complete")
6. **Restores `.env`** - Returns original configuration when done

### Usage

```bash
./createVideos.sh
```

### Prerequisites

- `.env` file must exist with base configuration
- All dependencies installed (`bun install`)
- FFmpeg installed
- AI service running (Ollama)

### Output

Videos are saved to `./output/` with timestamped filenames:
```
output/
├── final_video_1730123456789.mp4
├── final_video_1730123567890.mp4
└── ...
```

### Progress Example

```
========================================
Day 1 of 7
========================================

[Reddit] Generating 3 Reddit videos for Day 1...
[OK] Reddit videos complete! (3/70 total)

[TIL] Generating 3 TIL videos for Day 1...
[OK] TIL videos complete! (6/70 total)

[AITA] Generating 3 AITA videos for Day 1...
[OK] AITA videos complete! (9/70 total)

[Today] Generating 1 'Today' video for Day 1 (date: 2024-11-03)...
[OK] Today video complete! (10/70 total)

[OK] Day 1 complete! Progress: 10/70 videos
```

### Configuration

The script modifies these `.env` variables temporarily:
- `VIDEO_TYPE` - Set to reddit, til, aita, or today
- `COUNT` - Set to 3 or 1 depending on type
- `DATE` - Set to future dates for "today" videos

All other `.env` settings remain unchanged and are used for generation.

### Date Calculation

"Today" videos are generated with incremental dates:
- Day 1: tomorrow (+1 day)
- Day 2: day after tomorrow (+2 days)
- Day 7: one week from today (+7 days)

**macOS:**
```bash
target_date=$(date -v+${day}d '+%Y-%m-%d')
```

**Linux:**
```bash
target_date=$(date -d "+${day} days" '+%Y-%m-%d')
```

### Error Handling

If a generation fails:
- Error is logged
- Script continues with next batch
- Progress counter shows actual completed videos
- Original `.env` is still restored at the end

### Stopping the Script

To stop during execution:
- Press `Ctrl+C`
- Script may exit without restoring `.env`
- Manually restore: `mv .env.backup .env`

### Customization

Edit the script to change:

**Number of days:**
```bash
for day in {1..14}; do  # Generate for 14 days instead of 7
```

**Videos per type:**
```bash
sed -i.tmp 's/^COUNT=.*/COUNT=5/' .env  # 5 videos instead of 3
```

**Different video types:**
```bash
# Comment out AITA generation
# sed -i.tmp 's/^VIDEO_TYPE=.*/VIDEO_TYPE=aita/' .env
# bun index.js --dotenv-path .env
```

## cleanup.sh

Simple script to remove temporary files created during video generation.

### What It Does

Removes:
- `./audio/` - Temporary TTS audio files
- `./images/` - Generated card images

Does NOT remove:
- `./output/` - Final generated videos
- `./videos/` - Downloaded background videos

### Usage

```bash
./cleanup.sh
```

Or use the built-in flag:
```bash
bun index.js --cleanup
```

### When to Use

- After bulk generation to free disk space
- Before committing code (temporary files shouldn't be versioned)
- When troubleshooting generation issues
- As part of automated workflows

### What Gets Removed

```bash
# Audio files (WAV format)
audio/question_1730123456789.wav
audio/answer_1730123456789.wav
audio/til_1730123456789.wav

# Image files (PNG format)
images/question_1730123456789.png
images/answer_1730123456789.png
images/til_1730123456789.png
```

### Safety

- Only removes known temporary directories
- Does not use wildcards that could affect other files
- Safe to run multiple times

## deleteAll.sh

Comprehensive cleanup script for complete reset of generated content.

### What It Does

Removes ALL generated and downloaded content:
- `./videos/` - Downloaded background videos
- `./temp/` - Temporary processing files
- `./outro-videos/` - Downloaded outro videos
- `./output/` - **ALL generated videos**
- `./images/` - Generated card images
- `./audio/` - Generated audio files
- `./gui/public/output/` - GUI output files (if exists)

### Usage

```bash
./deleteAll.sh
```

### WARNING

This script **deletes ALL your generated videos**. Use with extreme caution!

- Cannot be undone
- Removes finished videos from `./output/`
- Removes downloaded content that may need re-downloading
- Should only be used when you want a complete fresh start

### When to Use

- Starting a completely new project
- Cleaning up after testing
- Freeing maximum disk space
- Resetting to initial state

### What's Preserved

- Source code
- Configuration files (`.env`)
- Title history (`generatedTitles.json`)
- Dependencies (`node_modules/`)

### Recovery

After running, you'll need to:
1. Re-download background videos (automatically on next generation)
2. Re-generate all videos
3. Any manual edits or custom outros will be lost

### Alternative

For safer cleanup:
```bash
# Keep output videos, remove only temporary files
./cleanup.sh

# Remove only old videos (keep recent)
find output/ -mtime +7 -delete  # Remove videos older than 7 days
```

## Best Practices

### For Development

```bash
# During development, clean up frequently
bun index.js --count 1
./cleanup.sh
```

### For Production

```bash
# Generate content
./createVideos.sh

# Upload to YouTube
bun uploader.js --run-once

# After successful upload, clean everything
./deleteAll.sh
```

### For Storage Management

```bash
# Keep cleanup automatic
bun index.js && ./cleanup.sh

# Or schedule periodic cleanup
0 2 * * * cd /path/to/project && ./cleanup.sh  # Daily at 2 AM
```

### For Scheduled Content

```bash
# Generate in batches, cleanup between
./createVideos.sh
mv output/*.mp4 /backup/week1/
./cleanup.sh

# Repeat for more weeks
./createVideos.sh
mv output/*.mp4 /backup/week2/
./cleanup.sh
```

## Script Automation

### Cron Jobs

```bash
# Daily generation and cleanup
0 1 * * * cd /path/to/project && ./createVideos.sh && ./cleanup.sh

# Weekly full cleanup
0 3 * * 0 cd /path/to/project && ./deleteAll.sh
```

### Combined Workflow

```bash
#!/bin/bash
# weekly-workflow.sh

# Generate week's content
./createVideos.sh

# Upload to YouTube
bun uploader.js --run-once

# Cleanup temporary files
./cleanup.sh

# Optional: Remove output after upload
# rm -rf output/*.mp4
```

## Troubleshooting

### "Permission denied"

Make scripts executable:
```bash
chmod +x createVideos.sh cleanup.sh deleteAll.sh
```

### ".env.backup not restored"

Manually restore:
```bash
mv .env.backup .env
```

### "Script hangs"

- Check if video generation is stuck
- Look for AI service errors
- Verify FFmpeg is working
- Check disk space

### "Videos not all generated"

- Check logs for specific errors
- Verify count in progress messages
- Look in `output/` for actual files
- Retry failed batches manually

## See Also

- [Configuration Reference](./configuration.md) - Settings used by scripts
- [Usage Examples](./usage-examples.md) - Manual generation commands
- [YouTube Uploader](./youtube-uploader.md) - Automated upload workflow

