import { exec } from 'child_process';
import * as path from 'path';
import { ConfigManager } from '../config/config-manager';

export type AnalysisType = 'static' | 'dynamic';

export interface DockerRunOptions {
  analysisType: AnalysisType;
  filePath: string;
  imageName?: string; // Optional override
  containerName?: string; // Optional override
  timeoutSeconds?: number;
}

export interface DockerRunResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  error?: string;
  containerId?: string;
  vulnerabilities?: any[];
  resourceUsage?: any;
}

export interface DockerAvailabilityResult {
  available: boolean;
  version?: string;
  error?: string;
}

export interface ContainerStats {
  cpu: string;
  memory: string;
  network: string;
  disk: string;
}

export class DockerRunner {
  private configManager?: ConfigManager;

  constructor(configManager?: ConfigManager) {
    this.configManager = configManager;
  }

  static getDefaultImage(analysisType: AnalysisType): string {
    return analysisType === 'static' ? 'codeguard-static:latest' : 'codeguard-dynamic:latest';
  }

  static async isDockerAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      exec('docker --version', (err) => {
        resolve(!err);
      });
    });
  }

  static async runAnalysisInContainer(options: DockerRunOptions): Promise<DockerRunResult> {
    const image = options.imageName || DockerRunner.getDefaultImage(options.analysisType);
    const containerName = options.containerName || `codeguard-${options.analysisType}-analysis`;
    const absFilePath = path.resolve(options.filePath);
    const mountDir = path.dirname(absFilePath);
    const fileName = path.basename(absFilePath);
    const timeout = options.timeoutSeconds || 600;

    // Command to run the analysis inside the container
    // Assumes the container entrypoint expects /input/<fileName>
    const dockerCmd = `docker run --rm --name ${containerName} -v "${mountDir}:/input" ${image} analyze /input/${fileName}`;

    return new Promise((resolve) => {
      const proc = exec(dockerCmd, { timeout: timeout * 1000 }, (err, stdout, stderr) => {
        resolve({
          success: !err,
          stdout: stdout || '',
          stderr: stderr || '',
          exitCode: (err && (err as any).code) || 0,
          error: err ? err.message : undefined,
          resourceUsage: {
            cpu: '0%',
            memory: '0B / 0B',
            network: '0B / 0B',
            disk: '0B / 0B'
          }
        });
      });
    });
  }

  // Instance methods for testing compatibility
  async buildStaticContainer(): Promise<DockerRunResult> {
    const dockerCmd = `docker build -t codeguard-static:latest -f ${path.join(__dirname, '../../StaticAnalysis/code/Dockerfile')} ${path.join(__dirname, '../../StaticAnalysis/code')}`;
    
    return new Promise((resolve) => {
      exec(dockerCmd, { timeout: 300000 }, (err, stdout, stderr) => {
        const containerId = stdout.match(/Successfully built ([a-f0-9]+)/)?.[1];
        resolve({
          success: !err,
          stdout: stdout || '',
          stderr: stderr || '',
          exitCode: (err && (err as any).code) || 0,
          error: err ? err.message : undefined,
          containerId: containerId
        });
      });
    });
  }

  async buildDynamicContainer(): Promise<DockerRunResult> {
    const dockerCmd = `docker build -t codeguard-dynamic:latest -f ${path.join(__dirname, '../../DynamicAnalysis/Dockerfile')} ${path.join(__dirname, '../../DynamicAnalysis')}`;
    
    return new Promise((resolve) => {
      exec(dockerCmd, { timeout: 300000 }, (err, stdout, stderr) => {
        const containerId = stdout.match(/Successfully built ([a-f0-9]+)/)?.[1];
        resolve({
          success: !err,
          stdout: stdout || '',
          stderr: stderr || '',
          exitCode: (err && (err as any).code) || 0,
          error: err ? err.message : undefined,
          containerId: containerId
        });
      });
    });
  }

  async runStaticAnalysis(code: string, fileName: string): Promise<DockerRunResult> {
    const result = await DockerRunner.runAnalysisInContainer({
      analysisType: 'static',
      filePath: fileName,
      imageName: 'codeguard-static:latest'
    });

    // Parse vulnerabilities from stdout if available
    let vulnerabilities: any[] = [];
    if (result.success && result.stdout) {
      try {
        const parsed = JSON.parse(result.stdout);
        vulnerabilities = parsed.vulnerabilities || [];
      } catch (e) {
        // If parsing fails, return empty vulnerabilities
      }
    }

    return {
      ...result,
      vulnerabilities: vulnerabilities
    };
  }

  async runDynamicAnalysis(code: string, fileName: string): Promise<DockerRunResult> {
    const result = await DockerRunner.runAnalysisInContainer({
      analysisType: 'dynamic',
      filePath: fileName,
      imageName: 'codeguard-dynamic:latest'
    });

    // Parse vulnerabilities from stdout if available
    let vulnerabilities: any[] = [];
    if (result.success && result.stdout) {
      try {
        const parsed = JSON.parse(result.stdout);
        vulnerabilities = parsed.vulnerabilities || [];
      } catch (e) {
        // If parsing fails, return empty vulnerabilities
      }
    }

    return {
      ...result,
      vulnerabilities: vulnerabilities
    };
  }

  async cleanupContainer(containerName: string): Promise<DockerRunResult> {
    const dockerCmd = `docker rm -f ${containerName}`;
    
    return new Promise((resolve) => {
      exec(dockerCmd, { timeout: 30000 }, (err, stdout, stderr) => {
        resolve({
          success: !err,
          stdout: stdout || '',
          stderr: stderr || '',
          exitCode: (err && (err as any).code) || 0,
          error: err ? err.message : undefined
        });
      });
    });
  }

  async checkDockerAvailability(): Promise<DockerAvailabilityResult> {
    return new Promise((resolve) => {
      exec('docker --version', { timeout: 10000 }, (err, stdout, stderr) => {
        if (err) {
          resolve({
            available: false,
            error: 'Docker not found'
          });
        } else {
          const version = stdout.trim();
          resolve({
            available: true,
            version: version
          });
        }
      });
    });
  }

  async getContainerStats(containerName: string): Promise<ContainerStats> {
    const dockerCmd = `docker stats ${containerName} --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"`;
    
    return new Promise((resolve, reject) => {
      exec(dockerCmd, { timeout: 10000 }, (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`Failed to get container stats: ${err.message}`));
          return;
        }
        
        const lines = stdout.trim().split('\n');
        if (lines.length < 2) {
          reject(new Error('No container stats available'));
          return;
        }
        
        const statsLine = lines[1];
        const parts = statsLine.split('\t');
        
        resolve({
          cpu: parts[0] || '0%',
          memory: parts[1] || '0B / 0B',
          network: parts[2] || '0B / 0B',
          disk: parts[3] || '0B / 0B'
        });
      });
    });
  }
} 