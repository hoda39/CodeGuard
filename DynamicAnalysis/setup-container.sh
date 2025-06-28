#!/bin/bash

# CodeGuard Dynamic Analysis Container Setup Script
# This script helps set up the containerized dynamic analysis environment

set -e

echo "🚀 CodeGuard Dynamic Analysis Container Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Check if Docker Compose is installed
check_docker_compose() {
    print_status "Checking Docker Compose installation..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker Compose is installed"
}

# Generate encryption key
generate_encryption_key() {
    print_status "Generating encryption key..."
    if [ ! -f .env ]; then
        # Generate a secure 32-byte key
        ENCRYPTION_KEY=$(openssl rand -hex 32)
        
        # Create .env file
        cat > .env << EOF
# CodeGuard Dynamic Analysis Environment Configuration

# Analysis Mode: CONTAINER, FUZZING, or DEFAULT
ANALYSIS_MODE=CONTAINER

# API Configuration
API_BASE_URL=https://localhost:3000/api
PORT=3000

# Security Configuration
ENCRYPTION_KEY=${ENCRYPTION_KEY}
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
SSL_PASSPHRASE=codeguard-secure-passphrase

# Container Configuration
CONTAINER_IMAGE=codeguard-dynamic:latest
CONTAINER_TIMEOUT=600000

# Fuzzing Configuration
FUZZING_TIMEOUT=300
AFL_PATH=/usr/local/bin
ECLIPSER_PATH=/usr/local/bin/Eclipser

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/analysis.log

# Development Configuration
NODE_ENV=production
EOF
        print_success "Generated .env file with secure encryption key"
    else
        print_warning ".env file already exists, skipping generation"
    fi
}

# Generate SSL certificates
generate_ssl_certs() {
    print_status "Generating SSL certificates..."
    
    # Create SSL directory
    mkdir -p ssl
    
    # Generate self-signed certificate
    openssl req -x509 -newkey rsa:4096 -keyout ssl/private.key -out ssl/certificate.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=CodeGuard/CN=localhost"
    
    print_success "Generated SSL certificates"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p temp
    mkdir -p analysis-results
    
    print_success "Created directories"
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    
    # Build the image
    docker build -t codeguard-dynamic:latest .
    
    print_success "Docker image built successfully"
}

# Start services
start_services() {
    print_status "Starting CodeGuard Dynamic Analysis services..."
    
    # Start with Docker Compose
    docker-compose up -d
    
    print_success "Services started successfully"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait a bit for services to start
    sleep 10
    
    # Check if API is responding
    if curl -f http://localhost:3000/health &> /dev/null; then
        print_success "API server is healthy"
    else
        print_warning "API server health check failed, but it might still be starting up"
    fi
    
    # Check if container image exists
    if docker image inspect codeguard-dynamic:latest &> /dev/null; then
        print_success "Analysis container image is ready"
    else
        print_error "Analysis container image not found"
        exit 1
    fi
}

# Show usage instructions
show_instructions() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "Your CodeGuard Dynamic Analysis system is now ready!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open VS Code and install the CodeGuard extension"
    echo "2. Open a C/C++ file"
    echo "3. Run the 'Run AddressSanitizer' command from the Command Palette"
    echo "4. The analysis will run in a secure container"
    echo ""
    echo "🔧 Management commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop services: docker-compose down"
    echo "  - Restart services: docker-compose restart"
    echo "  - Rebuild image: docker-compose build --no-cache"
    echo ""
    echo "🌐 API endpoint: https://localhost:3000"
    echo "📁 Results directory: ./analysis-results"
    echo "📝 Logs directory: ./logs"
    echo ""
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo ""
    
    check_docker
    check_docker_compose
    generate_encryption_key
    generate_ssl_certs
    create_directories
    build_image
    start_services
    check_health
    show_instructions
}

# Run main function
main "$@" 