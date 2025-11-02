# YouTube Uploader Guide

Complete guide for setting up and using the automated YouTube uploader.

## Overview

The `uploader.js` script automates the entire process of generating and uploading videos to YouTube on a daily schedule.

**What it does:**
- Generates 10 videos per day (3 Reddit, 3 AITA, 3 TIL, 1 Today)
- Uploads them to YouTube automatically
- Schedules daily runs at 10:00 AM
- Manages video indexing and cleanup
- Handles errors with retry logic

## Quick Start

```bash
# 1. Setup authentication
bun uploader.js --setup-auth

# 2. Start daily automation
bun uploader.js
```

## Prerequisites

1. **Google Cloud Project** with YouTube Data API v3 enabled
2. **OAuth 2.0 Credentials** configured
3. **YouTube Channel** to upload to
4. **Working video generation** (test with `bun index.js` first)

## Initial Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Reddit Video Uploader")
4. Click "Create"

### Step 2: Enable YouTube Data API v3

1. In your project, go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have Google Workspace)
3. Fill in required fields:
   - App name: "Reddit Video Uploader"
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"
5. Skip scopes (click "Save and Continue")
6. Add test users:
   - Click "Add Users"
   - Add your Google account email
   - Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Desktop app" as application type
4. Name it (e.g., "Reddit Video Uploader Desktop")
5. Click "Create"
6. Download the credentials JSON or copy the Client ID and Client Secret

### Step 5: Configure Environment

Create `uploader.env` file:

```env
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REFRESH_TOKEN=
VIDEO_INDEX=1
```

**Note:** Leave `YOUTUBE_REFRESH_TOKEN` empty - it will be set automatically during authentication.

### Step 6: Authenticate

```bash
bun uploader.js --setup-auth
```

This will:
1. Generate an authentication URL
2. Open your browser for authorization
3. Prompt you to paste the authorization code
4. Save the refresh token to `uploader.env`

**Important:** Make sure to authorize with the Google account that owns your YouTube channel!

## Usage Modes

### Daily Automation (Default)

```bash
bun uploader.js
```

Runs continuously with daily scheduling:
- Generates and uploads at 10:00 AM
- Schedules next run automatically
- Logs all activities

**Perfect for:** Long-term automated content creation

### One-Time Run

```bash
bun uploader.js --run-once
```

Generates and uploads once, then exits:
- Generates 10 videos
- Uploads them all
- Exits when complete

**Perfect for:** Testing, manual uploads, or custom scheduling

### Upload Only

```bash
bun uploader.js --upload-only
```

Uploads existing videos from `output/` folder without generating new ones:
- Finds all MP4 files in output directory
- Uploads them sequentially
- Updates video index

**Perfect for:** Re-uploading after generation failures, or separate generation/upload workflows

### Setup Authentication

```bash
bun uploader.js --setup-auth
```

Runs the OAuth authentication flow only:
- Generates auth URL
- Saves refresh token
- Exits when complete

**Perfect for:** Initial setup or re-authentication

## Configuration

### Video Index

The `VIDEO_INDEX` in `uploader.env` automatically increments after each upload:

```env
VIDEO_INDEX=1  # First video: "DON'T CLICK THE SOUND (1)!!!!!!!!"
VIDEO_INDEX=2  # Second video: "DON'T CLICK THE SOUND (2)!!!!!!!!"
# ... continues automatically
```

### Custom Titles

To customize video titles, edit `uploader.js` line 285:

