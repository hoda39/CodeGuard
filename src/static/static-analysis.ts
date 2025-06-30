import * as vscode from 'vscode';
import * as path from 'path';
import { DockerRunner, DockerRunResult } from '../shared/docker-runner';
import { ConfigManager } from '../config/config-manager';
import { DiagnosticManager, Vulnerability } from '../diagnostics/diagnostic-manager';
import { OutputManager } from '../ui/output-manager';
import { AnalysisResult } from '../analysis/analysis-manager';

export interface StaticAnalysisOptions {
  filePath: string;
  configManager: ConfigManager;
  diagnosticManager: DiagnosticManager;
  outputManager: OutputManager;
  cancellationToken: vscode.CancellationToken;
}

export interface StaticAnalysisResult {
  success: boolean;
  vulnerabilities: Vulnerability[];
  errors?: string[];
  duration: number;
  rawOutput?: any;
  type: string;
}

export class StaticAnalysis {
  private configManager: ConfigManager;
  private diagnosticManager: DiagnosticManager;
  private outputManager: OutputManager;

  constructor(
    configManager: ConfigManager,
    diagnosticManager: DiagnosticManager,
    outputManager: OutputManager
  ) {
    this.configManager = configManager;
    this.diagnosticManager = diagnosticManager;
    this.outputManager = outputManager;
  }

  async runAnalysis(filePath: string, token: vscode.CancellationToken): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.outputManager.log(`Starting static analysis for: ${filePath}`);
      
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
        type: 'static'
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.outputManager.error(`Static analysis failed: ${error.message}`);
      
      return {
        success: false,
        vulnerabilities: [],
        errors: [error.message],
        duration,
        type: 'static'
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

        this.outputManager.log(`Static analysis attempt ${attempt}/${maxRetries}`);
        
        const result = await DockerRunner.runAnalysisInContainer({
          analysisType: 'static',
          filePath,
          timeoutSeconds: 600 // Default timeout of 10 minutes
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

  async extractFunctions(document: vscode.TextDocument): Promise<string[]> {
    // This is a simplified function extraction
    // You can enhance this based on your existing static analysis logic
    const text = document.getText();
    const functions: string[] = [];
    
    // Simple regex to find function definitions
    const functionRegex = /(\w+\s+)?(\w+)\s*\([^)]*\)\s*\{[^}]*\}/g;
    let match;
    
    while ((match = functionRegex.exec(text)) !== null) {
      functions.push(match[0]);
    }
    
    return functions;
  }

  async fixVulnerability(document: vscode.TextDocument, range: vscode.Range): Promise<string | null> {
    try {
      // Extract the function containing the vulnerability
      const functionText = await this.extractVulnerableFunction(document, range);
      if (!functionText) {
        return null;
      }

      // Call the repair API
      const config = this.configManager.getStaticConfig();
      const repairResult = await this.callRepairAPI(functionText, config);
      
      return repairResult;
    } catch (error: any) {
      this.outputManager.error(`Failed to fix vulnerability: ${error.message}`);
      return null;
    }
  }

  private async extractVulnerableFunction(document: vscode.TextDocument, range: vscode.Range): Promise<string | null> {
    // Simplified function extraction - you can enhance this
    const startLine = range.start.line;
    const endLine = range.end.line;
    
    let functionStart = startLine;
    let functionEnd = endLine;
    
    // Try to find function boundaries
    const text = document.getText();
    const lines = text.split('\n');
    
    // Look for function start (simplified)
    for (let i = startLine; i >= 0; i--) {
      if (lines[i].includes('{') && !lines[i].includes('}')) {
        functionStart = i;
        break;
      }
    }
    
    // Look for function end (simplified)
    for (let i = endLine; i < lines.length; i++) {
      if (lines[i].includes('}')) {
        functionEnd = i;
        break;
      }
    }
    
    return lines.slice(functionStart, functionEnd + 1).join('\n');
  }

  private async callRepairAPI(code: string, config: any): Promise<string | null> {
    // This is a placeholder for the repair API call
    // You can implement this based on your existing repair logic
    this.outputManager.log('Repair API not yet implemented');
    return null;
  }
} 