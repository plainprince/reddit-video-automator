import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { REDDIT_PFP_COLORS } from './constants.js';

export async function generateImage(text, username, profileImagePath, outputPath, log, isQuestion = false) {
    if (typeof text !== 'string') {
        text = ''; // Fallback
    }
    const canvasWidth = 1080;
    const padding = 50;
    const textWidth = canvasWidth - padding * 2;
    const pfpSize = 50;
    const pfpY = padding;
    const pfpX = padding;
    const usernameY = pfpY + 35;
    const usernameX = pfpX + pfpSize + 20;
    const textStartY = pfpY + 120;
    const lineHeight = 50;
    const font = '40px sans-serif';
    const boldFont = 'bold 40px sans-serif';

    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext('2d');

    // Helper to wrap text and calculate lines/height
    function calculateLines(textToWrap) {
        const lines = textToWrap.split('\n');
        const wrappedLines = [];
        lines.forEach((line, index) => {
            if (line === '') {
                wrappedLines.push({ text: '', font: font });
                return;
            }
            const currentFont = (isQuestion && index === 0) ? boldFont : font;
            tempCtx.font = currentFont;

            const words = line.split(' ');
            let currentLine = '';
            for (const word of words) {
                const testLine = currentLine + word + ' ';
                if (tempCtx.measureText(testLine).width > textWidth && currentLine.length > 0) {
                    wrappedLines.push({ text: currentLine.trim(), font: currentFont });
                    currentLine = word + ' ';
                } else {
                    currentLine = testLine;
                }
            }
            wrappedLines.push({ text: currentLine.trim(), font: currentFont });
        });
        return wrappedLines;
    }

    const allLines = calculateLines(text);
    const calculatedHeight = textStartY + allLines.length * lineHeight + padding;

    const canvas = createCanvas(canvasWidth, calculatedHeight);
    const ctx = canvas.getContext('2d');

    // Drawing logic...
    ctx.fillStyle = '#1a1a1b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (profileImagePath) {
        try {
            const pfp = await loadImage(profileImagePath);
            ctx.drawImage(pfp, pfpX, pfpY, pfpSize, pfpSize);
        } catch (error) { /* already handled */ }
    }
    ctx.fillStyle = '#d7dadc';
    ctx.font = '30px sans-serif';
    ctx.fillText(username, usernameX, usernameY);
    let textY = textStartY;
    allLines.forEach(lineInfo => {
        ctx.font = lineInfo.font;
        ctx.fillText(lineInfo.text, padding, textY);
        textY += lineHeight;
    });

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    log(`Image saved to ${outputPath}`);
}

export async function downloadImage(url, filepath, log) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    log(`> Downloaded image to ${filepath}`);
}

export async function getUsernamePfp(providedPath, type, scriptDir, log) {
    if (providedPath) return providedPath;
    const style = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0');
    const color = REDDIT_PFP_COLORS[Math.floor(Math.random() * REDDIT_PFP_COLORS.length)];
    const url = `https://www.redditstatic.com/avatars/avatar_default_${style}_${color}.png`;
    const pfpDir = path.join(scriptDir, 'images');
    const pfpPath = path.join(pfpDir, `default_${type}_${style}_${color}.png`);
    if (!fs.existsSync(pfpPath)) {
        await downloadImage(url, pfpPath, log);
    }
    return pfpPath;
}