```javascript
const title = `DON'T CLICK THE SOUND (${currentIndex})!!!!!!! #redditstories #reddit #askreddit`;
```

### Custom Descriptions

Edit line 286:

```javascript
const description = 'Reddit story';
```

### Schedule Time

To change upload time, modify the cron schedule (line ~350):

```javascript
const job = Cron('0 10 * * *', async () => {  // 10:00 AM
    // ... upload workflow
});
```

**Cron format:** `minute hour day month weekday`
- `0 10 * * *` = 10:00 AM daily
- `30 14 * * *` = 2:30 PM daily
- `0 8,20 * * *` = 8:00 AM and 8:00 PM daily

## Workflow Details

### Standard Daily Workflow

1. **Clean output folder** - Remove old videos
2. **Generate Reddit videos** - 3 videos
3. **Generate TIL videos** - 3 videos
4. **Generate AITA videos** - 3 videos
5. **Generate Today video** - 1 video (current date)
6. **Upload all videos** - Sequential upload with retry
7. **Clean up** - Remove uploaded videos
8. **Schedule next run** - Set for 10:00 AM next day

### Upload Process

For each video:
1. Read video file from disk
2. Create upload request to YouTube API
3. Upload with retry logic (3 attempts)
4. Wait for processing
5. Increment video index
6. Delete local file
7. Log success/failure

### Error Handling

- **Generation errors**: Stops workflow, keeps existing videos
- **Upload errors**: Retries 3 times, then marks as failed
- **API errors**: Logs error details for debugging
- **File errors**: Skips problematic files, continues with others

## Troubleshooting

### "Access blocked: Authorization Error"

**Problem:** OAuth consent screen not configured correctly.

**Solution:**
1. Go to OAuth consent screen settings
2. Add your email as a test user
3. Make sure app is in "Testing" mode (not "Published")
4. Re-run authentication

### "Quota exceeded" Error

**Problem:** YouTube API has daily upload limits.

**Solution:**
- Default limit is 10,000 quota units per day
- Each upload uses ~1,600 units
- You can upload ~6 videos per day with default quota
- Request quota increase from Google Cloud Console

### "Invalid refresh token"

**Problem:** Refresh token expired or revoked.

**Solution:**
```bash
# Re-authenticate
bun uploader.js --setup-auth
```

### "Video generation failed"

**Problem:** AI service or FFmpeg issues.

**Solution:**
1. Test video generation: `bun index.js`
2. Check AI service is running (Ollama)
3. Verify FFmpeg installation: `ffmpeg -version`
4. Check logs for specific errors

### Uploads are slow

**Problem:** Large video files or slow connection.

**Solution:**
- Reduce video quality in configuration
- Use lower resolution (720p instead of 1080p)
- Increase CRF value for smaller files
- Check internet connection speed

### Videos stuck in "Processing"

**Problem:** YouTube's processing delay.

**Solution:**
- This is normal - can take 5-30 minutes
- Uploader waits automatically
- Videos will appear when processing completes

## Advanced Configuration

### Custom Video Generation

Modify the generation calls in `uploadWorkflow()`:

```javascript
// Custom counts
await generateVideos(5, 'reddit');  // 5 instead of 3
await generateVideos(2, 'aita');    // 2 instead of 3

// Different date
const customDate = '2024-12-25';
await generateVideos(1, 'today', customDate);

// Skip certain types
// await generateVideos(3, 'til');  // Comment out to skip
```

### Multiple Upload Schedules

Run multiple instances with different schedules:

```javascript
// Morning batch - Reddit and AITA
const morningJob = Cron('0 8 * * *', async () => {
    await generateVideos(3, 'reddit');
    await generateVideos(3, 'aita');
    // upload
});

// Evening batch - TIL and Today
const eveningJob = Cron('0 20 * * *', async () => {
    await generateVideos(3, 'til');
    await generateVideos(1, 'today');
    // upload
});
```

### Custom Upload Metadata

Add tags, category, privacy settings:

```javascript
await uploadVideo(oauth2Client, videoPath, title, description, env, {
    tags: ['reddit', 'stories', 'askreddit'],
    categoryId: '24',  // Entertainment
    privacyStatus: 'public',  // or 'unlisted', 'private'
});
```

## Best Practices

1. **Test first** - Run `--run-once` before setting up automation
2. **Monitor logs** - Check logs regularly for errors
3. **Backup config** - Keep `uploader.env` backed up
4. **Track quota** - Monitor YouTube API quota usage
5. **Verify uploads** - Check YouTube Studio after first few runs
6. **Use test account** - Test with a separate YouTube channel first
7. **Set up alerts** - Get notified of failures (via email/Discord/etc.)

## Security Notes

- **Never commit `uploader.env`** - Contains sensitive credentials
- **Keep refresh token private** - Anyone with it can upload to your channel
- **Rotate credentials periodically** - Regenerate OAuth credentials every 6-12 months
- **Use dedicated account** - Consider separate Google account for automation
- **Monitor activity** - Check YouTube Studio for unauthorized uploads

## See Also

- [Configuration Reference](./configuration.md) - Video generation settings
- [Video Types](./video-types.md) - Understanding different formats
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- [Original uploader.md](../uploader.md) - Detailed API setup guide

