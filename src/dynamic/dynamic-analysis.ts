import * as vscode from 'vscode';
import { DockerRunner } from '../shared/docker-runner';
import { ConfigManager } from '../config/config-manager';
import { DiagnosticManager, Vulnerability } from '../diagnostics/diagnostic-manager';
import { OutputManager } from '../ui/output-manager';

export interface DynamicAnalysisResult {
  success: boolean;
  vulnerabilities: Vulnerability[];
  errors?: string[];
  duration: number;
  type: 'dynamic';
}

export class DynamicAnalysis {
  constructor(
    private configManager: ConfigManager,
    private diagnosticManager: DiagnosticManager,
    private outputManager: OutputManager
  ) {}

  async runAnalysis(filePath: string, token: vscode.CancellationToken): Promise<DynamicAnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.outputManager.log(`Starting dynamic analysis for: ${filePath}`);
      
      // Check if file is accessible
      if (!await this.isFileAccessible(filePath)) {
        throw new Error(`File not accessible: ${filePath}`);
      }

      // Check Docker availability
      if (!await DockerRunner.isDockerAvailable()) {
        throw new Error('Docker is not available. Please ensure Docker is installed and running.');
      }

      // Run analysis with retry logic
      const result = await this.runAnalysisWithRetry(filePath, token);
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        vulnerabilities: result.vulnerabilities || [],
        errors: result.errors || [],
        duration,
        type: 'dynamic'
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.outputManager.error(`Dynamic analysis failed: ${error.message}`);
      
      return {
        success: false,
        vulnerabilities: [],
        errors: [error.message],
        duration,
        type: 'dynamic'
      };
    }
  }

  private async runAnalysisWithRetry(filePath: string, token: vscode.CancellationToken, maxRetries: number = 3): Promise<any> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (token.isCancellationRequested) {
          throw new Error('Analysis cancelled');
        }

        this.outputManager.log(`Dynamic analysis attempt ${attempt}/${maxRetries}`);
        
        const result = await DockerRunner.runAnalysisInContainer({
          analysisType: 'dynamic',
          filePath,
          timeoutSeconds: 900 // Default timeout of 15 minutes for dynamic analysis
        });

        if (result.success) {
          return this.parseAnalysisResult(result.stdout);
        } else {
          throw new Error(result.error || 'Analysis failed');
        }

      } catch (error: any) {
        lastError = error;
        
        if (attempt < maxRetries) {
          this.outputManager.warning(`Attempt ${attempt} failed: ${error.message}. Retrying...`);
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  private async isFileAccessible(filePath: string): Promise<boolean> {
    try {
      const fileUri = vscode.Uri.file(filePath);
      await vscode.workspace.fs.stat(fileUri);
      return true;
    } catch {
      return false;
    }
  }

  private parseAnalysisResult(stdout: string): any {
    try {
      return JSON.parse(stdout);
    } catch (error) {
      this.outputManager.warning('Failed to parse analysis result, treating as plain text');
      return {
        vulnerabilities: [],
        errors: ['Failed to parse analysis result']
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseResults(output: string, filePath: string): Vulnerability[] {
    // Simplified parsing - will be enhanced when migrating actual dynamic analysis logic
    const vulnerabilities: Vulnerability[] = [];
    
    // For now, just create a sample vulnerability to test the system
    if (output.includes('crash') || output.includes('vulnerability') || output.includes('sanitizer')) {
      vulnerabilities.push({
        id: `dynamic-${Date.now()}`,
        type: 'dynamic',
        severity: 'High',
        message: 'Dynamic analysis vulnerability detected',
        line: 1,
        column: 0,
        range: new vscode.Range(0, 0, 0, 1),
        source: 'Dynamic Analysis',
        details: { rawOutput: output }
      });
    }
    
    return vulnerabilities;
  }
} 