import { OpenAI } from 'openai';
import { stripThinkTags } from './utils/helpers.js';

let openaiClient = null;

export function initializeAI(config) {
    openaiClient = new OpenAI({
        baseURL: config.apiEndpoint,
        apiKey: config.apiKey,
    });
}

export async function generateText(prompt, model, log, systemPrompt = null, retries = 3) {
    log(`\n> Sending prompt to ${model}: "${prompt.substring(0, 100)}..."`);
    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    for (let i = 0; i < retries; i++) {
        try {
            const response = await openaiClient.chat.completions.create({
                model: model,
                messages: messages,
            });
            const rawContent = response.choices[0].message.content;
            log(`> Received response from ${model}.`);
            const cleanContent = stripThinkTags(rawContent);
            if (cleanContent) return cleanContent; // Return if we got a valid, non-empty string
            log(`> Model returned empty response. Retrying...`);
        } catch (error) {
            log(`> Attempt ${i + 1} failed for model ${model}. Retrying...`);
            if (i === retries - 1) {
                log('Error generating text with Ollama:', error);
                process.exit(1);
            }
        }
    }
}

export async function generateUsername(model, log) {
    const usernamePrompt = `Generate a comma-separated list of 10 fake Reddit usernames.
RULES:
- Each username MUST start with '@'.
- Each username MUST be between 4 and 20 characters long.
- Each username MUST contain ONLY lowercase letters (a-z), numbers (0-9), and underscores (_).
- Respond ONLY with the comma-separated list and nothing else.
Example: @user_one,@user_two,@another_user,@reddit_pro_99`;

    while (true) {
        log(`> Getting a batch of usernames from ${model}...`);
        const rawResult = await generateText(usernamePrompt, model, log);
        if (!rawResult) continue; // Retry if we got nothing
        
        const candidates = rawResult.split(',').map(u => u.trim());
        const shuffledCandidates = candidates.sort(() => 0.5 - Math.random());

        for (const candidate of shuffledCandidates) {
            if (
                candidate.startsWith('@') &&
                candidate.length >= 4 &&
                candidate.length <= 20 &&
                /^[a-z0-9_]+$/.test(candidate.substring(1))
            ) {
                log(`> Found valid username: ${candidate}`);
                return candidate;
            } else {
                log(`> Discarding invalid candidate: "${candidate}"`);
            }
        }

        log('> All username candidates in the batch were invalid. Fetching a new batch...');
    }
}

