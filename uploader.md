# YouTube Uploader Setup Guide

This guide will walk you through setting up YouTube API access for the automatic video uploader.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Quick Checklist

Before you start troubleshooting, make sure you've completed ALL of these steps:

- [ ] Created a Google Cloud Project
- [ ] Enabled YouTube Data API v3
- [ ] Configured OAuth Consent Screen with:
  - [ ] App name and support email filled in
  - [ ] Scope `https://www.googleapis.com/auth/youtube.upload` added
  - [ ] Your email added as a test user
  - [ ] Clicked "Save and Continue" on all pages
- [ ] Created OAuth 2.0 Desktop credentials
- [ ] Added Client ID and Secret to `uploader.env`
- [ ] Waited 5-10 minutes after adding yourself as test user
- [ ] Used the SAME email for authentication that you added as test user
- [ ] Tried using incognito/private browser mode

If you've completed all these steps and still get "Access blocked" errors, see the troubleshooting section at the bottom.

---

## Common Issue: "Zugriff blockiert" (Access blocked)

**Most Common Causes:**
1. You didn't add yourself as a test user in the OAuth consent screen
2. You're using a different Google account than the one you added as test user
3. Changes haven't propagated yet (wait 5-10 minutes)
4. The OAuth consent screen isn't fully configured

**Quick Fix:**
1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Click "Edit App"
3. Go to "Test users" section
4. Verify your email (kummer.simeon@gmail.com) is listed
5. If not, add it and wait 10 minutes
6. Try again in incognito/private browser mode

---

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "Reddit Video Uploader")
5. Click "Create"

## Step 2: Enable YouTube Data API v3

