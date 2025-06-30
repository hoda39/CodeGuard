import * as vscode from 'vscode';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(this.statusBarItem);
  }

  initialize(): void {
    this.updateStatus('CodeGuard Ready', 'codeguard.runAnalysis');
    this.statusBarItem.show();
  }

  updateStatus(text: string, command?: string): void {
    this.statusBarItem.text = text;
    if (command) {
      this.statusBarItem.command = command;
    }
    this.statusBarItem.show();
  }

  showProgress(message: string): void {
    this.statusBarItem.text = `$(sync~spin) ${message}`;
    this.statusBarItem.show();
  }

  showError(message: string): void {
    this.statusBarItem.text = `$(error) ${message}`;
    this.statusBarItem.show();
  }

  showSuccess(message: string): void {
    this.statusBarItem.text = `$(check) ${message}`;
    this.statusBarItem.show();
  }

  hide(): void {
    this.statusBarItem.hide();
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }

  cleanup(): void {
    this.hide();
  }
} 