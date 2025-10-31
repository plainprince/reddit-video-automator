#!/usr/bin/env bun
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import yoctocolors from 'yoctocolors';

const c = yoctocolors;
const ENV_FILE = path.join(import.meta.dir, 'uploader.env');

console.log(c.cyan('\n=== YouTube Uploader Setup Checker ===\n'));

let hasErrors = false;

// Check 1: uploader.env exists
console.log(c.blue('1. Checking uploader.env file...'));
if (fs.existsSync(ENV_FILE)) {
    console.log(c.green('   ✓ uploader.env exists'));
} else {
    console.log(c.red('   ✗ uploader.env NOT found'));
    console.log(c.yellow('   → Create uploader.env with your credentials'));
    hasErrors = true;
}

// Check 2: Load and validate credentials
if (fs.existsSync(ENV_FILE)) {
    dotenv.config({ path: ENV_FILE });
    
    console.log(c.blue('\n2. Checking credentials...'));
    
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
    const videoIndex = process.env.VIDEO_INDEX;
    
    // Check Client ID
    if (clientId && clientId !== 'your_client_id_here.apps.googleusercontent.com') {
        console.log(c.green('   ✓ YOUTUBE_CLIENT_ID is set'));
        if (clientId.endsWith('.apps.googleusercontent.com')) {
            console.log(c.green('   ✓ Client ID format looks correct'));
        } else {
            console.log(c.yellow('   ⚠ Client ID format might be wrong (should end with .apps.googleusercontent.com)'));
        }
    } else {
        console.log(c.red('   ✗ YOUTUBE_CLIENT_ID is missing or using placeholder'));
        hasErrors = true;
    }
    
    // Check Client Secret
    if (clientSecret && clientSecret !== 'your_client_secret_here') {
        console.log(c.green('   ✓ YOUTUBE_CLIENT_SECRET is set'));
    } else {
        console.log(c.red('   ✗ YOUTUBE_CLIENT_SECRET is missing or using placeholder'));
        hasErrors = true;
    }
    
    // Check Refresh Token
    if (refreshToken && refreshToken.length > 10) {
        console.log(c.green('   ✓ YOUTUBE_REFRESH_TOKEN is set'));
    } else {
        console.log(c.yellow('   ⚠ YOUTUBE_REFRESH_TOKEN is not set (run: bun uploader.js --setup-auth)'));
    }
    
    // Check Video Index
    if (videoIndex && !isNaN(parseInt(videoIndex))) {
        console.log(c.green(`   ✓ VIDEO_INDEX is set to ${videoIndex}`));
    } else {
        console.log(c.yellow('   ⚠ VIDEO_INDEX is missing (will default to 1)'));
    }
}

// Check 3: Required dependencies
console.log(c.blue('\n3. Checking dependencies...'));
try {
    await import('googleapis');
    console.log(c.green('   ✓ googleapis package installed'));
} catch (error) {
    console.log(c.red('   ✗ googleapis package NOT installed'));
    console.log(c.yellow('   → Run: bun install'));
    hasErrors = true;
}

try {
    await import('croner');
    console.log(c.green('   ✓ croner package installed'));
} catch (error) {
    console.log(c.red('   ✗ croner package NOT installed'));
    console.log(c.yellow('   → Run: bun install'));
    hasErrors = true;
}

// Check 4: Output directory
console.log(c.blue('\n4. Checking directories...'));
const outputDir = path.join(import.meta.dir, 'output');
if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.mp4'));
    console.log(c.green(`   ✓ output/ directory exists (${files.length} videos)`));
} else {
    console.log(c.yellow('   ⚠ output/ directory not found (will be created when generating videos)'));
}

// Summary
console.log(c.cyan('\n=== Summary ===\n'));
if (hasErrors) {
    console.log(c.red('✗ Setup is incomplete. Please fix the errors above.\n'));
    console.log(c.yellow('Next steps:'));
    console.log(c.dim('  1. Create uploader.env with your Google Cloud credentials'));
    console.log(c.dim('  2. Run: bun install'));
    console.log(c.dim('  3. Run: bun uploader.js --setup-auth'));
    console.log(c.dim('  4. See uploader.md for detailed instructions\n'));
} else {
    if (!process.env.YOUTUBE_REFRESH_TOKEN) {
        console.log(c.yellow('✓ Configuration looks good!\n'));
        console.log(c.yellow('Next step: Authenticate with YouTube'));
        console.log(c.dim('  Run: bun uploader.js --setup-auth\n'));
    } else {
        console.log(c.green('✓ Everything looks good! You\'re ready to upload.\n'));
        console.log(c.cyan('Usage:'));
        console.log(c.dim('  bun uploader.js --run-once    # Test upload'));
        console.log(c.dim('  bun uploader.js               # Start daily automation\n'));
    }
}

