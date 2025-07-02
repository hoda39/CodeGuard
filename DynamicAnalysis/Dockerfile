FROM ubuntu:20.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install only essential system dependencies with better error handling
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    valgrind \
    gdb \
    git \
    python3 \
    libasan5 \
    libubsan1 \
    libtsan0 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install AFL++ with better error handling
RUN git clone https://github.com/AFLplusplus/AFLplusplus.git /tmp/aflplusplus \
    && cd /tmp/aflplusplus \
    && make distrib \
    && make install \
    && cd / \
    && rm -rf /tmp/aflplusplus

# Create analysis script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
if [ "$1" = "analyze" ]; then\n\
    shift\n\
    input_file="$1"\n\
    \n\
    if [ ! -f "$input_file" ]; then\n\
        echo "Error: Input file $input_file not found" >&2\n\
        exit 1\n\
    fi\n\
    \n\
    # Get file extension\n\
    ext="${input_file##*.}"\n\
    \n\
    # Compile with sanitizers\n\
    if [ "$ext" = "cpp" ] || [ "$ext" = "cc" ]; then\n\
        compiler="g++"\n\
    else\n\
        compiler="gcc"\n\
    fi\n\
    \n\
    # Create output directory\n\
    output_dir="/tmp/analysis_output"\n\
    mkdir -p "$output_dir"\n\
    \n\
    # Compile with AddressSanitizer\n\
    echo "Compiling with AddressSanitizer..."\n\
    $compiler -fsanitize=address -fno-omit-frame-pointer -g -O0 -o "$output_dir/program" "$input_file" 2>&1 || {\n\
        echo "{\"vulnerabilities\": [], \"errors\": [\"Compilation failed\"]}"\n\
        exit 0\n\
    }\n\
    \n\
    # Run with AddressSanitizer\n\
    echo "Running with AddressSanitizer..."\n\
    ASAN_OPTIONS=detect_leaks=1:abort_on_error=1:print_stats=1:log_path="$output_dir/asan" "$output_dir/program" 2>&1 || true\n\
    \n\
    # Check for memory leaks\n\
    if [ -f "$output_dir/asan.*" ]; then\n\
        echo "{\"vulnerabilities\": [{\"type\": \"memory_leak\", \"severity\": \"high\", \"description\": \"Memory leak detected by AddressSanitizer\"}], \"errors\": []}"\n\
    else\n\
        echo "{\"vulnerabilities\": [], \"errors\": []}"\n\
    fi\n\
else\n\
    echo "Usage: $0 analyze <input_file>"\n\
    exit 1\n\
fi' > /usr/local/bin/analyze && chmod +x /usr/local/bin/analyze

# Set working directory
WORKDIR /workspace

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/analyze"] 