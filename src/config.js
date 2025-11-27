import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MODEL_QUALITY_MAP, VIDEO_TYPES } from './constants.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(scriptDir);

// Helper function to normalize chroma key color format for FFmpeg
function normalizeChromaColor(color) {
    if (!color) return undefined;
    
    // Remove common prefixes and normalize
    let normalized = color.trim();
    
    // Remove 0x or 0X prefix
    if (normalized.toLowerCase().startsWith('0x')) {
        normalized = normalized.substring(2);
    }
    
    // Remove # prefix if present
    if (normalized.startsWith('#')) {
        normalized = normalized.substring(1);
    }
    
    // Validate it's a valid hex color (6 characters, 0-9A-F)
    if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
        console.warn(`Warning: Invalid chroma color format: ${color}. Expected format: 0xRRGGBB or RRGGBB`);
        return undefined;
    }
    
    // Return in format that FFmpeg colorkey expects (just the hex without prefix)
    return `0x${normalized.toUpperCase()}`;
}

const argv = yargs(hideBin(process.argv))
  .option('model', { alias: 'm', type: 'string', description: 'The quality of the model to use for generating text (low, normal, high).', default: 'normal' })
  .option('api-endpoint', { alias: 'ae', type: 'string', description: 'OpenAI-compatible API endpoint. Default: http://localhost:11434/v1' })
  .option('api-key', { alias: 'ak', type: 'string', description: 'API key for the AI service. Default: ollama' })
  .option('question-text', { alias: 'q', type: 'string', description: 'The text of the Reddit question' })
  .option('response-text', { alias: 'r', type: 'string', description: 'The text of the Reddit response' })
  .option('question-username', { alias: 'qu', type: 'string', description: 'The username for the question' })
  .option('answer-username', { alias: 'au', type: 'string', description: 'The username for the answer' })
  .option('question-username-image-path', { alias: 'qip', type: 'string', description: 'Path to the profile image for the question username' })
  .option('answer-username-image-path', { alias: 'aip', type: 'string', description: 'Path to the profile image for the answer username' })
  .option('elevenlabs-api-key', { alias: 'ek', type: 'string', description: 'API key for ElevenLabs TTS' })
  .option('video-url', { alias: 'v', type: 'string', description: 'URL of the YouTube video to use as background. Default: https://www.youtube.com/watch?v=s600FYgI5-s' })
  .option('width', { type: 'number', description: 'The width of the output video. Default: 1080' })
  .option('height', { type: 'number', description: 'The height of the output video. Default: 1920' })
  .option('framerate', { alias: 'fr', type: 'number', description: 'The framerate of the output video. Default: 30' })
  .option('padding', { alias: 'p', type: 'number', description: 'The gap between the comment and the screen edge. Default: 100' })
  .option('max-duration', { alias: 'md', type: 'number', description: 'Maximum video duration in seconds. Default: 60' })
  .option('min-speedup', { alias: 'ms', type: 'number', description: 'Minimum audio speedup factor. Default: 1.5' })
  .option('break-duration', { alias: 'bd', type: 'number', description: 'Break duration between question and answer in seconds. Default: 0.5' })
  .option('count', { alias: 'c', type: 'number', description: 'How many videos to generate. Default: 1' })
  .option('title-history-path', { alias: 'thp', type: 'string', description: 'Path to the generated titles JSON file. Default: ./generatedTitles.json' })
  .option('dotenv-path', { alias: 'dp', type: 'string', description: 'Path to a .env file for configuration' })
  .option('min-story-length', { type: 'number', description: 'Minimum word count for the generated story. Default: 100' })
  .option('max-story-length', { type: 'number', description: 'Maximum word count for the generated story. Default: 350' })
  .option('generation-retries', { type: 'number', description: 'Number of retries for generating valid content. Default: 10' })
  .option('crf', { type: 'number', description: 'The CRF value for ffmpeg (lower is higher quality). Default: 23' })
  .option('preset', { type: 'string', description: 'The preset for ffmpeg (e.g., ultrafast, medium, slow). Default: medium' })
  .option('tts-service', { type: 'string', description: 'The TTS service to use when ElevenLabs is not available. Default: coqui', choices: ['coqui', 'edge', 'google'] })
  .option('cleanup', { type: 'boolean', description: 'Run the cleanup script to remove temporary files and exit.' })
  .option('output', { alias: 'o', type: 'string', description: 'The output path for the generated video(s). Default: ./output' })
  .option('json-output', { alias: 'j', type: 'boolean', description: 'Output video details as JSON to stdout and suppress logs.' })
  .option('disable-title-history', { type: 'boolean', description: 'Disable reading from or writing to the title history file.' })
  .option('outro-video-path', { alias: 'ovp', type: 'string', description: 'Path to a custom video to append at the end.' })
  .option('outro-gap', { alias: 'og', type: 'number', description: 'Time gap in seconds between the main video and the outro video.' })
  .option('outro-padding', { alias: 'op', type: 'number', description: 'Padding from the sides for the outro video. Defaults to the main padding value.' })
  .option('outro-scale', { alias: 'os', type: 'string', description: 'How to scale the outro video (e.g., cover, contain).', default: 'contain' })
  .option('outro-chroma-color', { alias: 'occ', type: 'string', description: 'Color to make transparent in the outro video (e.g., 0x00FF00).' })
  .option('outro-chroma-tolerance', { alias: 'oct', type: 'number', description: 'Chroma key color tolerance (0.01 to 1.0).', default: 0.1 })
  .option('outro-mute', { alias: 'om', type: 'boolean', description: 'Mute the audio from the outro video.' })
  .option('outro-speedup', { alias: 'osu', type: 'number', description: 'Speedup factor for the outro video.', default: 1.0 })
  .option('video-codec', { alias: 'vc', type: 'string', description: 'Video codec for ffmpeg encoding (e.g., libx264, h264_videotoolbox, hevc_videotoolbox).', default: 'libx264' })
  .option('video-type', { alias: 'vt', type: 'string', description: 'Type of video to generate (reddit, til, today, aita). Default: reddit', choices: ['reddit', 'til', 'today', 'aita'], default: 'reddit' })
  .option('til-category', { alias: 'tc', type: 'string', description: 'Category for TIL videos (science, history, technology, etc.). If not specified, random category will be used.' })
  .option('date', { alias: 'd', type: 'string', description: 'Date for "today" videos (YYYY-MM-DD format). Defaults to current date if not specified.' })
  .help()
  .alias('help', 'info')
  .argv;

