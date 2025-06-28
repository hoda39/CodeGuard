# Use Ubuntu 22.04 as base for better compatibility with fuzzing tools
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20
ENV AFL_SKIP_CPUFREQ=1
ENV AFL_I_DONT_CARE_ABOUT_MISSING_CRASHES=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    gcc \
    g++ \
    make \
    cmake \
    python3 \
    python3-pip \
    python3-dev \
    clang \
    llvm \
    llvm-dev \
    libc6-dev \
    libssl-dev \
    pkg-config \
    libtool \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs

# Install Rust (required for CASR)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install .NET Core for Eclipser
RUN wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y dotnet-sdk-6.0

# Create working directory
WORKDIR /app

# Install AFL++
RUN git clone https://github.com/AFLplusplus/AFLplusplus.git /tmp/aflplusplus \
    && cd /tmp/aflplusplus \
    && make distrib \
    && make install \
    && rm -rf /tmp/aflplusplus

# Install Eclipser
RUN git clone https://github.com/SoftSec-KAIST/Eclipser.git /tmp/eclipser \
    && cd /tmp/eclipser \
    && make \
    && cp build/Eclipser /usr/local/bin/ \
    && rm -rf /tmp/eclipser

# Install CASR
RUN git clone https://github.com/ispras/casr.git /tmp/casr \
    && cd /tmp/casr \
    && cargo build --release \
    && cp target/release/casr-* /usr/local/bin/ \
    && rm -rf /tmp/casr

# Copy package files first for better Docker layer caching
COPY extension/package*.json ./
RUN npm install --only=production

# Copy TypeScript configuration and build tools
COPY extension/tsconfig*.json ./
COPY extension/webpack.config.js* ./

# Install development dependencies for building
RUN npm install

# Copy source code (only backend-related directories)
COPY extension/src/core/ ./src/core/
COPY extension/src/api/ ./src/api/

# Build the TypeScript code
RUN npm run build || npx tsc

# Copy the container entry point script
COPY container-entrypoint.sh /app/container-entrypoint.sh
RUN chmod +x /app/container-entrypoint.sh

# Create necessary directories for analysis
RUN mkdir -p /app/analysis-results \
    && mkdir -p /app/temp \
    && mkdir -p /app/fuzzing-input \
    && mkdir -p /app/crashes

# Set permissions for fuzzing tools
RUN chmod +x /usr/local/bin/* || true

# Set core pattern for better crash handling
RUN echo core | tee /proc/sys/kernel/core_pattern || true

# Expose the API port (for when running as API server)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Default command for API server mode
CMD ["node", "dist/server.js"]

# Alternative entry point for analysis mode
ENTRYPOINT ["/app/container-entrypoint.sh"]
