import { exec } from 'child_process';
import fs from 'fs';

export async function downloadVideo(videoUrl, outputPath, log) {
    log(`Downloading video from ${videoUrl}...`);
    return new Promise((resolve, reject) => {
        const command = `yt-dlp -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o '${outputPath}' '${videoUrl}'`;
        exec(command, (err, stdout, stderr) => {
            if (err) {
                log('Error downloading video:', stderr);
                return reject(err);
            }
            log(`Video downloaded to ${outputPath}`);
            resolve();
        });
    });
}

export function getDuration(filePath) {
    return new Promise((resolve, reject) => {
        exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${filePath}`, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            resolve(parseFloat(stdout));
        });
    });
}

export async function editVideoReddit(
    backgroundVideoPath,
    questionImagePath,
    answerImagePath,
    questionAudioPath,
    answerAudioPath,
    outputPath,
    config,
    log
) {
    const { width, height, framerate, padding, breakDuration, minSpeedup, maxDuration, preset, crf, videoCodec } = config;
    
    const questionAudioDuration = await getDuration(questionAudioPath);
    const answerAudioDuration = await getDuration(answerAudioPath);
    const backgroundDuration = await getDuration(backgroundVideoPath);
    
    const totalDuration = questionAudioDuration + breakDuration + answerAudioDuration;

    // Calculate outro duration if present
    let outroDuration = 0;
    let baseOutroDuration = 0;
    if (config.outroVideoPath && fs.existsSync(config.outroVideoPath)) {
        outroDuration = await getDuration(config.outroVideoPath);
        baseOutroDuration = outroDuration / config.outroSpeedup;
        log(`> Outro video duration: ${outroDuration}s (base adjusted: ${baseOutroDuration}s with ${config.outroSpeedup}x speedup)`);
    }

    // Include outro in max duration calculation for speedup
    const totalWithOutro = totalDuration + config.outroGap + baseOutroDuration;
    
    if (backgroundDuration < totalWithOutro) {
        log('> Background video is too short for the generated speech and outro.');
        process.exit(1);
    }

    const startTime = Math.random() * (backgroundDuration - totalWithOutro);

    // Calculate speedup based on total duration INCLUDING outro
    const atempo = Math.max(minSpeedup, totalWithOutro / maxDuration);
    log(`> Calculated speedup factor: ${atempo.toFixed(2)}x (including outro in calculation)`);
    
    const mainVideoDuration = totalDuration / atempo;
    // Apply compound speedup to outro: base outro speedup * main video speedup
    const compoundOutroSpeedup = config.outroSpeedup * atempo;
    const finalOutroDuration = outroDuration / compoundOutroSpeedup;
    const finalVideoDuration = mainVideoDuration + config.outroGap + finalOutroDuration;
    
    log(`> Main video duration: ${mainVideoDuration.toFixed(2)}s`);
    if (config.outroVideoPath && fs.existsSync(config.outroVideoPath)) {
        log(`> Outro compound speedup: ${compoundOutroSpeedup.toFixed(2)}x (${config.outroSpeedup}x * ${atempo.toFixed(2)}x)`);
        log(`> Final outro duration: ${finalOutroDuration.toFixed(2)}s`);
        log(`> Total final duration: ${finalVideoDuration.toFixed(2)}s`);
    }

    let inputs = `-i ${backgroundVideoPath} -i ${questionImagePath} -i ${answerImagePath} -i ${questionAudioPath} -i ${answerAudioPath}`;
    let filterComplex = `
    [0:v]trim=start=${startTime}:duration=${finalVideoDuration},scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setpts=PTS-STARTPTS[bg_full];
    [1:v]scale=${width - padding * 2}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black@0.0,setpts=PTS-STARTPTS[q_img];
    [2:v]scale=${width - padding * 2}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black@0.0,setpts=PTS-STARTPTS[a_img];
    [bg_full][q_img]overlay=enable='between(t,0,${questionAudioDuration / atempo})'[bg1];
    [bg1][a_img]overlay=enable='between(t,${(questionAudioDuration + breakDuration) / atempo},${mainVideoDuration})'[v_with_content];
    [3:a]atempo=${atempo},adelay=0|0[q_a];
    [4:a]atempo=${atempo},adelay=${((questionAudioDuration / atempo) + breakDuration) * 1000}|${((questionAudioDuration / atempo) + breakDuration) * 1000}[a_a];
    [q_a][a_a]amix=inputs=2[a_main]
  `;
    
    let videoChainEnd = '[v_with_content]';
    let audioChainEnd = '[a_main]';

    if (config.outroVideoPath && fs.existsSync(config.outroVideoPath)) {
        log('> Outro video found, processing...');
        log(`> Outro chroma color: "${config.outroChromaColor}"`);
        inputs += ` -i ${config.outroVideoPath}`;
        
        const outroVideoFilters = [];
        if (compoundOutroSpeedup !== 1.0) {
            outroVideoFilters.push(`setpts=PTS/${compoundOutroSpeedup}`);
        }
        
        if (config.outroChromaColor && config.outroChromaColor.trim() !== '') {
            log(`> Applying chroma key: color=${config.outroChromaColor}, similarity=${config.outroChromaTolerance}`);
            outroVideoFilters.push(`format=yuva444p`);
            outroVideoFilters.push(`chromakey=color=${config.outroChromaColor}:similarity=${config.outroChromaTolerance}:blend=0.1`);
        }
        
        const scaleOption = config.outroScale === 'cover' 
            ? `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`
            : `scale=${width - config.outroPadding * 2}:${height - config.outroPadding * 2}:force_original_aspect_ratio=decrease`;
        outroVideoFilters.push(scaleOption);
        outroVideoFilters.push(`setpts=PTS-STARTPTS`);

        const outroStartTime = mainVideoDuration + config.outroGap;
        const xPos = config.outroScale === 'cover' ? '0' : `(W-w)/2`;
        const yPos = config.outroScale === 'cover' ? '0' : `(H-h)/2`;
        
        filterComplex += `;
            ${videoChainEnd}format=yuva444p[main_v_alpha];
            [5:v]${outroVideoFilters.join(',')}[outro_v_processed];
            [outro_v_processed]setpts=PTS+${outroStartTime}/TB[outro_v_timed];
            [main_v_alpha][outro_v_timed]overlay=x=${xPos}:y=${yPos}:enable='between(t,${outroStartTime},${outroStartTime + finalOutroDuration})'[v_with_outro]
        `;
        videoChainEnd = '[v_with_outro]';

        if (config.outroMute) {
            filterComplex += `;${audioChainEnd}apad=pad_dur=${config.outroGap + finalOutroDuration}[final_audio]`;
            audioChainEnd = '[final_audio]';
        } else {
            const outroAudioFilters = [];
            if (compoundOutroSpeedup !== 1.0) {
                outroAudioFilters.push(`atempo=${compoundOutroSpeedup}`);
            }
            const delayMs = Math.round(outroStartTime * 1000);
            outroAudioFilters.push(`adelay=${delayMs}|${delayMs}`);
            
            filterComplex += `;
                [5:a]${outroAudioFilters.join(',')}[a_outro_delayed];
                ${audioChainEnd}apad=pad_dur=${config.outroGap + finalOutroDuration}[a_main_padded];
                [a_main_padded][a_outro_delayed]amix=inputs=2:duration=longest[final_audio]
            `;
            audioChainEnd = '[final_audio]';
        }
    }

    filterComplex += `;${videoChainEnd}format=yuv420p[final_video]`;

    const finalVideoMap = "-map '[final_video]'";
    const finalAudioMap = `-map '${audioChainEnd}'`;

    const command = `
    ffmpeg ${inputs} \\
    -filter_complex "${filterComplex.replace(/\s+/g, ' ')}" \\
    ${finalVideoMap} ${finalAudioMap} \\
    -r ${framerate} -c:v ${videoCodec} -preset ${preset} -crf ${crf} -c:a aac -y ${outputPath}
  `;

    return new Promise((resolve, reject) => {
        log('> Starting final video composition with ffmpeg...');
        exec(command, (err, stdout, stderr) => {
            if (err) {
                log('> FFmpeg error:', stderr);
                return reject(new Error(`FFmpeg final composition error: ${stderr}`));
            }
            log(`> Final video saved to ${outputPath}`);
            resolve();
        });
    });
}

export async function editVideoTIL(
    backgroundVideoPath,
    tilImagePath,
    tilAudioPath,
    outputPath,
    config,
    log
) {
    const { width, height, framerate, padding, minSpeedup, maxDuration, preset, crf, videoCodec } = config;
    
    const tilAudioDuration = await getDuration(tilAudioPath);
    const backgroundDuration = await getDuration(backgroundVideoPath);

    // Calculate outro duration if present
    let outroDuration = 0;
    let baseOutroDuration = 0;
    if (config.outroVideoPath && fs.existsSync(config.outroVideoPath)) {
        outroDuration = await getDuration(config.outroVideoPath);
        baseOutroDuration = outroDuration / config.outroSpeedup;
        log(`> Outro video duration: ${outroDuration}s (base adjusted: ${baseOutroDuration}s with ${config.outroSpeedup}x speedup)`);
    }

    // Include outro in max duration calculation for speedup
    const totalWithOutro = tilAudioDuration + config.outroGap + baseOutroDuration;
    
    if (backgroundDuration < totalWithOutro) {
        log('> Background video is too short for the generated speech and outro.');
        process.exit(1);
    }

    const startTime = Math.random() * (backgroundDuration - totalWithOutro);

    // Calculate speedup
    const atempo = Math.max(minSpeedup, totalWithOutro / maxDuration);
    log(`> Calculated speedup factor: ${atempo.toFixed(2)}x (including outro in calculation)`);
    
    const mainVideoDuration = tilAudioDuration / atempo;
    const compoundOutroSpeedup = config.outroSpeedup * atempo;
    const finalOutroDuration = outroDuration / compoundOutroSpeedup;
    const finalVideoDuration = mainVideoDuration + config.outroGap + finalOutroDuration;
    
    log(`> Main video duration: ${mainVideoDuration.toFixed(2)}s`);
    if (config.outroVideoPath && fs.existsSync(config.outroVideoPath)) {
        log(`> Outro compound speedup: ${compoundOutroSpeedup.toFixed(2)}x (${config.outroSpeedup}x * ${atempo.toFixed(2)}x)`);
        log(`> Final outro duration: ${finalOutroDuration.toFixed(2)}s`);
        log(`> Total final duration: ${finalVideoDuration.toFixed(2)}s`);
    }

    let inputs = `-i ${backgroundVideoPath} -i ${tilImagePath} -i ${tilAudioPath}`;
    let filterComplex = `
    [0:v]trim=start=${startTime}:duration=${finalVideoDuration},scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setpts=PTS-STARTPTS[bg_full];
    [1:v]scale=${width - padding * 2}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black@0.0,setpts=PTS-STARTPTS[til_img];
    [bg_full][til_img]overlay=enable='between(t,0,${mainVideoDuration})'[v_with_content];
    [2:a]atempo=${atempo}[a_main]
  `;
    
    let videoChainEnd = '[v_with_content]';
    let audioChainEnd = '[a_main]';

    if (config.outroVideoPath && fs.existsSync(config.outroVideoPath)) {
        log('> Outro video found, processing...');
        inputs += ` -i ${config.outroVideoPath}`;
        
        const outroVideoFilters = [];
        if (compoundOutroSpeedup !== 1.0) {
            outroVideoFilters.push(`setpts=PTS/${compoundOutroSpeedup}`);
        }
        
        if (config.outroChromaColor && config.outroChromaColor.trim() !== '') {
            log(`> Applying chroma key: color=${config.outroChromaColor}, similarity=${config.outroChromaTolerance}`);
            outroVideoFilters.push(`format=yuva444p`);
            outroVideoFilters.push(`chromakey=color=${config.outroChromaColor}:similarity=${config.outroChromaTolerance}:blend=0.1`);
        }
        
        const scaleOption = config.outroScale === 'cover' 
            ? `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`
            : `scale=${width - config.outroPadding * 2}:${height - config.outroPadding * 2}:force_original_aspect_ratio=decrease`;
        outroVideoFilters.push(scaleOption);
        outroVideoFilters.push(`setpts=PTS-STARTPTS`);

        const outroStartTime = mainVideoDuration + config.outroGap;
        const xPos = config.outroScale === 'cover' ? '0' : `(W-w)/2`;
        const yPos = config.outroScale === 'cover' ? '0' : `(H-h)/2`;
        
        filterComplex += `;
            ${videoChainEnd}format=yuva444p[main_v_alpha];
            [3:v]${outroVideoFilters.join(',')}[outro_v_processed];
            [outro_v_processed]setpts=PTS+${outroStartTime}/TB[outro_v_timed];
            [main_v_alpha][outro_v_timed]overlay=x=${xPos}:y=${yPos}:enable='between(t,${outroStartTime},${outroStartTime + finalOutroDuration})'[v_with_outro]
        `;
        videoChainEnd = '[v_with_outro]';

        if (config.outroMute) {
            filterComplex += `;${audioChainEnd}apad=pad_dur=${config.outroGap + finalOutroDuration}[final_audio]`;
            audioChainEnd = '[final_audio]';
        } else {
            const outroAudioFilters = [];
            if (compoundOutroSpeedup !== 1.0) {
                outroAudioFilters.push(`atempo=${compoundOutroSpeedup}`);
            }
            const delayMs = Math.round(outroStartTime * 1000);
            outroAudioFilters.push(`adelay=${delayMs}|${delayMs}`);
            
            filterComplex += `;
                [3:a]${outroAudioFilters.join(',')}[a_outro_delayed];
                ${audioChainEnd}apad=pad_dur=${config.outroGap + finalOutroDuration}[a_main_padded];
                [a_main_padded][a_outro_delayed]amix=inputs=2:duration=longest[final_audio]
            `;
            audioChainEnd = '[final_audio]';
        }
    }

    filterComplex += `;${videoChainEnd}format=yuv420p[final_video]`;

    const finalVideoMap = "-map '[final_video]'";
    const finalAudioMap = `-map '${audioChainEnd}'`;

    const command = `
    ffmpeg ${inputs} \\
    -filter_complex "${filterComplex.replace(/\s+/g, ' ')}" \\
    ${finalVideoMap} ${finalAudioMap} \\
    -r ${framerate} -c:v ${videoCodec} -preset ${preset} -crf ${crf} -c:a aac -y ${outputPath}
  `;

    return new Promise((resolve, reject) => {
        log('> Starting final video composition with ffmpeg...');
        exec(command, (err, stdout, stderr) => {
            if (err) {
                log('> FFmpeg error:', stderr);
                return reject(new Error(`FFmpeg final composition error: ${stderr}`));
            }
            log(`> Final video saved to ${outputPath}`);
            resolve();
        });
    });
}

