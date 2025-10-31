import { exec } from 'child_process';
import path from 'path';
import gtts from 'node-gtts';
import { tts } from 'edge-tts';
const ElevenLabsClient = require('elevenlabs-node');

export async function generateSpeech(text, outputPath, config, scriptDir, log) {
    // 1. Try ElevenLabs if the API key is provided
    if (config.elevenlabsApiKey) {
        log('> Using ElevenLabs for TTS...');
        const elevenlabs = new ElevenLabsClient({ apiKey: config.elevenlabsApiKey });
        try {
            await elevenlabs.textToSpeech({
                fileName: outputPath,
                textInput: text,
                voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
                modelId: 'eleven_turbo_v2'
            });
            log(`> ElevenLabs speech saved to ${outputPath}`);
            return; // Success, exit the function
        } catch (error) {
            log('> ElevenLabs API Error: Failed to generate speech.');
            if (error.response && error.response.data && error.response.data.detail) {
                log(`> Details: ${error.response.data.detail.message}`);
            }
            log('> Falling back to other TTS services...');
        }
    }

    const services = {
        coqui: (text, outputPath) => generateCoquiSpeech(text, outputPath, scriptDir, log),
        edge: (text, outputPath) => generateEdgeSpeech(text, outputPath, log),
        google: (text, outputPath) => generateGoogleSpeech(text, outputPath, log)
    };

    const serviceOrder = [
        config.ttsService,
        ...Object.keys(services).filter(s => s !== config.ttsService)
    ];

    for (const serviceName of serviceOrder) {
        try {
            log(`> Using TTS service: ${serviceName.toUpperCase()}`);
            await services[serviceName](text, outputPath);
            return; // Success
        } catch (error) {
            log(`> ${serviceName.toUpperCase()} TTS failed: ${error.message}`);
        }
    }

    log('> All TTS services have failed. Cannot generate speech audio.');
    throw new Error('All TTS services failed');
}

async function generateCoquiSpeech(text, outputPath, scriptDir, log) {
    return new Promise((resolve, reject) => {
        const venvPath = path.join(scriptDir, '.venv');
        const ttsCommand = path.join(venvPath, 'bin', 'tts');
        const command = `${ttsCommand} --text "${text}" --out_path "${outputPath}" --model_name "tts_models/en/ljspeech/tacotron2-DDC"`;
        exec(command, (err, stdout, stderr) => {
            if (err) {
                log('> Coqui TTS Error:', stderr);
                return reject(new Error('Coqui TTS generation failed.'));
            }
            log(`> Coqui TTS speech saved to ${outputPath}`);
            resolve();
        });
    });
}

async function generateEdgeSpeech(text, outputPath, log) {
    const textToSpeak = `<voice name="en-US-JennyNeural">${text}</voice>`;
    
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Edge-TTS generation timed out after 60 seconds.')), 60000)
    );

    await Promise.race([
        tts(textToSpeak, outputPath, { format: "audio-24khz-48kbitrate-mono-mp3" }),
        timeoutPromise
    ]);

    log(`> Edge-TTS speech saved to ${outputPath}`);
}

async function generateGoogleSpeech(text, outputPath, log) {
    const speech = gtts('en-us');
    await new Promise((resolve, reject) => {
        speech.save(outputPath, text, (err) => {
            if (err) return reject(err);
            log(`> Google-TTS speech saved to ${outputPath}`);
            resolve();
        });
    });
}

