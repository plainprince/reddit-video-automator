# Video Types

The Reddit Video Automator supports four distinct video formats, each with unique characteristics and use cases.

## Overview

| Type | Format | Cards | Best For |
|------|--------|-------|----------|
| Reddit | Q&A | 2 cards | Story-driven content |
| AITA | Judgment | 2 cards | Moral dilemmas |
| TIL | Educational | 1 card | Quick facts |
| Today | Historical | 1 card | Date-specific events |

## Reddit Videos

**Type:** `--video-type reddit`

Classic AskReddit-style videos featuring engaging questions and compelling story-based answers.

### Features

- **Two-card format**: Question card followed by answer card
- **Question styles**: "Have you ever..." or "If you could..." formats
- **Story structure**: Narrative unfolding or hypothetical exploration
- **Duplicate detection**: Tracks question history to avoid repeats
- **Dynamic usernames**: AI-generated Reddit-style usernames
- **Profile pictures**: Auto-generated user avatars

### Question Formats

**"Have you ever..." Questions:**
- "Have you ever walked into your home and known something wasn't right?"
- "Have you ever had a gut feeling that saved your life?"
- "Have you ever witnessed something you can't explain?"

**"If you could..." Questions:**
- "If you could have any mundane superpower, what would it be?"
- "If you could change one decision from your past, what would it be?"
- "If you could know the absolute truth to one question, what would you ask?"

### Story Structure

**Narrative Unfolding (for "Have you ever..."):**
1. Direct answer to the question
2. Context and setup
3. Main narrative
4. Plot twist or climax
5. Aftermath and resolution
6. Concluding thought
7. Optional fun fact

**Hypothetical Exploration (for "If you could..."):**
1. Initial choice
2. Immediate consequence
3. Unfolding scenario
4. Twist or realization
5. Final reflection

### Usage

```bash
# Generate Reddit video
bun index.js --video-type reddit

# With custom question
bun index.js --video-type reddit -q "Have you ever had a paranormal experience?"

# Multiple videos
bun index.js --video-type reddit --count 5
```

### Example Output

**Question Card:**
```
u/CuriousExplorer42
Have you ever walked into your home and known something wasn't right?
```

**Answer Card:**
```
u/StoryTeller99
So my cat literally saved my dad's life.
It was a few years back; my mom was at work...
[Full story continues]
```

## AITA Videos

**Type:** `--video-type aita`

"Am I The Asshole" style videos featuring moral dilemmas and judgment-based responses.

### Features

- **Two-card format**: Question card with scenario, answer card with judgment
- **AITA-specific prompts**: Controversial, relatable moral scenarios
- **Judgment verdicts**: YTA, NTA, ESH, NAH
- **Moral reasoning**: Multi-perspective analysis
- **Duplicate detection**: Prevents repeated scenarios
- **Reddit-style presentation**: Same visual style as Reddit videos

### Judgment Types

