import path from 'path';
import { generateText, generateUsername } from '../ai.js';
import { getUsernamePfp, generateImage } from '../image.js';
import { generateSpeech } from '../audio.js';
import { cleanupAiText, sanitizeForSpeech, logStep, colors } from '../utils/helpers.js';
import { editVideoTIL } from '../video.js';
import { TIL_CATEGORIES } from '../constants.js';

export async function generateTILVideo(config, scriptDir, runId, log) {
    // Step 1: Generate TIL content
    logStep(1, 'Generating TIL Content');
    
    // Select category
    let category = config.tilCategory;
    if (!category) {
        category = TIL_CATEGORIES[Math.floor(Math.random() * TIL_CATEGORIES.length)];
    }
    log(`${colors.blue('>')} Selected TIL category: ${colors.cyan(category)}`);

    const targetWordCount = Math.round((config.minStoryLength + config.maxStoryLength) / 2);

    const systemPrompt = `You are an expert at creating engaging "Today I Learned" (TIL) facts. You write fascinating, surprising, and accurate facts that educate and entertain. Your facts should be about ${targetWordCount} words and be written in a conversational, engaging style.

Guidelines:
- Start with "Today I learned that" or "TIL that" or similar engaging openings
- Present the fact in an interesting narrative way
- Include specific details, numbers, or context that make the fact memorable
- End with a surprising twist, additional context, or thought-provoking conclusion
- Write in a natural, conversational tone
- Do NOT use markdown, asterisks, or special formatting
- Do NOT wrap your response in quotes

Example TIL fact:
Today I learned that octopuses have three hearts and blue blood. Two of the hearts pump blood to the gills, while the third pumps it to the rest of the body. But here's the wild part: when an octopus swims, the heart that delivers blood to the body actually stops beating. This is why octopuses prefer to crawl rather than swim - it's literally exhausting for them. Their blood is blue because it uses copper-based hemocyanin instead of iron-based hemoglobin, which is actually more efficient at transporting oxygen in cold, low-oxygen environments. So basically, octopuses are the aliens of our ocean.`;

    const tilPrompt = `Generate an interesting and engaging "Today I Learned" (TIL) fact about ${category}. The fact should be surprising, educational, and fascinating. It should be approximately ${targetWordCount} words. Make it conversational and memorable. Do NOT use quotes or markdown. Respond ONLY with the TIL fact itself.`;

    let tilText = '';
    let factGenerated = false;
    
    for (let i = 0; i < config.generationRetries; i++) {
        log(`\n> TIL fact generation attempt #${i + 1} of ${config.generationRetries}...`);
        tilText = await generateText(tilPrompt, config.model, log, systemPrompt);
        tilText = cleanupAiText(tilText);

        const wordCount = tilText.split(/\s+/).filter(Boolean).length;
        log(`> Generated TIL fact word count: ${wordCount}`);

        if (wordCount >= config.minStoryLength && wordCount <= config.maxStoryLength) {
            log('> TIL fact meets length requirements.');
            factGenerated = true;
            break;
        } else {
            log(`> TIL fact does not meet length requirements (${config.minStoryLength}-${config.maxStoryLength} words). Retrying...`);
        }
    }

    if (!factGenerated) {
        log(`\n${colors.red('ERROR:')} Failed to generate a TIL fact with the required length after ${config.generationRetries} attempts.`);
        process.exit(1);
    }
    
    log(`${colors.green('>')} TIL fact generation complete.`);
    log(`${colors.dim('>')} TIL Fact: ${colors.dim(tilText.substring(0, 150) + '...')}`);

    // Step 2: Generate username
    logStep(2, 'Generating Username');
    let tilUsername = config.questionUsername || await generateUsername(config.model, log);
    log(`${colors.green('>')} TIL Username: ${colors.cyan(tilUsername)}`);

    // Step 3: Generate image
    logStep(3, 'Generating Image');
    const tilPfpPath = await getUsernamePfp(config.questionUsernameImagePath, 'til', scriptDir, log);
    const tilImagePath = path.join(scriptDir, 'images', `til_${runId}.png`);

    await generateImage(tilText, tilUsername, tilPfpPath, tilImagePath, log, false);

    // Step 4: Generate speech
    logStep(4, 'Generating Speech');
    const tilSpeechText = sanitizeForSpeech(tilText);
    const tilAudioPath = path.join(scriptDir, 'audio', `til_${runId}.wav`);

    log(`> Generating TIL speech from text: "${tilSpeechText.substring(0, 100)}..."`);
    await generateSpeech(tilSpeechText, tilAudioPath, config, scriptDir, log);

    return {
        type: 'til',
        tilImagePath,
        tilAudioPath,
        tilText,
        category,
        cleanupFiles: [tilImagePath, tilAudioPath]
    };
}

export async function editTILVideo(videoData, backgroundVideoPath, outputPath, config, log) {
    await editVideoTIL(
        backgroundVideoPath,
        videoData.tilImagePath,
        videoData.tilAudioPath,
        outputPath,
        config,
        log
    );
}

