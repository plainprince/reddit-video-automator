import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function checkCoquiPrerequisites(scriptDir, log) {
    log('> Checking Coqui TTS prerequisites...');
    const pythonVersion = await getPythonVersion();

    if (!pythonVersion) {
        console.error('> Python 3.10 or 3.11 is not installed.');
        if (process.platform === 'darwin') {
            if (isBrewInstalled()) {
                console.log('> Attempting to install Python 3.10 with Homebrew...');
                try {
                    execSync('brew install python@3.10', { stdio: 'inherit' });
                    console.log('> Python 3.10 installed successfully.');
                } catch (error) {
                    console.error('> Failed to install Python 3.10 with Homebrew.');
                    process.exit(1);
                }
            } else {
                console.error('> Homebrew is not installed. Please install it to automatically install Python.');
                process.exit(1);
            }
        } else {
            console.error('> Please install Python 3.10 or 3.11 to use Coqui TTS.');
            process.exit(1);
        }
    }

    if (!isEspeakInstalled()) {
        console.error('> espeak is not installed.');
        if (process.platform === 'darwin' && isBrewInstalled()) {
            console.log('> Attempting to install espeak with Homebrew...');
            try {
                execSync('brew install espeak', { stdio: 'inherit' });
                console.log('> espeak installed successfully.');
            } catch (error) {
                console.error('> Failed to install espeak with Homebrew.');
                process.exit(1);
            }
        } else {
            console.error('> Please install espeak to use Coqui TTS.');
            process.exit(1);
        }
    }

    const venvPath = path.join(scriptDir, '.venv');
    if (!fs.existsSync(venvPath)) {
        console.log('> Creating Python virtual environment...');
        try {
            execSync(`${pythonVersion} -m venv ${venvPath}`, { stdio: 'inherit' });
            console.log('> Virtual environment created.');
        } catch (error) {
            console.error('> Failed to create virtual environment.');
            process.exit(1);
        }
    }

    try {
        execSync(`${path.join(venvPath, 'bin', 'python')} -m pip show TTS`, { stdio: 'ignore' });
        log('> Coqui TTS is already installed in the virtual environment.');
    } catch (error) {
        console.log('> Coqui TTS is not installed. Installing now...');
        try {
            execSync(`${path.join(venvPath, 'bin', 'python')} -m pip install TTS`, { stdio: 'inherit' });
            console.log('> Coqui TTS installed successfully.');
        } catch (installError) {
            console.error('> Failed to install Coqui TTS.');
            process.exit(1);
        }
    }

    log('> All Coqui TTS prerequisites are met.');
}

function getPythonVersion() {
    try {
        const version = execSync('python3.10 --version', { encoding: 'utf8' });
        if (version.includes('Python 3.10')) return 'python3.10';
    } catch (error) {
        // ignore
    }

    try {
        const version = execSync('python3.11 --version', { encoding: 'utf8' });
        if (version.includes('Python 3.11')) return 'python3.11';
    } catch (error) {
        // ignore
    }

    return null;
}

function isBrewInstalled() {
    try {
        execSync('command -v brew', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

function isEspeakInstalled() {
    try {
        execSync('command -v espeak', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

