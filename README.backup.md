# Reddit Video Automator

This script automates the creation of Reddit-style "AskReddit" videos, from generating content using AI to compiling the final video.

## Features

- **AI-Powered Content Generation**: Uses an OpenAI-compatible API (like Ollama) to generate unique Reddit questions and engaging stories.
- **Multiple TTS Options**: Supports ElevenLabs, Microsoft Edge TTS (`edge-tts`), and Google TTS (`gtts`), with automatic fallbacks.
- **Customizable Video Output**: Control video resolution, framerate, and quality.
- **Dynamic User Profiles**: Automatically generates Reddit-style usernames and profile pictures.
- **Flexible Configuration**: Configure all options via command-line flags or a `.env` file.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/reddit-video-automator.git
    cd reddit-video-automator
    ```

2.  **Install dependencies:**
    This project uses `bun` as the runtime.
    ```bash
    bun install
    ```

3.  **Install FFmpeg:**
    FFmpeg is required for video processing.
    -   **macOS (via Homebrew):** `brew install ffmpeg`
    -   **Ubuntu/Debian:** `sudo apt-get install ffmpeg`
    -   **Windows (via Chocolatey):** `choco install ffmpeg`

## Usage

Run the script using `bun`:

```bash
bun index.js [options]
```

### Examples

-   **Generate a single video with default settings:**
    ```bash
    bun index.js
    ```

-   **Generate 5 videos:**
    ```bash
    bun index.js -c 5
    ```

-   **Use a specific AI model and provide your own question:**
    ```bash
    bun index.js --model "llama3:latest" -q "What's the riskiest thing you've ever done?"
    ```

-   **Use ElevenLabs for high-quality TTS:**
    ```bash
    bun index.js --elevenlabs-api-key "YOUR_ELEVENLABS_KEY"
    ```

-   **Use Google TTS instead of Edge TTS:**
    ```bash
    bun index.js --tts-service google
    ```

-   **Use a `.env` file for configuration:**
    ```bash
    bun index.js --dotenv-path ./.env.custom
    ```

-   **Add a custom outro video with green screen removal:**
    ```bash
    bun index.js --outro-video-path ./my-outro.mp4 --outro-chroma-color green --outro-gap 2 --outro-mute
    ```

-   **Use hardware acceleration (recommended for Apple Silicon):**
    ```bash
    bun index.js --video-codec hevc_videotoolbox
    ```

-   **Generate "Today in History" videos:**
    ```bash
    # Generate video for today's date
    bun index.js --video-type today
    
    # Generate video for a specific date
    bun index.js --video-type today --date 2024-10-22
    
    # Caps Lock Day (October 22) will be automatically detected!
    bun index.js --video-type today --date 2024-10-22
    ```

## Video Types

The script supports four types of videos:

### Reddit Videos (`--video-type reddit`)
Classic AskReddit-style videos with a question and answer format. The AI generates engaging questions like "Have you ever..." or "If you could..." and creates compelling stories in response.

**Features:**
- Question and answer format with two separate cards
- Reddit-style usernames and profile pictures
- Story validation for length requirements
- Duplicate question detection via title history

### AITA Videos (`--video-type aita`)
"Am I The Asshole" style moral dilemma videos with a question and judgment format. The AI generates controversial scenarios starting with "AITA for..." and provides responses with verdicts (YTA/NTA/ESH/NAH) followed by detailed reasoning.

**Features:**
- Question and answer format with two separate cards (same as Reddit videos)
- AITA-specific question prompts for controversial scenarios
- Judgment verdicts: YTA (You're The Asshole), NTA (Not The Asshole), ESH (Everyone Sucks Here), NAH (No Assholes Here)
- Moral reasoning and multiple perspectives in responses
- Reddit-style usernames and profile pictures
- Story validation for length requirements
- Duplicate question detection via title history

### TIL Videos (`--video-type til`)
"Today I Learned" style educational content. The AI generates fascinating facts across various categories.

**Features:**
- Single card format with interesting facts
- Multiple categories: science, history, technology, nature, space, etc.
- Educational and entertaining content
- Approximately 100-350 words per fact

### Today Videos (`--video-type today`)
"Today in History" videos that highlight historical events, inventions, or special days that occurred on a specific date.

**Features:**
- Single card format similar to TIL videos
- Date-specific historical content
- Three types of content: historical events, inventions/discoveries, or special days
- Special handling for Caps Lock Day (October 22) - writes everything in CAPS
- Customize the date with the `--date` flag for scheduling content

**Example content types:**
- "Today, on the 15th of April, the Titanic sank in 1912..."
- "Today, on the 1st of January, we celebrate New Year's Day, a tradition that dates back..."
- "Today, on the 22nd of October, is Caps Lock Day, invented by..."

## YouTube Uploader

The `uploader.js` script automates daily video uploads to YouTube. It generates videos using the main script and uploads them on a schedule.

### Features

- OAuth 2.0 authentication with YouTube API
- Automatic daily uploads at 10:00 AM (local timezone)
- Generates and uploads 10 videos per day: 3 Reddit, 3 TIL, 3 AITA, 1 Today
- Automatic video title indexing
- Upload retry logic with error handling
- Manual upload mode for existing videos

### Setup

See [uploader.md](./uploader.md) for detailed setup instructions including:
- Creating a Google Cloud Project
- Enabling YouTube Data API v3
- Configuring OAuth credentials
- Authentication process
- Troubleshooting common errors (especially "Access blocked")

**Quick setup check:**
```bash
bun check-setup.js
```

### Usage

**Setup Authentication:**
```bash
bun uploader.js --setup-auth
```

**Upload Existing Videos:**
```bash
bun uploader.js --upload-only
```

**Generate and Upload Once:**
```bash
bun uploader.js --run-once
```

**Start Daily Automation:**
```bash
bun uploader.js
```

The uploader will:
1. Clean the output folder
2. Generate 3 Reddit videos
3. Generate 3 TIL videos
4. Generate 3 AITA videos
5. Generate 1 Today video (with current date)
6. Upload all videos to YouTube
7. Clean up successfully uploaded videos
8. Schedule next run for 10:00 AM the next day

### Configuration

Create a `uploader.env` file with:
```env
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REFRESH_TOKEN=will_be_set_automatically
VIDEO_INDEX=1
```

The `VIDEO_INDEX` automatically increments after each successful upload.

## Shell Scripts

The repository includes several helper scripts to automate common tasks:

### `createVideos.sh`
Bulk video generation script that creates multiple videos across multiple days.

**What it does:**
- Generates 7 days worth of videos (70 total by default: 21 Reddit + 21 TIL + 21 AITA + 7 Today)
- Creates 3 Reddit videos per day
- Creates 3 TIL videos per day
- Creates 3 AITA videos per day
- Creates 1 "Today" video per day (with dates offset from current date)
- Automatically modifies `.env` file to set `VIDEO_TYPE`, `COUNT`, and `DATE`
- Backs up your original `.env` file before starting
- Restores the original `.env` file when complete

**Usage:**
```bash
./createVideos.sh
```

**Requirements:**
- You must have a `.env` file configured before running
- The script will create a `.env.backup` file

### `cleanup.sh`
Removes temporary files created during video generation.

**What it does:**
- Removes the `./audio` directory (temporary audio files)
- Removes the `./images` directory (temporary image files)

**Usage:**
```bash
./cleanup.sh
# OR
bun index.js --cleanup
```

### `deleteAll.sh`
Comprehensive cleanup script that removes all cached and generated content.

**What it does:**
- Removes downloaded background videos (`videos/`)
- Removes temporary files (`temp/`)
- Removes outro videos (`outro-videos/`)
- Removes all generated output videos (`output/`)
- Removes generated images (`images/`)
- Removes generated audio files (`audio/`)
- Removes GUI output files (`gui/public/output/`)

**Usage:**
```bash
./deleteAll.sh
```

**Warning:** This will delete ALL generated videos in the `output/` directory. Use with caution.

## Configuration

All command-line options can be configured using a `.env` file and passing its path via the `--dotenv-path` flag. Environment variable names are listed next to the corresponding command-line flags.

**Note:** Command-line flags will always override settings from a `.env` file.

| Flag                             | Environment Variable            | Description                                                        | Default                               |
| -------------------------------- | ------------------------------- | ------------------------------------------------------------------ | ------------------------------------- |
| `--model`, `-m`                  | `MODEL`                         | The AI model to use for generating text.                           | `llama3.2:1b`                         |
| `--api-endpoint`, `-ae`          | `API_ENDPOINT`                  | OpenAI-compatible API endpoint.                                    | `http://localhost:11434/v1`           |
| `--api-key`, `-ak`               | `API_KEY`                       | API key for the AI service.                                        | `ollama`                              |
| `--question-text`, `-q`          | `QUESTION_TEXT`                 | The text of the Reddit question.                                   | (generated)                           |
| `--response-text`, `-r`          | `RESPONSE_TEXT`                 | The text of the Reddit response.                                   | (generated)                           |
| `--question-username`, `-qu`     | `QUESTION_USERNAME`             | The username for the question.                                     | (generated)                           |
| `--answer-username`, `-au`       | `ANSWER_USERNAME`               | The username for the answer.                                       | (generated)                           |
| `--question-username-image-path` | `QUESTION_USERNAME_IMAGE_PATH`  | Path to the profile image for the question username.               | (generated)                           |
| `--answer-username-image-path`   | `ANSWER_USERNAME_IMAGE_PATH`    | Path to the profile image for the answer username.                 | (generated)                           |
| `--elevenlabs-api-key`, `-ek`    | `ELEVENLABS_API_KEY`            | API key for ElevenLabs TTS.                                        | `null`                                |
| `--tts-service`                  | `TTS_SERVICE`                   | The TTS service to use (`edge` or `google`).                       | `edge`                                |
| `--video-url`, `-v`              | `VIDEO_URL`                     | URL of the YouTube video for the background.                       | (a default parkour video)             |
| `--width`                        | `WIDTH`                         | The width of the output video.                                     | `1080`                                |
| `--height`                       | `HEIGHT`                        | The height of the output video.                                    | `1920`                                |
| `--framerate`, `-fr`             | `FRAMERATE`                     | The framerate of the output video.                                 | `30`                                  |
| `--padding`, `-p`                | `PADDING`                       | The gap between the comment and the screen edge.                   | `100`                                 |
| `--max-duration`, `-md`          | `MAX_DURATION`                  | Maximum video duration in seconds.                                 | `60`                                  |
| `--min-speedup`, `-ms`           | `MIN_SPEEDUP`                   | Minimum audio speedup factor.                                      | `1.5` (1.0 with ElevenLabs)           |
| `--break-duration`, `-bd`        | `BREAK_DURATION`                | Break duration between question and answer in seconds.             | `0.5`                                 |
| `--count`, `-c`                  | `COUNT`                         | How many videos to generate.                                       | `1`                                   |
| `--title-history-path`           | `TITLE_HISTORY_PATH`            | Path to the generated titles JSON file.                            | `./generatedTitles.json`              |
| `--dotenv-path`                  | `DOTENV_PATH`                   | Path to a custom `.env` file.                                      | `null`                                |
| `--answer-at-end`                | `ANSWER_AT_END`                 | Move the direct answer to the end of the story.                    | `false`                               |
| `--min-story-length`             | `MIN_STORY_LENGTH`              | Minimum word count for the generated story.                        | `100`                                 |
| `--max-story-length`             | `MAX_STORY_LENGTH`              | Maximum word count for the generated story.                        | `250`                                 |
| `--generation-retries`           | `GENERATION_RETRIES`            | Number of retries for generating valid content.                    | `10`                                  |
| `--crf`                          | `CRF`                           | The CRF value for ffmpeg (lower is higher quality).                | `23`                                  |
| `--preset`                       | `PRESET`                        | The preset for ffmpeg (e.g., ultrafast, medium, slow).             | `medium`                              |
| `--cleanup`                      |                                 | Run the cleanup script to remove temporary files and exit.         | `false`                               |
| `--output`, `-o`                 | `OUTPUT`                        | The output path for the generated video(s).                        | `./output`                            |
| `--outro-video-path`, `-ovp`     | `OUTRO_VIDEO_PATH`              | Path to a custom video to append at the end.                       | `null`                                |
| `--outro-gap`, `-og`             | `OUTRO_GAP`                     | Time gap in seconds between the main video and the outro video.    | `1.0`                                 |
| `--outro-padding`, `-op`         | `OUTRO_PADDING`                 | Padding from the sides for the outro video.                        | (same as main padding)                |
| `--outro-scale`, `-os`           | `OUTRO_SCALE`                   | How to scale the outro video (cover, contain).                     | `contain`                             |
| `--outro-chroma-color`, `-occ`   | `OUTRO_CHROMA_COLOR`            | Color to make transparent in the outro video (e.g., green, 0x00FF00). | `null`                            |
| `--outro-chroma-tolerance`, `-oct` | `OUTRO_CHROMA_TOLERANCE`      | Chroma key color tolerance (0.01 to 1.0).                          | `0.1`                                 |
| `--outro-mute`, `-om`            | `OUTRO_MUTE`                    | Mute the audio from the outro video.                               | `false`                               |
| `--outro-speedup`, `-osu`        | `OUTRO_SPEEDUP`                 | Speedup factor for the outro video.                                | `1.0`                                 |
| `--video-codec`, `-vc`           | `VIDEO_CODEC`                   | Video codec for ffmpeg encoding (libx264, h264_videotoolbox, hevc_videotoolbox). | `libx264`                    |
| `--video-type`, `-vt`            | `VIDEO_TYPE`                    | Type of video to generate (reddit, til, aita, today).              | `reddit`                              |
| `--til-category`, `-tc`          | `TIL_CATEGORY`                  | Category for TIL videos (science, history, technology, etc.).      | (random)                              |
| `--date`, `-d`                   | `DATE`                          | Date for "today" videos (YYYY-MM-DD format).                       | (current date)                        |
| `--json-output`, `-j`            | `JSON_OUTPUT`                   | Output video details as JSON to stdout and suppress logs.          | `false`                               |
| `--disable-title-history`        | `DISABLE_TITLE_HISTORY`         | Disable reading from or writing to the title history file.         | `false`                               |
| `--help`, `-info`                |                                 | Show the help message.                                             |                                       |

## Cleanup

The script creates temporary files in `./audio`, `./images`, and `./videos`. A cleanup script is provided to remove these files.

To run it, use the `--cleanup` flag:
```bash
bun index.js --cleanup
```