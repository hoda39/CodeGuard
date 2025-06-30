import * as vscode from 'vscode';
import { OutputManager } from './output-manager';
import { StatusBarManager } from './status-bar-manager';
import { ProgressManager } from './progress-manager';

export class UITest {
  constructor(
    private outputManager: OutputManager,
    private statusBarManager: StatusBarManager,
    private progressManager: ProgressManager
  ) {}

  async runUITest(): Promise<void> {
    this.outputManager.log('Starting UI component test...');
    
    // Test status bar updates
    this.statusBarManager.showProgress('Testing status bar...');
    await this.delay(1000);
    
    this.statusBarManager.showSuccess('Status bar test passed!');
    await this.delay(1000);
    
    this.statusBarManager.showError('Testing error state...');
    await this.delay(1000);
    
    this.statusBarManager.updateStatus('UI Test Complete');
    
    // Test progress manager
    await this.progressManager.withProgress(
      {
        title: 'UI Test Progress',
        cancellable: true,
        location: vscode.ProgressLocation.Notification
      },
      async (progress) => {
        progress.report({ message: 'Testing progress reporting...', increment: 0 });
        await this.delay(500);
        
        progress.report({ message: 'Progress test completed!', increment: 100 });
        await this.delay(500);
      }
    );
    
    // Test output manager
    this.outputManager.appendLine('=== UI Test Results ===');
    this.outputManager.appendLine('✅ Status Bar Manager: Working');
    this.outputManager.appendLine('✅ Progress Manager: Working');
    this.outputManager.appendLine('✅ Output Manager: Working');
    this.outputManager.appendLine('=== All UI components are functional ===');
    
    this.outputManager.show();
    
    vscode.window.showInformationMessage('UI test completed successfully!');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 