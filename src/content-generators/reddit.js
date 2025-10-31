import fs from 'fs';
import path from 'path';
import { generateText, generateUsername } from '../ai.js';
import { getUsernamePfp, generateImage } from '../image.js';
import { generateSpeech } from '../audio.js';
import { cleanupAiText, sanitizeForSpeech, logStep, colors } from '../utils/helpers.js';
import { editVideoReddit } from '../video.js';

export async function generateRedditVideo(config, scriptDir, runId, log) {
    let questionTitle = '';
    let questionText = '';
    let responseText = '';

    // Step 1: Generate or use provided question
    if (!config.questionText) {
        let titleHistory = [];
        const shouldTrackTitles = !config.disableTitleHistory && !config.jsonOutput;
        
        if (shouldTrackTitles && fs.existsSync(config.titleHistoryPath)) {
            try {
                let parsedHistory = JSON.parse(fs.readFileSync(config.titleHistoryPath, 'utf-8'));
                if (Array.isArray(parsedHistory)) {
                    titleHistory = parsedHistory;
                } else {
                    log('> Warning: Title history file is not a valid JSON array. Starting fresh.');
                }
            } catch (e) {
                log('> Warning: Could not parse title history file. Starting fresh.');
            }
        }
        
        let isUnique = false;
        while (!isUnique) {
            logStep(1, 'Generating Reddit Question Title');
            const titlePrompt = `Generate a fake, interesting, and engaging AskReddit-style question. The question MUST be either a "Have you ever..." style question (asking about a past experience) or an "If you could..." style question (posing a hypothetical scenario). Do NOT generate "What if..." questions. The question should be thought-provoking. Respond ONLY with the text of the title, and nothing else.`;
            questionTitle = await generateText(titlePrompt, config.model, log);
            questionTitle = cleanupAiText(questionTitle);
            if (!shouldTrackTitles || !titleHistory.includes(questionTitle)) {
                isUnique = true;
                if (shouldTrackTitles) {
                    titleHistory.push(questionTitle);
                    fs.writeFileSync(config.titleHistoryPath, JSON.stringify(titleHistory, null, 2));
                }
            } else {
                log(`${colors.yellow('>')} Generated title is not unique. Retrying...`);
            }
        }
        questionText = '';
        log(`${colors.green('>')} Generated Question Title: ${colors.cyan(questionTitle)}`);
    } else {
        questionTitle = config.questionText;
        questionText = '';
        logStep(1, 'Using Provided Question');
        log(`${colors.green('>')} Question Title: ${colors.cyan(questionTitle)}`);
    }

    // Step 2: Generate or use provided response
    if (!config.responseText) {
        logStep(2, 'Generating Reddit Story');
        
        const targetWordCount = Math.round((config.minStoryLength + config.maxStoryLength) / 2);

        const systemPrompt = `You are a creative storyteller who writes engaging Reddit-style answers. You follow one of the provided formats and ONLY respond with the text, without any introductory phrases or markdown. Your story should be about ${targetWordCount} words.

### Format 1: Narrative Unfolding (For "Have you ever..." questions)
**Structure:**
1.  **Direct Answer:** A clear, direct answer to the question.
2.  **Context/Setup:** Briefly set the scene and provide necessary background.
3.  **The Story:** The main narrative, describing the events as they happened.
4.  **Plot Twist / Climax:** The most surprising or critical part of the story.
5.  **Aftermath / Resolution:** Explain what happened after the climax and the long-term consequences.
6.  **Concluding Thought:** A final sentence to wrap up the story and leave an impression.
7.  **(Optional) Fun Fact:** An interesting, slightly tangential detail that adds flavor.

**Example for "Narrative Unfolding":**
Question: Have you ever walked into your home and known something wasn't right?
Response:
So my cat literally saved my dad's life.
It was a few years back; my mom was at work and my dad, thinking he just had a cold, stayed home. I came over around 2pm. Our cat, Max, who usually greets me like a dog, was going absolutely wild, clawing at the door and crying. When I finally got in, he was running in circles, hissing and even biting me. I knew something was wrong, so I followed him. My dad was on the couch, but he wasn't just sleeping. He was completely unresponsive. Fun fact: I had to lock Max in the bathroom because he was trying to jump into the ambulance with us. The diagnosis was sepsis. The doctor said a few more hours and my dad wouldn't have made it. He had to have emergency surgery. Now, six years later, my dad can no longer work, but he's alive and well, all thanks to Max, who still checks on him every night.
We really don't deserve pets.

### Format 2: Hypothetical Exploration (For "If you could..." questions)
**Structure:**
1.  **Initial Choice:** State the choice made in the hypothetical scenario.
2.  **The Immediate Consequence:** Describe the initial effects of this choice.
3.  **The Unfolding Scenario:** Build a short, creative story around the consequences, exploring the good and the bad.
4.  **The Twist or Realization:** A surprising outcome or a deeper understanding gained from the hypothetical experience.
5.  **Final Reflection:** A concluding thought about the choice and its ultimate meaning.

**Example for "Hypothetical Exploration":**
Question: If you could have any mundane superpower, what would it be?
Response:
The ability to perfectly toast bread. Every time.
At first, it was just a breakfast-time novelty. My toast was legendary—golden-brown and evenly crisp. Friends would come over just for a slice. Then it started getting weird. I could sense the moisture content of sourdough from across the room and started having dreams about crumb structure. My local baker regarded me with a mixture of awe and fear. One day, a shadowy government agency tried to recruit me to create the perfect toast for a peace treaty signing. That's when I knew I had gone too deep.
I gave it all up and now I just eat oatmeal. Some powers are too great for one person to wield.`;
        
        const responsePrompt = `Generate an engaging AskReddit-style response to the question: "${questionTitle}".

Analyze the question and choose the most appropriate format from the ones I provided: "Narrative Unfolding" (for "Have you ever..." questions) or "Hypothetical Exploration" (for "If you could..." scenarios). The story must be about ${targetWordCount} words. Do not wrap your final response in quotation marks or markdown. Respond ONLY with the story itself.`;
        
        let storyGenerated = false;
        for (let i = 0; i < config.generationRetries; i++) {
            log(`\n> Story generation attempt #${i + 1} of ${config.generationRetries}...`);
            responseText = await generateText(responsePrompt, config.model, log, systemPrompt);
            responseText = cleanupAiText(responseText);

            const wordCount = responseText.split(/\s+/).filter(Boolean).length;
            log(`> Generated story word count: ${wordCount}`);

            if (wordCount >= config.minStoryLength && wordCount <= config.maxStoryLength) {
                log('> Story meets length requirements.');
                storyGenerated = true;
                break;
            } else {
                log(`> Story does not meet length requirements (${config.minStoryLength}-${config.maxStoryLength} words). Retrying...`);
            }
        }

        if (!storyGenerated) {
            log(`\n--- ERROR: Failed to generate a story with the required length after ${config.generationRetries} attempts.`);
            process.exit(1);
        }
        
        log(`${colors.green('>')} Story generation complete.`);
    } else {
        responseText = config.responseText;
        logStep(2, 'Using Provided Story');
    }
    
    // Step 3: Generate usernames
    logStep(3, 'Generating Usernames');
    let questionUsername = config.questionUsername;
    let answerUsername = config.answerUsername;

    if (!questionUsername) {
        log('> Generating username for the question...');
        questionUsername = await generateUsername(config.model, log);
    }
    log(`> Question Username: ${questionUsername}`);

    if (!answerUsername) {
        log('> Generating username for the answer...');
        answerUsername = await generateUsername(config.model, log);
    }
    log(`> Answer Username: ${answerUsername}`);

    const fullQuestionText = `${questionTitle}${questionText ? `\n\n${questionText}` : ''}`;

    // Step 4: Generate images
    logStep(4, 'Generating Images');
    const questionPfpPath = await getUsernamePfp(config.questionUsernameImagePath, 'question', scriptDir, log);
    const answerPfpPath = await getUsernamePfp(config.answerUsernameImagePath, 'answer', scriptDir, log);

    const questionImagePath = path.join(scriptDir, 'images', `question_${runId}.png`);
    const answerImagePath = path.join(scriptDir, 'images', `answer_${runId}.png`);

    await generateImage(fullQuestionText, questionUsername, questionPfpPath, questionImagePath, log, true);
    await generateImage(responseText, answerUsername, answerPfpPath, answerImagePath, log);

    // Step 5: Generate speech
    logStep(5, 'Generating Speech');
    const questionSpeechText = sanitizeForSpeech(fullQuestionText);
    const answerSpeechText = sanitizeForSpeech(responseText);

    const questionAudioPath = path.join(scriptDir, 'audio', `question_${runId}.wav`);
    const answerAudioPath = path.join(scriptDir, 'audio', `answer_${runId}.wav`);

    log(`> Generating question speech from text: "${questionSpeechText.substring(0, 100)}..."`);
    await generateSpeech(questionSpeechText, questionAudioPath, config, scriptDir, log);
  
    log('> Generating answer speech...');
    await generateSpeech(answerSpeechText, answerAudioPath, config, scriptDir, log);

    return {
        type: 'reddit',
        questionImagePath,
        answerImagePath,
        questionAudioPath,
        answerAudioPath,
        questionText: fullQuestionText,
        answerText: responseText,
        cleanupFiles: [questionImagePath, answerImagePath, questionAudioPath, answerAudioPath]
    };
}

export async function editRedditVideo(videoData, backgroundVideoPath, outputPath, config, log) {
    await editVideoReddit(
        backgroundVideoPath,
        videoData.questionImagePath,
        videoData.answerImagePath,
        videoData.questionAudioPath,
        videoData.answerAudioPath,
        outputPath,
        config,
        log
    );
}