1. In your project, go to the [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for "YouTube Data API v3"
3. Click on "YouTube Data API v3" in the results
4. Click the "Enable" button

Direct link: [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)

## Step 3: Configure OAuth Consent Screen

1. Go to [APIs & Services > OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Select "External" as the user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the **App information** section:
   - **App name**: Reddit Video Uploader (or any name you prefer)
   - **User support email**: Select your email address from the dropdown
5. Fill in the **Developer contact information** section at the bottom:
   - **Email addresses**: Enter your email address (e.g., kummer.simeon@gmail.com)
6. Click "Save and Continue"

7. On the **Scopes** page:
   - Click "Add or Remove Scopes"
   - In the filter box at the top, type: `youtube.upload`
   - Find and check the box for: `https://www.googleapis.com/auth/youtube.upload`
   - It should show: "Upload YouTube videos and manage your YouTube videos"
   - Click "Update" at the bottom
   - Click "Save and Continue"

8. On the **Test users** page:
   - Click "Add Users"
   - Enter your Google/YouTube account email address (e.g., kummer.simeon@gmail.com)
   - **IMPORTANT**: Use the EXACT email address you'll authenticate with
   - Click "Add"
   - Click "Save and Continue"

9. Review the summary and click "Back to Dashboard"

**Important Notes:**
- Your app will be in "Testing" mode, which means only test users you've added can use it
- The testing mode has a limit of 100 test users
- You must use the exact email you added as a test user when authenticating
- For personal use, testing mode is perfectly fine and you don't need to publish the app

## Step 4: Create OAuth 2.0 Credentials

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" at the top
3. Select "OAuth client ID"
4. For "Application type", select "Desktop app"
5. Enter a name (e.g., "Desktop Client")
6. Click "Create"
7. A dialog will appear with your Client ID and Client Secret
8. Copy both values - you'll need them in the next step

Direct link: [Create Credentials](https://console.cloud.google.com/apis/credentials/oauthclient)

## Step 5: Configure uploader.env

1. In your project directory, create a file named `uploader.env`
2. Add the following content, replacing the placeholders with your actual credentials:

```env
YOUTUBE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret_here
VIDEO_INDEX=1
```

**Note**: `VIDEO_INDEX` starts at 1 and will automatically increment with each successful upload.

## Step 6: Verify Your Setup

Before authenticating, verify your configuration is correct:

```bash
bun check-setup.js
```

This will check that:
- `uploader.env` exists and has valid credentials
- Required packages are installed
- Directories are set up correctly

Fix any errors it reports before continuing.

## Step 7: Authenticate the Application

Run the setup command to authenticate:

```bash
bun uploader.js --setup-auth
```

This will:
1. Display an authorization URL
2. Open your browser and visit that URL
3. Sign in with the Google account you added as a test user
4. Grant the requested permissions
5. Copy the authorization code that appears
6. Paste it back into the terminal and press Enter

The script will automatically save your refresh token to `uploader.env`.

## Step 8: Test the Uploader

### Upload Existing Videos (Manual Test)

If you have videos in the `output/` folder:

```bash
bun uploader.js --upload-only
```

### Generate and Upload Once (Full Test)

To test the complete workflow (generate + upload) without scheduling:

```bash
bun uploader.js --run-once
```

This will:
1. Clean the output folder
2. Generate 3 Reddit videos
3. Generate 3 TIL videos
4. Generate 1 Today video
5. Upload all 7 videos to YouTube

### Start Daily Automation

To run the uploader as a continuous background service that uploads daily at 10:00 AM:

```bash
bun uploader.js
```

The script will run in the background and automatically generate and upload videos every day at 10:00 AM in your local timezone.

To run it in the background persistently:

```bash
nohup bun uploader.js > uploader.log 2>&1 &
```

Or use a process manager like `pm2`:

```bash
# Install pm2 globally
bun install -g pm2

# Start the uploader
pm2 start uploader.js --interpreter bun --name youtube-uploader

# Save the process list
pm2 save

# Setup pm2 to start on system boot
pm2 startup
```

## Troubleshooting

### "Zugriff blockiert" / "Access blocked: This app's request is invalid" (Error 403)

This is the most common error and happens when the OAuth consent screen isn't properly configured. Here's how to fix it:

**Solution 1: Verify Test User Email**
1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Click "Edit App" 
3. Navigate through to the "Test users" section
4. Verify your email (kummer.simeon@gmail.com) is listed
5. If not, add it and click "Save and Continue"
6. **Important**: Wait 5-10 minutes after adding yourself as a test user
7. Try authenticating again

**Solution 2: Re-configure OAuth Consent Screen**
1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Click "Edit App"
3. Go through each step and verify:
   - **App information**: App name and support email are filled
   - **Scopes**: `https://www.googleapis.com/auth/youtube.upload` is added
   - **Test users**: Your email is added
4. Click "Save and Continue" on each page
5. Wait 5-10 minutes for changes to propagate
6. Try authenticating again

**Solution 3: Use Incognito/Private Browser**
1. Copy the authorization URL from the terminal
2. Open an incognito/private browser window
3. Paste the URL
4. Sign in with the EXACT email you added as a test user
5. Complete the authorization
6. Copy the code back to the terminal

**Solution 4: Check Publishing Status**
1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Verify the "Publishing status" shows "Testing"
3. If it says "Not configured", you need to complete the consent screen setup
4. If it says "In production" but you're getting errors, switch back to "Testing"

**Solution 5: Delete and Recreate**
If nothing else works:
1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Delete the current consent screen configuration
3. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
4. Delete the OAuth 2.0 Client ID
5. Follow Steps 3 and 4 again from the beginning
6. Make sure to add yourself as a test user BEFORE trying to authenticate

### "Invalid grant" or "Token has been expired or revoked"

Your refresh token may have expired. Run the setup again:

```bash
bun uploader.js --setup-auth
```

### "The user has not granted the app... the Upload permission"

Make sure you:
1. Added the correct YouTube upload scope in the OAuth consent screen
2. Added your Google account as a test user
3. Used the correct Google account when authorizing
4. The scope is: `https://www.googleapis.com/auth/youtube.upload` (not just youtube)

### Videos Not Uploading

Check the following:
1. Your `uploader.env` file has valid credentials
2. You've completed the `--setup-auth` step
3. The account you authenticated with is a test user in the OAuth consent screen
4. Your YouTube channel is in good standing (no strikes or suspensions)

### Rate Limits

YouTube API has daily quota limits:
- Daily quota: 10,000 units
- Video upload: ~1,600 units per video

With 7 videos per day, you'll use approximately 11,200 units. You may need to request a quota increase from Google Cloud Console if you hit limits.

To request a quota increase:
1. Go to [APIs & Services > YouTube Data API v3 > Quotas](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)
2. Click "All Quotas"
3. Find "Queries per day" 
4. Click the edit icon and request an increase

## Video Metadata

Each uploaded video will have:
- **Title**: `DON'T CLICK THE SOUND (n)!!!!!!! #redditstories #reddit #askreddit`
  - Where `n` is automatically incremented for each video
- **Description**: `Reddit story`
- **Tags**: reddit, redditstories, askreddit
- **Category**: Entertainment
- **Privacy**: Public
- **Made for Kids**: No (not made for kids)

The video index (`n`) automatically increments after each successful upload and is saved to `uploader.env`.

## Security Notes

- Keep your `uploader.env` file secure and never commit it to version control
- Add `uploader.env` to your `.gitignore` file
- Your refresh token allows access to upload videos to your YouTube channel
- If compromised, revoke access at [Google Account > Security > Third-party apps](https://myaccount.google.com/permissions)

