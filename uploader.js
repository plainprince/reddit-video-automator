#!/usr/bin/env bun
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import { Cron } from 'croner';
import { $ } from 'bun';
import yoctocolors from 'yoctocolors';

const c = yoctocolors;

// Nerd font icons
const icons = {
    check: '',
    cross: '',
    arrow: '',
    upload: '',
    video: '',
    clock: '',
    key: '',
    info: '',
    warning: '',
};

const argv = yargs(hideBin(process.argv))
    .option('setup-auth', {
        type: 'boolean',
        description: 'Setup YouTube OAuth authentication',
    })
    .option('upload-only', {
        type: 'boolean',
        description: 'Upload existing videos from output folder without generating new ones',
    })
    .option('run-once', {
        type: 'boolean',
        description: 'Generate and upload videos once, then exit (skip cron scheduling)',
    })
    .help()
    .argv;

const ENV_FILE = path.join(import.meta.dir, 'uploader.env');
const OUTPUT_DIR = path.join(import.meta.dir, 'output');

// Load environment variables
function loadEnv() {
    if (fs.existsSync(ENV_FILE)) {
        dotenv.config({ path: ENV_FILE });
    }
    return {
        clientId: process.env.YOUTUBE_CLIENT_ID,
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
        refreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
        videoIndex: parseInt(process.env.VIDEO_INDEX || '1'),
    };
}

// Save environment variables
function saveEnv(key, value) {
    let envContent = '';
    if (fs.existsSync(ENV_FILE)) {
        envContent = fs.readFileSync(ENV_FILE, 'utf-8');
    }

    const lines = envContent.split('\n');
    let found = false;
    const newLines = lines.map(line => {
        if (line.startsWith(`${key}=`)) {
            found = true;
            return `${key}=${value}`;
        }
        return line;
    });

    if (!found) {
        newLines.push(`${key}=${value}`);
    }

    fs.writeFileSync(ENV_FILE, newLines.join('\n').trim() + '\n');
}

// Create OAuth2 client
function createOAuth2Client(env) {
    const oauth2Client = new google.auth.OAuth2(
        env.clientId,
        env.clientSecret,
        'urn:ietf:wg:oauth:2.0:oob' // For manual code entry
    );

    if (env.refreshToken) {
        oauth2Client.setCredentials({
            refresh_token: env.refreshToken,
        });
    }

    return oauth2Client;
}

// Setup OAuth authentication
async function setupAuth() {
    console.log(c.cyan(`\n${icons.key} YouTube OAuth Setup\n`));

    const env = loadEnv();

    if (!env.clientId || !env.clientSecret) {
        console.log(c.red(`${icons.cross} Missing OAuth credentials in ${ENV_FILE}`));
        console.log(c.yellow(`\n${icons.info} Please add the following to ${ENV_FILE}:`));
        console.log(c.dim('YOUTUBE_CLIENT_ID=your_client_id_here'));
        console.log(c.dim('YOUTUBE_CLIENT_SECRET=your_client_secret_here\n'));
        console.log(c.blue(`${icons.arrow} See uploader.md for detailed instructions on how to get these credentials.\n`));
        process.exit(1);
    }

    const oauth2Client = createOAuth2Client(env);

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube.upload'],
    });

    console.log(c.green(`${icons.info} Visit this URL to authorize the application:\n`));
    console.log(c.blue(authUrl));
    console.log(c.yellow(`\n${icons.arrow} After authorizing, you'll receive an authorization code.`));
    console.log(c.yellow(`${icons.arrow} Paste the authorization code here and press Enter:\n`));

    // Read authorization code from stdin
    const code = await new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });

    try {
        const { tokens } = await oauth2Client.getToken(code);
        
        if (tokens.refresh_token) {
            saveEnv('YOUTUBE_REFRESH_TOKEN', tokens.refresh_token);
            console.log(c.green(`\n${icons.check} Authentication successful!`));
            console.log(c.green(`${icons.check} Refresh token saved to ${ENV_FILE}\n`));
        } else {
            console.log(c.red(`\n${icons.cross} No refresh token received. You may need to revoke access and try again.\n`));
            process.exit(1);
        }
    } catch (error) {
        console.log(c.red(`\n${icons.cross} Authentication failed: ${error.message}\n`));
        process.exit(1);
    }
}

// Upload video to YouTube
async function uploadVideo(oauth2Client, videoPath, title, description, env) {
    const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client,
    });

    console.log(c.blue(`${icons.upload} Uploading: ${path.basename(videoPath)}`));
    console.log(c.dim(`   Title: ${title}`));

    try {
        const response = await youtube.videos.insert({
            part: ['snippet', 'status'],
            requestBody: {
                snippet: {
                    title: title,
                    description: description,
                    tags: ['reddit', 'redditstories', 'askreddit'],
                    categoryId: '24', // Entertainment category
                },
                status: {
                    privacyStatus: 'public',
                    selfDeclaredMadeForKids: false,
                },
            },
            media: {
                body: fs.createReadStream(videoPath),
            },
        });

        console.log(c.green(`${icons.check} Uploaded successfully!`));
        console.log(c.dim(`   Video ID: ${response.data.id}`));
        console.log(c.dim(`   URL: https://www.youtube.com/watch?v=${response.data.id}\n`));

        return response.data;
    } catch (error) {
        console.log(c.red(`${icons.cross} Upload failed: ${error.message}\n`));
        throw error;
    }
}

