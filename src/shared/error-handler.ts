import * as vscode from 'vscode';
import { OutputManager } from '../ui/output-manager';

export interface ErrorContext {
  operation: string;
  filePath?: string;
  analysisType?: 'static' | 'dynamic' | 'combined';
  userFriendly?: boolean;
}

export class ErrorHandler {
  constructor(private outputManager: OutputManager) {}

  handleError(error: any, context: ErrorContext): void {
    const errorMessage = this.formatErrorMessage(error, context);
    const userMessage = this.getUserFriendlyMessage(error, context);
    
    // Log the detailed error
    this.outputManager.error(errorMessage);
    
    // Show user-friendly message if requested
    if (context.userFriendly !== false) {
      vscode.window.showErrorMessage(userMessage);
    }
  }

  private formatErrorMessage(error: any, context: ErrorContext): string {
    const timestamp = new Date().toISOString();
    const operation = context.operation;
    const filePath = context.filePath ? ` for ${context.filePath}` : '';
    const analysisType = context.analysisType ? ` (${context.analysisType})` : '';
    
    return `[${timestamp}] Error in ${operation}${filePath}${analysisType}: ${error.message || error}`;
  }

  private getUserFriendlyMessage(error: any, context: ErrorContext): string {
    const operation = context.operation;
    
    // Handle specific error types
    if (error.name === 'TimeoutError') {
      return `${operation} timed out. Please try again with a smaller file or increase timeout.`;
    }
    
    if (error.name === 'DockerError') {
      return `Docker container failed to start. Please ensure Docker is running and try again.`;
    }
    
    if (error.name === 'NetworkError') {
      return `Network connection failed. Please check your internet connection and try again.`;
    }
    
    if (error.name === 'FileNotFoundError') {
      return `File not found or not accessible. Please check the file path and permissions.`;
    }
    
    if (error.name === 'PermissionError') {
      return `Permission denied. Please check file permissions and try again.`;
    }
    
    if (error.message?.includes('Docker')) {
      return `Docker is not available. Please ensure Docker is installed and running.`;
    }
    
    if (error.message?.includes('timeout')) {
      return `${operation} timed out. Please try again.`;
    }
    
    // Generic error message
    return `${operation} failed: ${error.message || 'An unexpected error occurred'}`;
  }

  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error: any) {
      this.handleError(error, context);
      return null;
    }
  }

  createRetryableOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): () => Promise<T> {
    return async () => {
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error: any) {
          lastError = error;
          
          if (attempt < maxRetries) {
            this.outputManager.warning(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delayMs}ms...`);
            await this.delay(delayMs * attempt); // Exponential backoff
          }
        }
      }
      
      throw lastError || new Error('All retry attempts failed');
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 