import * as vscode from 'vscode';

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

export class OutputManager {
  private outputChannel: vscode.OutputChannel;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel('CodeGuard');
    context.subscriptions.push(this.outputChannel);
  }

  log(message: string, level: LogLevel = 'info'): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    this.outputChannel.appendLine(formattedMessage);
    
    // Also log to console in development
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
    this.outputChannel.show();
  }

  clear(): void {
    this.outputChannel.clear();
  }

  appendLine(message: string): void {
    this.outputChannel.appendLine(message);
  }

  append(message: string): void {
    this.outputChannel.append(message);
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
} 