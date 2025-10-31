import fs from 'fs';
import path from 'path';
import { generateText, generateUsername } from '../ai.js';
import { getUsernamePfp, generateImage } from '../image.js';
import { generateSpeech } from '../audio.js';
import { cleanupAiText, sanitizeForSpeech, logStep, colors } from '../utils/helpers.js';
import { editVideoReddit } from '../video.js';

export async function generateAITAVideo(config, scriptDir, runId, log) {
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
            logStep(1, 'Generating AITA Question');
            const titlePrompt = `Generate a fake, interesting, and engaging AITA (Am I The Asshole) style question. The question MUST start with "AITA for" followed by a controversial or morally ambiguous action or situation. The scenario should be relatable, thought-provoking, and spark debate about who is right or wrong. Make it engaging and realistic. Respond ONLY with the text of the question, and nothing else.`;
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
        log(`${colors.green('>')} Generated AITA Question: ${colors.cyan(questionTitle)}`);
    } else {
        questionTitle = config.questionText;
        questionText = '';
        logStep(1, 'Using Provided Question');
        log(`${colors.green('>')} AITA Question: ${colors.cyan(questionTitle)}`);
    }

    // Step 2: Generate or use provided response
    if (!config.responseText) {
        logStep(2, 'Generating AITA Story');
        
        const targetWordCount = Math.round((config.minStoryLength + config.maxStoryLength) / 2);

        const systemPrompt = `You are a creative storyteller who writes engaging AITA (Am I The Asshole) style responses. You follow the provided format and ONLY respond with the text, without any introductory phrases or markdown. Your story should be about ${targetWordCount} words.

### AITA Response Format:
**Structure:**
1.  **Judgment Verdict:** Start with one of these verdicts: "YTA" (You're The Asshole), "NTA" (Not The Asshole), "ESH" (Everyone Sucks Here), or "NAH" (No Assholes Here)
2.  **Context/Background:** Briefly set the scene and explain the relationship dynamics
3.  **The Incident:** Describe the specific situation or conflict in detail
4.  **Multiple Perspectives:** Show why different people might see it differently
5.  **The Reasoning:** Explain why the judgment was made, considering social norms, intentions, and consequences
6.  **Additional Considerations:** Mention any complicating factors or nuances
7.  **Concluding Thought:** A final sentence that reinforces the judgment or offers wisdom

**Example AITA Response:**
Question: AITA for refusing to give up my airplane seat to a family?
Response:
NTA. You paid for that specific seat in advance.
So I was flying cross-country for a work conference, and I specifically booked and paid extra for an aisle seat because I'm tall and need to stretch my legs. About twenty minutes before takeoff, a family of four boards, and the parents immediately ask if I'd switch to a middle seat three rows back so they could all sit together. I politely declined, explaining I paid extra for this specific seat. The mother got visibly upset, saying I was being selfish and that families should stick together. A flight attendant even came over and asked if I'd consider moving "as a courtesy." Here's the thing: I checked their boarding passes when they showed the flight attendant. They had basic economy tickets and didn't pay for seat selection. They were hoping someone would just give up a premium seat. The father muttered something about "people these days" as they walked away. My coworker later said I should have just moved to be nice, but I don't think I should have to give up something I paid for because of poor planning on their part. Airlines literally have a system where you can pay to sit together. They chose not to use it. Would I have been the asshole if their kid was an infant? Maybe. But these were teenagers who could absolutely sit separately for a few hours.
You're not required to subsidize other people's travel choices.`;
        
        const responsePrompt = `Generate an engaging AITA (Am I The Asshole) style response to the question: "${questionTitle}".

Start with a judgment verdict (YTA, NTA, ESH, or NAH), then tell the story from the poster's perspective, explaining the situation, the conflict, and why the judgment makes sense. Include multiple perspectives to show the moral complexity. The story must be about ${targetWordCount} words. Do not wrap your final response in quotation marks or markdown. Respond ONLY with the story itself.`;
        
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
        type: 'aita',
        questionImagePath,
        answerImagePath,
        questionAudioPath,
        answerAudioPath,
        questionText: fullQuestionText,
        answerText: responseText,
        cleanupFiles: [questionImagePath, answerImagePath, questionAudioPath, answerAudioPath]
    };
}

export async function editAITAVideo(videoData, backgroundVideoPath, outputPath, config, log) {
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

