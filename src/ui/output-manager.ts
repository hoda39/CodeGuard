import * as vscode from 'vscode';

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

export class OutputManager {
  private outputChannel: vscode.OutputChannel | undefined;
  private context: vscode.ExtensionContext;
  private fallbackLogs: string[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.initializeOutputChannel();
  }

  private initializeOutputChannel(): void {
    try {
      this.outputChannel = vscode.window.createOutputChannel('CodeGuard');
      this.context.subscriptions.push(this.outputChannel);
      
      // Flush any fallback logs
      if (this.fallbackLogs.length > 0) {
        this.fallbackLogs.forEach(log => {
          try {
            this.outputChannel?.appendLine(log);
          } catch (error) {
            console.error('Failed to flush fallback log:', error);
          }
        });
        this.fallbackLogs = [];
      }
    } catch (error) {
      console.error('Failed to create output channel:', error);
    }
  }

  private ensureOutputChannel(): vscode.OutputChannel | undefined {
    if (!this.outputChannel) {
      this.initializeOutputChannel();
    }
    return this.outputChannel;
  }

  private safeAppendLine(message: string): void {
    const channel = this.ensureOutputChannel();
    if (channel) {
      try {
        channel.appendLine(message);
      } catch (error) {
        console.error('Failed to append to output channel:', error);
        // Store in fallback logs for later
        this.fallbackLogs.push(message);
      }
    } else {
      // Store in fallback logs if no channel available
      this.fallbackLogs.push(message);
    }
  }

  log(message: string, level: LogLevel = 'info'): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    this.safeAppendLine(formattedMessage);
    
    // Always log to console in development
    if (this.context.extensionMode === vscode.ExtensionMode.Development) {
      console.log(formattedMessage);
    }
  }

  info(message: string): void {
    this.log(message, 'info');
  }

  warning(message: string): void {
    this.log(message, 'warning');
  }

  error(message: string): void {
    this.log(message, 'error');
  }

  debug(message: string): void {
    this.log(message, 'debug');
  }

  show(): void {
    const channel = this.ensureOutputChannel();
    if (channel) {
      try {
        channel.show();
      } catch (error) {
        console.error('Failed to show output channel:', error);
        // Try to show a notification instead
        vscode.window.showInformationMessage('CodeGuard output is available in the Output panel (View → Output → CodeGuard)');
      }
    }
  }

  clear(): void {
    const channel = this.ensureOutputChannel();
    if (channel) {
      try {
        channel.clear();
      } catch (error) {
        console.error('Failed to clear output channel:', error);
      }
    }
    // Clear fallback logs too
    this.fallbackLogs = [];
  }

  appendLine(message: string): void {
    this.safeAppendLine(message);
  }

  append(message: string): void {
    const channel = this.ensureOutputChannel();
    if (channel) {
      try {
        channel.append(message);
      } catch (error) {
        console.error('Failed to append to output channel:', error);
        this.fallbackLogs.push(message);
      }
    } else {
      this.fallbackLogs.push(message);
    }
  }

  dispose(): void {
    if (this.outputChannel) {
      try {
        this.outputChannel.dispose();
      } catch (error) {
        console.error('Failed to dispose output channel:', error);
      }
      this.outputChannel = undefined;
    }
  }

  // Get fallback logs for debugging
  getFallbackLogs(): string[] {
    return [...this.fallbackLogs];
  }
} 