// Clean output directory
function cleanOutputDir() {
    if (fs.existsSync(OUTPUT_DIR)) {
        const files = fs.readdirSync(OUTPUT_DIR);
        for (const file of files) {
            const filePath = path.join(OUTPUT_DIR, file);
            if (fs.statSync(filePath).isFile() && file.endsWith('.mp4')) {
                fs.unlinkSync(filePath);
            }
        }
        console.log(c.dim(`${icons.check} Cleaned output directory\n`));
    }
}

// Generate videos using index.js
async function generateVideos(count, videoType, date = null) {
    console.log(c.cyan(`${icons.video} Generating ${count} ${videoType} video(s)...\n`));

    const args = [
        'index.js',
        '--count', count.toString(),
        '--video-type', videoType,
        '--json-output',
    ];

    if (date) {
        args.push('--date', date);
    }

    try {
        await $`bun ${args}`;
        console.log(c.green(`${icons.check} Generated ${count} ${videoType} video(s)\n`));
    } catch (error) {
        console.log(c.red(`${icons.cross} Video generation failed: ${error.message}\n`));
        throw error;
    }
}

// Main upload workflow
async function uploadWorkflow(uploadOnly = false) {
    console.log(c.cyan(`\n${icons.clock} Starting upload workflow at ${new Date().toLocaleString()}\n`));

    const env = loadEnv();

    if (!env.clientId || !env.clientSecret || !env.refreshToken) {
        console.log(c.red(`${icons.cross} Missing OAuth credentials. Run with --setup-auth first.\n`));
        process.exit(1);
    }

    const oauth2Client = createOAuth2Client(env);

    // Clean output directory at start
    cleanOutputDir();

    if (!uploadOnly) {
        // Generate videos: 3 reddit, 3 til, 3 aita, 1 today
        try {
            await generateVideos(3, 'reddit');
            await generateVideos(3, 'til');
            await generateVideos(3, 'aita');
            
            // Get today's date for the "today" video
            const today = new Date().toISOString().split('T')[0];
            await generateVideos(1, 'today', today);
        } catch (error) {
            console.log(c.red(`${icons.cross} Video generation failed. Exiting.\n`));
            process.exit(1);
        }
    }

    // Get all videos from output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        console.log(c.yellow(`${icons.warning} No output directory found.\n`));
        return;
    }

    const videoFiles = fs.readdirSync(OUTPUT_DIR)
        .filter(file => file.endsWith('.mp4'))
        .map(file => path.join(OUTPUT_DIR, file))
        .sort(); // Sort to ensure consistent order

    if (videoFiles.length === 0) {
        console.log(c.yellow(`${icons.warning} No videos found in output directory.\n`));
        return;
    }

    console.log(c.cyan(`${icons.video} Found ${videoFiles.length} video(s) to upload\n`));

    let currentIndex = env.videoIndex;
    const uploadedVideos = [];
    const failedVideos = [];

    // Upload each video
    for (const videoPath of videoFiles) {
        const title = `DON'T CLICK THE SOUND (${currentIndex})!!!!!!! #redditstories #reddit #askreddit`;
        const description = 'Reddit story';

        let retries = 3;
        let uploaded = false;

        while (retries > 0 && !uploaded) {
            try {
                await uploadVideo(oauth2Client, videoPath, title, description, env);
                uploadedVideos.push({ path: videoPath, index: currentIndex });
                
                // Increment index and save immediately after successful upload
                currentIndex++;
                saveEnv('VIDEO_INDEX', currentIndex.toString());
                
                uploaded = true;

                // Delete the uploaded video
                fs.unlinkSync(videoPath);
                console.log(c.dim(`${icons.check} Deleted uploaded video\n`));

            } catch (error) {
                retries--;
                if (retries > 0) {
                    console.log(c.yellow(`${icons.warning} Retrying... (${retries} attempts left)\n`));
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
                } else {
                    console.log(c.red(`${icons.cross} Failed to upload after 3 attempts. Keeping file for manual upload.\n`));
                    failedVideos.push({ path: videoPath, index: currentIndex, error: error.message });
                    // Don't increment index for failed videos
                }
            }
        }
    }

    // Summary
    console.log(c.cyan(`\n${icons.info} Upload Summary:`));
    console.log(c.green(`${icons.check} Successfully uploaded: ${uploadedVideos.length} video(s)`));
    
    if (failedVideos.length > 0) {
        console.log(c.red(`${icons.cross} Failed uploads: ${failedVideos.length} video(s)`));
        console.log(c.yellow(`\n${icons.warning} Failed videos kept in output directory for manual upload:`));
        failedVideos.forEach(v => {
            console.log(c.dim(`   - ${path.basename(v.path)} (would be index ${v.index})`));
        });
    }

    console.log(c.cyan(`${icons.arrow} Next video index: ${currentIndex}\n`));
}

// Main function
async function main() {
    if (argv.setupAuth) {
        await setupAuth();
        process.exit(0);
    }

    if (argv.uploadOnly || argv.runOnce) {
        await uploadWorkflow(argv.uploadOnly);
        process.exit(0);
    }

    // Schedule daily upload at 10:00
    console.log(c.cyan(`\n${icons.clock} YouTube Uploader - Daily Automation`));
    console.log(c.green(`${icons.check} Scheduled to run daily at 10:00\n`));

    const job = Cron('0 10 * * *', {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }, async () => {
        try {
            await uploadWorkflow(false);
        } catch (error) {
            console.error(c.red(`${icons.cross} Workflow failed: ${error.message}\n`));
        }
    });

    console.log(c.dim(`${icons.info} Press Ctrl+C to stop the scheduler\n`));

    // Keep process running
    process.on('SIGINT', () => {
        console.log(c.yellow(`\n${icons.info} Stopping scheduler...\n`));
        job.stop();
        process.exit(0);
    });
}

main();

