# CodeGuard Dynamic Analysis - Containerized Setup

This document explains how to set up and use the containerized dynamic analysis system for CodeGuard.

## Overview

The containerized dynamic analysis system runs the fuzzing and sanitizer-based analysis in isolated Docker containers, providing:

- **Security**: Isolated execution environment
- **Consistency**: Reproducible analysis results
- **Scalability**: Easy deployment and management
- **Resource Control**: Controlled resource usage

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   File Upload   │  │   Progress      │  │   Results   │  │
│  │   & Encryption  │  │   Monitoring    │  │   Display   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Server (Node.js)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Authentication│  │   Container     │  │   Results   │  │
│  │   & Encryption  │  │   Orchestration │  │   Processing│  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Analysis Container                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   AFL++         │  │   Eclipser      │  │   Sanitizers│  │
│  │   Fuzzing       │  │   Concolic      │  │   Detection │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **OpenSSL**: For certificate generation
- **VS Code**: With CodeGuard extension installed

## Quick Setup

### 1. Automated Setup (Recommended)

Run the automated setup script:

```bash
# On Linux/macOS
./setup-container.sh

# On Windows (PowerShell)
.\setup-container.sh
```

This script will:
- Check Docker installation
- Generate encryption keys and SSL certificates
- Build the Docker image
- Start the services
- Verify the setup

### 2. Manual Setup

If you prefer manual setup:

#### Step 1: Generate Environment Configuration

```bash
# Generate encryption key
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Create .env file
cat > .env << EOF
ANALYSIS_MODE=CONTAINER
ENCRYPTION_KEY=${ENCRYPTION_KEY}
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
SSL_PASSPHRASE=your-secure-passphrase
EOF
```

#### Step 2: Generate SSL Certificates

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 \
    -keyout ssl/private.key \
    -out ssl/certificate.crt \
    -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=CodeGuard/CN=localhost"
```

#### Step 3: Build and Start Services

```bash
# Build Docker image
docker build -t codeguard-dynamic:latest .

# Start services
docker-compose up -d
```

## Usage

### 1. VS Code Extension

1. **Install the CodeGuard extension** in VS Code
2. **Open a C/C++ file** (`.c`, `.cpp`, `.h`, `.hpp`)
3. **Run analysis** via Command Palette:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type "Run AddressSanitizer"
   - Select the command

### 2. Analysis Process

When you run the analysis:

1. **File Encryption**: Your source code is encrypted before transmission
2. **Container Launch**: A new Docker container is created for analysis
3. **Fuzzing Execution**: AFL++ and Eclipser run in the container
4. **Result Collection**: Analysis results are collected and returned
5. **Container Cleanup**: The container is automatically removed

### 3. Monitoring Progress

You can monitor the analysis progress:

- **VS Code Output Panel**: Shows real-time progress
- **Docker Logs**: View container logs
- **API Endpoints**: Check analysis status

```bash
# View container logs
docker-compose logs -f

# Check specific analysis
curl -k https://localhost:3000/api/analysis/{analysis_id}/status
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANALYSIS_MODE` | Analysis execution mode | `CONTAINER` |
| `ENCRYPTION_KEY` | 32-byte encryption key | Auto-generated |
| `CONTAINER_TIMEOUT` | Container timeout (ms) | `600000` |
| `FUZZING_TIMEOUT` | Fuzzing duration (s) | `300` |

### Analysis Modes

- **`CONTAINER`**: Run analysis in Docker containers (recommended)
- **`FUZZING`**: Run analysis directly on host (development)
- **`DEFAULT`**: Use basic sanitizer analysis

## Security Features

### 1. Encryption

- **Source Code**: Encrypted before transmission
- **Results**: Encrypted during storage
- **Communication**: HTTPS with self-signed certificates

### 2. Container Isolation

- **Process Isolation**: Each analysis runs in its own container
- **Network Isolation**: Containers have limited network access
- **Resource Limits**: CPU and memory limits applied
- **Automatic Cleanup**: Containers removed after analysis

### 3. Authentication

- **JWT Tokens**: Secure authentication
- **Role-based Access**: Admin and user roles
- **Session Management**: Automatic token refresh

## Troubleshooting

### Common Issues

#### 1. Docker Not Running

```bash
# Start Docker
sudo systemctl start docker  # Linux
# or start Docker Desktop on Windows/macOS
```

#### 2. Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Stop conflicting service or change port in .env
```

#### 3. Container Build Fails

```bash
# Clean build
docker-compose build --no-cache

# Check Docker logs
docker-compose logs codeguard-dynamic-api
```

#### 4. SSL Certificate Issues

```bash
# Regenerate certificates
rm -rf ssl/
./setup-container.sh
```

### Debug Mode

Enable debug logging:

```bash
# Set debug level in .env
LOG_LEVEL=debug

# Restart services
docker-compose restart
```

### Health Checks

```bash
# Check API health
curl -k https://localhost:3000/health

# Check container status
docker-compose ps

# View resource usage
docker stats
```

## Management Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild image
docker-compose build --no-cache
```

### Container Management

```bash
# List running containers
docker ps

# Stop all analysis containers
docker stop $(docker ps -q --filter "name=codeguard-analysis")

# Clean up stopped containers
docker container prune

# Remove old images
docker image prune
```

### Data Management

```bash
# Backup analysis results
tar -czf analysis-backup-$(date +%Y%m%d).tar.gz analysis-results/

# Clean old results
find analysis-results/ -mtime +30 -delete

# View disk usage
du -sh analysis-results/ logs/ temp/
```

## Performance Tuning

### Resource Limits

Adjust container resources in `docker-compose.yml`:

```yaml
services:
  codeguard-dynamic-api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

### Analysis Timeout

Adjust analysis duration:

```bash
# In .env file
FUZZING_TIMEOUT=600  # 10 minutes
CONTAINER_TIMEOUT=900000  # 15 minutes
```

### Parallel Analysis

Enable parallel analysis by modifying the analysis service:

```typescript
// In analysis.ts
private static MAX_PARALLEL_ANALYSES = 3;
```

## Monitoring and Logging

### Log Files

- **Application Logs**: `./logs/analysis.log`
- **Container Logs**: `docker-compose logs`
- **System Logs**: `journalctl -u docker`

### Metrics

Monitor key metrics:

- **Analysis Duration**: Average time per analysis
- **Success Rate**: Percentage of successful analyses
- **Resource Usage**: CPU and memory consumption
- **Error Rate**: Failed analysis attempts

### Alerts

Set up monitoring alerts for:

- High resource usage
- Failed analyses
- Container crashes
- API unavailability

## Development

### Local Development

For development without containers:

```bash
# Set development mode
ANALYSIS_MODE=FUZZING

# Install dependencies
npm install

# Start development server
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Test container build
docker build -t test-image .

# Test analysis in container
docker run --rm test-image /app/container-entrypoint.sh
```

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs: `docker-compose logs -f`
3. Check the GitHub issues page
4. Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details. 