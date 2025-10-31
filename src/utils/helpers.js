import fs from 'fs';
import path from 'path';
import { cyan, green, yellow, red, blue, magenta, dim, bold } from 'yoctocolors';

export function stripThinkTags(text) {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

export function stripMarkdown(text) {
    if (typeof text !== 'string') {
        return '';
    }
    return text.replace(/\*\*/g, '');
}

export function cleanupAiText(text) {
    if (typeof text !== 'string') return '';
    let cleanedText = text.trim();
    // If the story is wrapped in quotes, remove them.
    if ((cleanedText.startsWith('"') && cleanedText.endsWith('"')) || (cleanedText.startsWith("'") && cleanedText.endsWith("'"))) {
        cleanedText = cleanedText.substring(1, cleanedText.length - 1);
    }
    // Also remove leading/trailing asterisks that some models add for emphasis
    if (cleanedText.startsWith('*') && cleanedText.endsWith('*')) {
        cleanedText = cleanedText.substring(1, cleanedText.length - 1);
    }
    return cleanedText;
}

export function sanitizeForSpeech(text) {
    if (typeof text !== 'string') return '';
    // Removes markdown and other characters that can sound weird in TTS, replacing them with a space
    return text.replace(/[\*"]/g, ' ');
}

export function setupFolders(scriptDir) {
    const folders = ['./audio', './images', './videos', './output'];
    for (const folder of folders) {
        const folderPath = path.join(scriptDir, folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
    }
}

export function createLogger(jsonOutput) {
    return (...args) => {
        if (!jsonOutput) {
            console.log(...args);
        }
    };
}

// Colored logging helpers
export const colors = {
    cyan,
    green,
    yellow,
    red,
    blue,
    magenta,
    dim,
    bold
};

export function logStep(stepNumber, stepName) {
    console.log(`\n${cyan('---')} ${bold(`Step ${stepNumber}: ${stepName}`)} ${cyan('---')}`);
}

export function logSuccess(message) {
    console.log(`${green('✓')} ${message}`);
}

export function logError(message) {
    console.log(`${red('✗')} ${message}`);
}

export function logWarning(message) {
    console.log(`${yellow('⚠')} ${message}`);
}

export function logInfo(message) {
    console.log(`${blue('ℹ')} ${message}`);
}

export function logProgress(current, total, message) {
    console.log(`${cyan(`[${current}/${total}]`)} ${message}`);
}