- **YTA** (You're The Asshole) - The poster is at fault
- **NTA** (Not The Asshole) - The poster is justified
- **ESH** (Everyone Sucks Here) - All parties are wrong
- **NAH** (No Assholes Here) - No one is at fault

### Question Format

All questions start with "AITA for..." followed by a controversial action:
- "AITA for refusing to give up my airplane seat to a family?"
- "AITA for calling the police on my neighbor's party at 10 PM?"
- "AITA for not inviting my sister to my wedding?"

### Response Structure

1. **Verdict** - Clear judgment (YTA/NTA/ESH/NAH)
2. **Context** - Background and relationship dynamics
3. **The Incident** - Detailed description of the conflict
4. **Multiple Perspectives** - Why different views exist
5. **Reasoning** - Explanation of the judgment
6. **Considerations** - Complicating factors
7. **Conclusion** - Final wisdom or reinforcement

### Usage

```bash
# Generate AITA video
bun index.js --video-type aita

# Multiple AITA videos
bun index.js --video-type aita --count 3

# With custom scenario
bun index.js --video-type aita -q "AITA for refusing to babysit my nephew?"
```

### Example Output

**Question Card:**
```
u/ThrowRA_12345
AITA for refusing to give up my airplane seat to a family?
```

**Answer Card:**
```
u/JudgmentDay88
NTA. You paid for that specific seat in advance.
So I was flying cross-country for a work conference...
[Full judgment and reasoning continues]
```

## TIL Videos

**Type:** `--video-type til`

"Today I Learned" educational videos featuring fascinating facts across various categories.

### Features

- **Single-card format**: One card with the complete fact
- **Multiple categories**: 15+ educational categories
- **Engaging presentation**: Conversational storytelling style
- **Surprising twists**: Facts include unexpected elements
- **Educational value**: Informative and entertaining

### Categories

Available categories (random if not specified):
- Science
- History
- Technology
- Nature
- Space
- Human body
- Animals
- Geography
- Physics
- Psychology
- Ancient civilizations
- Inventions
- Medicine
- Ocean
- Climate

### Content Structure

1. **Opening** - "Today I learned that..." or "TIL that..."
2. **Main fact** - Core information with specific details
3. **Context** - Supporting information and numbers
4. **Surprising element** - Unexpected twist or additional info
5. **Conclusion** - Memorable ending

### Usage

```bash
# Generate TIL video (random category)
bun index.js --video-type til

# Specific category
bun index.js --video-type til --til-category science

# Multiple TIL videos
bun index.js --video-type til --count 3 --til-category history
```

### Example Output

```
u/FactFinder42
Today I learned that octopuses have three hearts and blue blood. 
Two of the hearts pump blood to the gills, while the third pumps 
it to the rest of the body. But here's the wild part: when an 
octopus swims, the heart that delivers blood to the body actually 
stops beating...
[Fact continues]
```

## Today Videos

**Type:** `--video-type today`

"Today in History" videos highlighting historical events, inventions, or special days.

### Features

- **Single-card format**: One card with historical content
- **Date-specific**: Tied to a specific calendar date
- **Three content types**: Events, inventions, or special days
- **Caps Lock Day**: Special handling for October 22 (all caps)
- **Scheduling support**: Generate videos for future dates

### Content Types

**Historical Events:**
- "Today, on the 15th of April, the Titanic sank in 1912..."

**Inventions/Discoveries:**
- "Today, on the 28th of February, DNA was discovered by Watson and Crick in 1953..."

**Special Days:**
- "Today, on the 1st of January, we celebrate New Year's Day..."

### Special Features

**Caps Lock Day (October 22):**
- Entire content written in CAPITAL LETTERS
- Focuses specifically on Caps Lock Day celebration
- Includes internet culture references

### Usage

```bash
# Generate for today's date
bun index.js --video-type today

# Specific date
bun index.js --video-type today --date 2024-12-25

# Caps Lock Day
bun index.js --video-type today --date 2024-10-22
```

### Example Output

**Regular Day:**
```
u/HistoryBuff2024
Today, on the 15th of April, the Titanic sank in 1912, marking 
one of the deadliest maritime disasters in history. The "unsinkable" 
ship struck an iceberg at 11:40 PM and sank less than three hours 
later...
[Historical content continues]
```

**Caps Lock Day:**
```
u/CAPSLOCK_ENTHUSIAST
TODAY, ON THE 22ND OF OCTOBER, IS CAPS LOCK DAY, INVENTED TO 
CELEBRATE THE MIGHTY CAPS LOCK KEY. THIS SPECIAL DAY ENCOURAGES 
EVERYONE TO TYPE IN ALL CAPS...
[ALL CAPS CONTENT CONTINUES]
```

## Choosing the Right Video Type

### Use Reddit when:
- You want story-driven, narrative content
- Audience enjoys personal experiences
- You need emotional engagement
- Content should feel authentic and relatable

### Use AITA when:
- You want controversial, debate-worthy content
- Audience enjoys moral discussions
- You need high engagement and comments
- Content should spark conversation

### Use TIL when:
- You want educational, fact-based content
- Audience enjoys learning new things
- You need quick, digestible information
- Content should be surprising and memorable

### Use Today when:
- You want date-specific content
- You're scheduling content in advance
- Audience enjoys historical information
- You need evergreen content for specific dates

## Mixing Video Types

For maximum audience engagement, mix different video types:

**Daily Schedule (uploader.js default):**
- 3 Reddit videos - storytelling
- 3 AITA videos - controversy
- 3 TIL videos - education
- 1 Today video - historical context

**Bulk Generation (createVideos.sh default):**
- 21 Reddit videos over 7 days
- 21 AITA videos over 7 days
- 21 TIL videos over 7 days
- 7 Today videos (one per day)

This mix provides variety and appeals to different audience preferences.

