#!/usr/bin/env bun
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { loadConfig, argv, rootDir } from './src/config.js';
import { initializeAI } from './src/ai.js';
import { checkCoquiPrerequisites } from './src/utils/prerequisites.js';
import { setupFolders, createLogger, colors, logStep, logSuccess, logError } from './src/utils/helpers.js';
import { downloadVideo } from './src/video.js';
import { generateRedditVideo, editRedditVideo } from './src/content-generators/reddit.js';
import { generateTILVideo, editTILVideo } from './src/content-generators/til.js';
import { generateTodayVideo, editTodayVideo } from './src/content-generators/today.js';
import { generateAITAVideo, editAITAVideo } from './src/content-generators/aita.js';
import { VIDEO_TYPES } from './src/constants.js';

const scriptDir = rootDir;

function displayBanner() {
    const bannerText = figlet.textSync('vidit', {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
    });
    const styledBanner = gradient([
        { r: 0, g: 255, b: 255 }, // Cyan
        { r: 0, g: 0, b: 255 }    // Blue
    ]).multiline(bannerText);
    console.log(styledBanner);
}

if (argv.cleanup) {
    const cleanupScriptPath = path.join(scriptDir, 'cleanup.sh');
    console.log(`> Running cleanup script: ${cleanupScriptPath}`);
    try {
        const output = execSync(`bash "${cleanupScriptPath}"`);
        console.log(output.toString());
        console.log('> Cleanup complete.');
    } catch (error) {
        console.error(`> Cleanup script failed: ${error.message}`);
        process.exit(1);
    }
    process.exit(0);
}

const config = loadConfig();
const log = createLogger(config.jsonOutput);

if (!config.jsonOutput) {
    displayBanner();
}

// Initialize AI client
initializeAI(config);

async function main() {
    if (config.ttsService === 'coqui' && !config.jsonOutput) {
        await checkCoquiPrerequisites(scriptDir, log);
    }
    setupFolders(scriptDir);
    const generatedVideos = [];
    const shouldTrackTitles = !config.disableTitleHistory && !config.jsonOutput;

    // Add this check at the beginning for Reddit videos
    if (config.videoType === VIDEO_TYPES.REDDIT && config.questionText && fs.existsSync(config.titleHistoryPath)) {
        const titleHistory = JSON.parse(fs.readFileSync(config.titleHistoryPath, 'utf-8'));
        if (titleHistory.includes(config.questionText)) {
            log('> Provided question already exists in history - duplicate check skipped');
        }
    }

    for (let i = 0; i < config.count; i++) {
        console.log(`\n${colors.cyan('===')} ${colors.bold(`Starting Video Generation #${i + 1} of ${config.count}`)} ${colors.cyan('===')}`);
        log(`${colors.blue('>')} Video Type: ${colors.bold(config.videoType.toUpperCase())}`);
        
        const runId = new Date().getTime();
        let videoData;

        // Generate content based on video type
        if (config.videoType === VIDEO_TYPES.TIL) {
            videoData = await generateTILVideo(config, scriptDir, runId, log);
        } else if (config.videoType === VIDEO_TYPES.TODAY) {
            videoData = await generateTodayVideo(config, scriptDir, runId, log);
        } else if (config.videoType === VIDEO_TYPES.AITA) {
            videoData = await generateAITAVideo(config, scriptDir, runId, log);
        } else {
            // Default to Reddit
            videoData = await generateRedditVideo(config, scriptDir, runId, log);
        }

        // Download background video
        logStep(6, 'Downloading Background Video');
        const videoIdMatch = config.videoUrl.match(/(?:v=)([^&]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
            logError(`Invalid YouTube URL provided: ${config.videoUrl}`);
            process.exit(1);
        }
        const videoPath = path.join(scriptDir, 'videos', `${videoId}.mp4`);
        if (!fs.existsSync(videoPath)) {
            await downloadVideo(config.videoUrl, videoPath, log);
        } else {
            log(`${colors.dim('>')} Background video ${colors.dim(videoPath)} already exists.`);
        }

        // Edit final video
        logStep(7, 'Editing Final Video');
        const outputDir = config.output;
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            log(`${colors.dim('>')} Created output directory.`);
        }
        const timestamp = new Date().getTime();
        const outputPath = path.join(outputDir, `final_video_${timestamp}.mp4`);

        if (config.videoType === VIDEO_TYPES.TIL) {
            await editTILVideo(videoData, videoPath, outputPath, config, log);
        } else if (config.videoType === VIDEO_TYPES.TODAY) {
            await editTodayVideo(videoData, videoPath, outputPath, config, log);
        } else if (config.videoType === VIDEO_TYPES.AITA) {
            await editAITAVideo(videoData, videoPath, outputPath, config, log);
        } else {
            await editRedditVideo(videoData, videoPath, outputPath, config, log);
        }

        // Store video info
        const videoInfo = {
            type: config.videoType,
            outputPath: outputPath,
        };

        if (config.videoType === VIDEO_TYPES.TIL) {
            videoInfo.tilText = videoData.tilText;
            videoInfo.category = videoData.category;
        } else if (config.videoType === VIDEO_TYPES.TODAY) {
            videoInfo.todayText = videoData.todayText;
            videoInfo.date = videoData.date;
            videoInfo.capsLockDay = videoData.capsLockDay;
        } else if (config.videoType === VIDEO_TYPES.AITA) {
            videoInfo.question = videoData.questionText;
            videoInfo.answer = videoData.answerText;
        } else {
            videoInfo.question = videoData.questionText;
            videoInfo.answer = videoData.answerText;
        }

        generatedVideos.push(videoInfo);

        // Cleanup temporary files
        try {
            for (const file of videoData.cleanupFiles) {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            }
            log(`${colors.dim('>')} Cleaned up temporary image and audio files.`);
        } catch (cleanupError) {
            log(`${colors.yellow('>')} Warning: Could not clean up temporary files for run ${runId}: ${cleanupError.message}`);
        }

        console.log(`\n${colors.green('✓')} ${colors.bold('All Done!')}`);
        logSuccess(`Final video saved to: ${colors.cyan(outputPath)}`);
    }

    if (config.jsonOutput) {
        console.log(JSON.stringify(generatedVideos, null, 2));
    }
}

main();
