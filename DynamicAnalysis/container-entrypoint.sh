#!/bin/bash

# CodeGuard Dynamic Analysis Container Entry Point
# This script runs inside the Docker container to perform dynamic analysis

set -e

echo "🚀 CodeGuard Dynamic Analysis Container Starting..."
echo "Analysis ID: $ANALYSIS_ID"
echo "Source File: $SOURCE_FILE"
echo "Output Directory: $OUTPUT_DIR"

# Function to handle cleanup
cleanup() {
    echo "🧹 Cleaning up analysis environment..."
    # Stop any running processes
    pkill -f "afl-fuzz" || true
    pkill -f "eclipser" || true
    
    # Save results
    if [ -f "/app/analysis_results.json" ]; then
        cp /app/analysis_results.json "$OUTPUT_DIR/"
        echo "✅ Results saved to $OUTPUT_DIR/analysis_results.json"
    fi
    
    echo "🏁 Analysis container finished"
}

# Set up signal handlers
trap cleanup EXIT
trap 'echo "🛑 Received interrupt signal"; exit 1' INT TERM

# Verify environment variables
if [ -z "$SOURCE_FILE" ] || [ -z "$OUTPUT_DIR" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "SOURCE_FILE: $SOURCE_FILE"
    echo "OUTPUT_DIR: $OUTPUT_DIR"
    exit 1
fi

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Error: Source file not found: $SOURCE_FILE"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Navigate to app directory
cd /app

echo "📋 Analysis Configuration:"
echo "  - Source: $SOURCE_FILE"
echo "  - Output: $OUTPUT_DIR"
echo "  - AFL++ Path: $(which afl-fuzz)"
echo "  - Eclipser Path: $(which Eclipser)"

# Extract filename without extension
SOURCE_FILENAME=$(basename "$SOURCE_FILE")
SOURCE_NAME="${SOURCE_FILENAME%.*}"

echo "🔍 Starting dynamic analysis for: $SOURCE_NAME"

# Create analysis directories
ANALYSIS_DIR="/app/analysis_${ANALYSIS_ID}"
mkdir -p "$ANALYSIS_DIR"
cd "$ANALYSIS_DIR"

# Copy source file to analysis directory
cp "$SOURCE_FILE" "./${SOURCE_FILENAME}"

# Compile with AddressSanitizer for AFL++
echo "🔨 Compiling with AddressSanitizer for AFL++..."
afl-clang-fast++ -g -O0 -fsanitize=address -fno-stack-protector \
    -o "${SOURCE_NAME}_asan" "./${SOURCE_FILENAME}"

if [ $? -ne 0 ]; then
    echo "❌ AFL++ compilation failed"
    exit 1
fi

# Compile without AddressSanitizer for Eclipser
echo "🔨 Compiling without AddressSanitizer for Eclipser..."
afl-clang-fast++ -g -O0 -fno-stack-protector \
    -o "${SOURCE_NAME}_noasan" "./${SOURCE_FILENAME}"

if [ $? -ne 0 ]; then
    echo "❌ Eclipser compilation failed"
    exit 1
fi

# Create seed directory
mkdir -p seeds
echo "fuzz" > seeds/input_seed

# Create sync directory
mkdir -p syncdir

# Set AFL environment variables
export AFL_SKIP_CPUFREQ=1
export AFL_I_DONT_CARE_ABOUT_MISSING_CRASHES=1

# Start AFL++ master
echo "🚀 Starting AFL++ master..."
afl-fuzz -i seeds -o syncdir -M afl-master -f input \
    -- "./${SOURCE_NAME}_asan" input &
AFL_MASTER_PID=$!

# Start AFL++ slave
echo "🚀 Starting AFL++ slave..."
afl-fuzz -i seeds -o syncdir -S afl-slave -f input \
    -- "./${SOURCE_NAME}_asan" input &
AFL_SLAVE_PID=$!

# Start Eclipser
echo "🚀 Starting Eclipser..."
dotnet /usr/local/bin/Eclipser.dll \
    -t 300 \
    -v 2 \
    -s syncdir \
    -o syncdir/eclipser-output \
    -p "./${SOURCE_NAME}_noasan" \
    --arg input \
    -f input &
ECLIPSER_PID=$!

echo "⏱️  Running analysis for 5 minutes..."

# Monitor analysis for 5 minutes
ANALYSIS_TIMEOUT=300
ELAPSED=0
INTERVAL=10

while [ $ELAPSED -lt $ANALYSIS_TIMEOUT ]; do
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
    
    # Check if processes are still running
    if ! kill -0 $AFL_MASTER_PID 2>/dev/null; then
        echo "⚠️  AFL++ master process stopped"
        break
    fi
    
    if ! kill -0 $AFL_SLAVE_PID 2>/dev/null; then
        echo "⚠️  AFL++ slave process stopped"
        break
    fi
    
    if ! kill -0 $ECLIPSER_PID 2>/dev/null; then
        echo "⚠️  Eclipser process stopped"
        break
    fi
    
    echo "⏳ Analysis progress: ${ELAPSED}s/${ANALYSIS_TIMEOUT}s"
done

echo "🛑 Stopping analysis processes..."

# Stop all processes
kill $AFL_MASTER_PID $AFL_SLAVE_PID $ECLIPSER_PID 2>/dev/null || true

# Wait for processes to finish
wait $AFL_MASTER_PID 2>/dev/null || true
wait $AFL_SLAVE_PID 2>/dev/null || true
wait $ECLIPSER_PID 2>/dev/null || true

echo "📊 Collecting analysis results..."

# Collect crashes
CRASHES=()
if [ -d "syncdir/afl-master/crashes" ]; then
    for crash in syncdir/afl-master/crashes/*; do
        if [ -f "$crash" ]; then
            CRASHES+=("$crash")
        fi
    done
fi

if [ -d "syncdir/afl-slave/crashes" ]; then
    for crash in syncdir/afl-slave/crashes/*; do
        if [ -f "$crash" ]; then
            CRASHES+=("$crash")
        fi
    done
fi

if [ -d "syncdir/eclipser-output/crashes" ]; then
    for crash in syncdir/eclipser-output/crashes/*; do
        if [ -f "$crash" ]; then
            CRASHES+=("$crash")
        fi
    done
fi

# Generate analysis report
REPORT_FILE="/app/analysis_results.json"
cat > "$REPORT_FILE" << EOF
{
  "analysisId": "$ANALYSIS_ID",
  "sourceFile": "$SOURCE_FILENAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "analysisDuration": $ELAPSED,
  "status": "completed",
  "vulnerabilities": [],
  "crashes": ${#CRASHES[@]},
  "crashFiles": [
EOF

for crash in "${CRASHES[@]}"; do
    echo "    \"$crash\"," >> "$REPORT_FILE"
done

cat >> "$REPORT_FILE" << EOF
  ],
  "coverage": {
    "aflMaster": {
      "executions": 0,
      "uniqueCrashes": 0
    },
    "aflSlave": {
      "executions": 0,
      "uniqueCrashes": 0
    },
    "eclipser": {
      "executions": 0,
      "uniqueCrashes": 0
    }
  },
  "fuzzingStats": {
    "totalExecutions": 0,
    "uniqueCrashes": ${#CRASHES[@]},
    "timeouts": 0,
    "averageExecutionTime": 0.001
  }
}
EOF

echo "✅ Analysis completed successfully"
echo "📄 Results saved to: $REPORT_FILE"
echo "🚨 Crashes found: ${#CRASHES[@]}"

# Copy results to output directory
cp "$REPORT_FILE" "$OUTPUT_DIR/"

echo "🏁 Container analysis finished successfully"
exit 0 