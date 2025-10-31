#!/bin/bash

# Create Videos Script
# Generates 7 days * (3 reddit + 3 til + 3 aita + 1 today) = 70 videos total
# Modifies only VIDEO_TYPE, COUNT, and DATE in .env, keeps all other settings

echo "Starting bulk video generation..."
echo "Target: 70 videos (7 days x [3 reddit + 3 til + 3 aita + 1 today])"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "[ERROR] .env file not found!"
    echo "Please create a .env file with your configuration."
    exit 1
fi

# Backup original .env
cp .env .env.backup
echo "[OK] Backed up .env to .env.backup"
echo ""

# Counter for progress
total_videos=0
day=1

# Loop through 7 days
for day in {1..7}; do
    echo "========================================"
    echo "Day $day of 7"
    echo "========================================"
    
    # Calculate the date for "today" videos (current date + day offset)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        target_date=$(date -v+${day}d '+%Y-%m-%d')
    else
        # Linux
        target_date=$(date -d "+${day} days" '+%Y-%m-%d')
    fi
    
    # Generate 3 Reddit videos
    echo ""
    echo "[Reddit] Generating 3 Reddit videos for Day $day..."
    
    # Update .env for Reddit videos
    sed -i.tmp 's/^VIDEO_TYPE=.*/VIDEO_TYPE=reddit/' .env
    sed -i.tmp 's/^COUNT=.*/COUNT=3/' .env
    rm .env.tmp 2>/dev/null
    
    # Generate Reddit videos
    if bun index.js --dotenv-path .env; then
        total_videos=$((total_videos + 3))
        echo "[OK] Reddit videos complete! ($total_videos/70 total)"
    else
        echo "[FAIL] Failed to generate Reddit videos for Day $day"
    fi
    
    # Generate 3 TIL videos
    echo ""
    echo "[TIL] Generating 3 TIL videos for Day $day..."
    
    # Update .env for TIL videos
    sed -i.tmp 's/^VIDEO_TYPE=.*/VIDEO_TYPE=til/' .env
    sed -i.tmp 's/^COUNT=.*/COUNT=3/' .env
    rm .env.tmp 2>/dev/null
    
    # Generate TIL videos
    if bun index.js --dotenv-path .env; then
        total_videos=$((total_videos + 3))
        echo "[OK] TIL videos complete! ($total_videos/70 total)"
    else
        echo "[FAIL] Failed to generate TIL videos for Day $day"
    fi
    
    # Generate 3 AITA videos
    echo ""
    echo "[AITA] Generating 3 AITA videos for Day $day..."
    
    # Update .env for AITA videos
    sed -i.tmp 's/^VIDEO_TYPE=.*/VIDEO_TYPE=aita/' .env
    sed -i.tmp 's/^COUNT=.*/COUNT=3/' .env
    rm .env.tmp 2>/dev/null
    
    # Generate AITA videos
    if bun index.js --dotenv-path .env; then
        total_videos=$((total_videos + 3))
        echo "[OK] AITA videos complete! ($total_videos/70 total)"
    else
        echo "[FAIL] Failed to generate AITA videos for Day $day"
    fi
    
    # Generate 1 "Today" video with specific date
    echo ""
    echo "[Today] Generating 1 'Today' video for Day $day (date: $target_date)..."
    
    # Update .env for Today videos
    sed -i.tmp 's/^VIDEO_TYPE=.*/VIDEO_TYPE=today/' .env
    sed -i.tmp 's/^COUNT=.*/COUNT=1/' .env
    # Add or update DATE line
    if grep -q "^DATE=" .env; then
        sed -i.tmp "s/^DATE=.*/DATE=$target_date/" .env
    else
        echo "DATE=$target_date" >> .env
    fi
    rm .env.tmp 2>/dev/null
    
    # Generate Today video
    if bun index.js --dotenv-path .env; then
        total_videos=$((total_videos + 1))
        echo "[OK] Today video complete! ($total_videos/70 total)"
    else
        echo "[FAIL] Failed to generate Today video for Day $day"
    fi
    
    echo ""
    echo "[OK] Day $day complete! Progress: $total_videos/70 videos"
    echo ""
    
    # Optional: Add a small delay between days to avoid overwhelming the system
    if [ $day -lt 7 ]; then
        echo "Pausing for 2 seconds before next day..."
        sleep 2
    fi
done

# Restore original .env
echo ""
echo "========================================"
echo "Bulk generation complete!"
echo "========================================"
echo "Total videos generated: $total_videos/70"
echo "Restoring original .env..."

mv .env.backup .env

echo "[OK] Original .env restored"
echo ""
echo "Videos saved in: ./output/"
echo "To view all videos: ls -lh output/"