export function loadConfig() {
    // Only load environment variables if dotenv path is specified
    let env = {};
    if (argv.dotenvPath) {
        dotenv.config({ path: argv.dotenvPath });
        env = process.env;
    }

    const resolvedModel = MODEL_QUALITY_MAP[argv.model] || argv.model;

    const config = {
        model: resolvedModel,
        apiEndpoint: argv.apiEndpoint || env.API_ENDPOINT || 'http://localhost:11434/v1',
        apiKey: argv.apiKey || env.API_KEY || 'ollama',
        questionText: argv.questionText || env.QUESTION_TEXT,
        responseText: argv.responseText || env.RESPONSE_TEXT,
        questionUsername: argv.questionUsername || env.QUESTION_USERNAME,
        answerUsername: argv.answerUsername || env.ANSWER_USERNAME,
        questionUsernameImagePath: argv.questionUsernameImagePath || env.QUESTION_USERNAME_IMAGE_PATH,
        answerUsernameImagePath: argv.answerUsernameImagePath || env.ANSWER_USERNAME_IMAGE_PATH,
        elevenlabsApiKey: argv.elevenlabsApiKey || env.ELEVENLABS_API_KEY,
        videoUrl: argv.videoUrl || env.VIDEO_URL || 'https://www.youtube.com/watch?v=s600FYgI5-s',
        width: argv.width || parseInt(env.WIDTH, 10) || 1080,
        height: argv.height || parseInt(env.HEIGHT, 10) || 1920,
        framerate: argv.framerate || parseInt(env.FRAMERATE, 10) || 30,
        padding: argv.padding || parseInt(env.PADDING, 10) || 100,
        maxDuration: argv.maxDuration || parseInt(env.MAX_DURATION, 10) || 60,
        minSpeedup: argv.minSpeedup || parseFloat(env.MIN_SPEEDUP) || 1.5,
        breakDuration: argv.breakDuration || parseFloat(env.BREAK_DURATION) || 0.5,
        count: argv.count || parseInt(env.COUNT, 10) || 1,
        titleHistoryPath: argv.titleHistoryPath || env.TITLE_HISTORY_PATH || path.join(rootDir, 'generatedTitles.json'),
        minStoryLength: argv.minStoryLength || parseInt(env.MIN_STORY_LENGTH, 10) || 100,
        maxStoryLength: argv.maxStoryLength || parseInt(env.MAX_STORY_LENGTH, 10) || 350,
        generationRetries: argv.generationRetries || parseInt(env.GENERATION_RETRIES, 10) || 10,
        crf: argv.crf || parseInt(env.CRF, 10) || 23,
        preset: argv.preset || env.PRESET || 'medium',
        ttsService: argv.ttsService || env.TTS_SERVICE || 'coqui',
        output: argv.output || path.join(rootDir, 'output'),
        jsonOutput: argv.jsonOutput || false,
        disableTitleHistory: argv.disableTitleHistory || false,
        outroVideoPath: argv.outroVideoPath || env.OUTRO_VIDEO_PATH,
        outroGap: argv.outroGap || parseFloat(env.OUTRO_GAP) || 1.0,
        outroPadding: argv.outroPadding || argv.padding || parseInt(env.OUTRO_PADDING || env.PADDING, 10) || 100,
        outroScale: argv.outroScale || env.OUTRO_SCALE || 'contain',
        outroChromaColor: normalizeChromaColor(argv.outroChromaColor || env.OUTRO_CHROMA_COLOR),
        outroChromaTolerance: argv.outroChromaTolerance || parseFloat(env.OUTRO_CHROMA_TOLERANCE) || 0.1,
        outroMute: argv.outroMute || env.OUTRO_MUTE === 'true' || false,
        outroSpeedup: argv.outroSpeedup || parseFloat(env.OUTRO_SPEEDUP) || 1.0,
        videoCodec: argv.videoCodec || env.VIDEO_CODEC || 'libx264',
        videoType: (argv.videoType || env.VIDEO_TYPE || 'reddit').toLowerCase(),
        tilCategory: argv.tilCategory || env.TIL_CATEGORY,
        date: argv.date || env.DATE,
    };

    return config;
}

export { argv, rootDir };

