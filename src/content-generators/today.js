import path from 'path';
import { generateText, generateUsername } from '../ai.js';
import { getUsernamePfp, generateImage } from '../image.js';
import { generateSpeech } from '../audio.js';
import { cleanupAiText, sanitizeForSpeech, logStep, colors } from '../utils/helpers.js';
import { editVideoTIL } from '../video.js';

/**
 * Check if a given date is Caps Lock Day (October 22)
 */
function isCapsLockDay(date) {
    return date.getMonth() === 9 && date.getDate() === 22; // Month is 0-indexed
}

/**
 * Format date for AI prompt
 */
function formatDateForPrompt(date) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const ordinal = getOrdinalSuffix(day);
    
    return `${month} ${day}${ordinal}`;
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
}

export async function generateTodayVideo(config, scriptDir, runId, log) {
    // Step 1: Determine the date to use
    logStep(1, 'Processing Date');
    
    let targetDate;
    if (config.date) {
        targetDate = new Date(config.date);
        if (isNaN(targetDate.getTime())) {
            log(`${colors.red('ERROR:')} Invalid date format: ${config.date}`);
            process.exit(1);
        }
    } else {
        targetDate = new Date();
    }
    
    const formattedDate = formatDateForPrompt(targetDate);
    const capsLockDay = isCapsLockDay(targetDate);
    
    log(`${colors.blue('>')} Target Date: ${colors.cyan(formattedDate)}`);
    if (capsLockDay) {
        log(`${colors.yellow('>')} ${colors.bold('CAPS LOCK DAY DETECTED! 🔒')}`);
    }

    // Step 2: Generate "Today" content
    logStep(2, 'Generating "Today" Content');
    
    const targetWordCount = Math.round((config.minStoryLength + config.maxStoryLength) / 2);

    const systemPrompt = capsLockDay
        ? `You are an expert storyteller who creates engaging "Today in History" style content. Today is CAPS LOCK DAY (October 22nd), so you MUST write ONLY about Caps Lock Day itself and write your ENTIRE response in CAPITAL LETTERS.

Guidelines for CAPS LOCK DAY:
- Start with "Today, on the [date]," or similar engaging openings
- Focus EXCLUSIVELY on Caps Lock Day - the celebration of the CAPS LOCK key
- Do NOT write about other historical events that happened on October 22nd (like the Cuban Missile Crisis, JFK, or anything else)
- Explain what Caps Lock Day is, its origin, and why people celebrate it
- Include fun facts about typing in all caps, the Caps Lock key, or internet culture
- Write in a natural, conversational, engaging tone
- Do NOT use markdown, asterisks, or special formatting
- Do NOT wrap your response in quotes
- The story should be approximately ${targetWordCount} words
- WRITE EVERYTHING IN CAPITAL LETTERS!`
        : `You are an expert storyteller who creates engaging "Today in History" style content. You write fascinating historical facts about specific dates, focusing on interesting events, inventions, or celebrations that occurred on that day.

Guidelines:
- Start with "Today, on the [date]," or similar engaging openings
- Present either:
  1. A significant historical event that happened on this date
  2. A notable invention or discovery made on this date
  3. A special day or celebration that occurs on this date
- Include specific details, years, names, and context that make the story memorable
- Build narrative tension and include surprising elements
- End with interesting aftermath or lasting impact
- Write in a natural, conversational, engaging tone
- Be historically accurate where possible, but feel free to embellish for entertainment
- Do NOT use markdown, asterisks, or special formatting
- Do NOT wrap your response in quotes
- The story should be approximately ${targetWordCount} words`;

    const todayPrompt = capsLockDay 
        ? `Generate an engaging "Today in History" story about CAPS LOCK DAY for ${formattedDate}.

VERY IMPORTANT INSTRUCTIONS FOR CAPS LOCK DAY:
1. You MUST write ONLY about CAPS LOCK DAY - the celebration day itself, NOT other historical events like the Cuban Missile Crisis or anything involving JFK
2. You MUST write your ENTIRE response in CAPITAL LETTERS
3. Explain what Caps Lock Day is, its origin, and how it's celebrated
4. Make it engaging and fun, discussing the significance of the CAPS LOCK key and why people celebrate it
5. Include interesting facts about typing in all caps, internet culture, or the history of the Caps Lock key

The story should be approximately ${targetWordCount} words, engaging, and entertaining.

Do NOT use quotes or markdown. Respond ONLY with the story itself IN ALL CAPS.`
        : `Generate an engaging "Today in History" story for ${formattedDate}. 

Choose ONE of these types:
1. A significant historical event that happened on ${formattedDate} (include the year)
2. A notable invention, discovery, or person's birthday on ${formattedDate}
3. A special day or celebration that occurs on ${formattedDate} (explain its origin and significance)

The story should be approximately ${targetWordCount} words, engaging, and historically interesting.

Do NOT use quotes or markdown. Respond ONLY with the story itself.`;

    let todayText = '';
    let storyGenerated = false;
    
    for (let i = 0; i < config.generationRetries; i++) {
        log(`\n> "Today" content generation attempt #${i + 1} of ${config.generationRetries}...`);
        todayText = await generateText(todayPrompt, config.model, log, systemPrompt);
        todayText = cleanupAiText(todayText);

        const wordCount = todayText.split(/\s+/).filter(Boolean).length;
        log(`> Generated story word count: ${wordCount}`);

        // Check if it's Caps Lock Day and if the text is in caps
        if (capsLockDay) {
            const isAllCaps = todayText === todayText.toUpperCase() && todayText !== todayText.toLowerCase();
            if (!isAllCaps) {
                log(`${colors.yellow('>')} Caps Lock Day but text is not in caps. Converting to uppercase...`);
                todayText = todayText.toUpperCase();
            }
        }

        if (wordCount >= config.minStoryLength && wordCount <= config.maxStoryLength) {
            log('> Story meets length requirements.');
            storyGenerated = true;
            break;
        } else {
            log(`> Story does not meet length requirements (${config.minStoryLength}-${config.maxStoryLength} words). Retrying...`);
        }
    }

    if (!storyGenerated) {
        log(`\n${colors.red('ERROR:')} Failed to generate a "Today" story with the required length after ${config.generationRetries} attempts.`);
        process.exit(1);
    }
    
    log(`${colors.green('>')} "Today" content generation complete.`);
    log(`${colors.dim('>')} Story preview: ${colors.dim(todayText.substring(0, 150) + '...')}`);

    // Step 3: Generate username
    logStep(3, 'Generating Username');
    let todayUsername = config.questionUsername || await generateUsername(config.model, log);
    log(`${colors.green('>')} Username: ${colors.cyan(todayUsername)}`);

    // Step 4: Generate image
    logStep(4, 'Generating Image');
    const todayPfpPath = await getUsernamePfp(config.questionUsernameImagePath, 'today', scriptDir, log);
    const todayImagePath = path.join(scriptDir, 'images', `today_${runId}.png`);

    await generateImage(todayText, todayUsername, todayPfpPath, todayImagePath, log, false);

    // Step 5: Generate speech
    logStep(5, 'Generating Speech');
    const todaySpeechText = sanitizeForSpeech(todayText);
    const todayAudioPath = path.join(scriptDir, 'audio', `today_${runId}.wav`);

    log(`> Generating speech from text: "${todaySpeechText.substring(0, 100)}..."`);
    await generateSpeech(todaySpeechText, todayAudioPath, config, scriptDir, log);

    return {
        type: 'today',
        todayImagePath,
        todayAudioPath,
        todayText,
        date: formattedDate,
        capsLockDay,
        cleanupFiles: [todayImagePath, todayAudioPath]
    };
}

export async function editTodayVideo(videoData, backgroundVideoPath, outputPath, config, log) {
    // Today videos use the same editing style as TIL videos (single card format)
    await editVideoTIL(
        backgroundVideoPath,
        videoData.todayImagePath,
        videoData.todayAudioPath,
        outputPath,
        config,
        log
    );
}

