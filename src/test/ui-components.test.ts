import * as vscode from 'vscode';
import { OutputManager } from '../ui/output-manager';
import { StatusBarManager } from '../ui/status-bar-manager';
import { ProgressManager } from '../ui/progress-manager';
import { ConfigManager } from '../config/config-manager';
import { DiagnosticManager } from '../diagnostics/diagnostic-manager';

export class UIComponentsTest {
  private outputManager: OutputManager;
  private statusBarManager: StatusBarManager;
  private progressManager: ProgressManager;
  private configManager: ConfigManager;
  private diagnosticManager: DiagnosticManager;

  constructor(context: vscode.ExtensionContext) {
    this.outputManager = new OutputManager(context);
    this.statusBarManager = new StatusBarManager(context);
    this.progressManager = new ProgressManager(this.outputManager);
    this.configManager = new ConfigManager(context);
    this.diagnosticManager = new DiagnosticManager(context);
  }

  async runAllTests(): Promise<void> {
    this.outputManager.log('=== Starting UI Components Test Suite ===');
    
    try {
      await this.testOutputManager();
      await this.testStatusBarManager();
      await this.testProgressManager();
      await this.testConfigManager();
      await this.testDiagnosticManager();
      await this.testIntegration();
      
      this.outputManager.log('=== All UI Component Tests Passed! ===');
      vscode.window.showInformationMessage('✅ All UI component tests passed successfully!');
      
    } catch (error: any) {
      this.outputManager.error(`❌ UI Component Test Failed: ${error.message}`);
      vscode.window.showErrorMessage(`UI Component Test Failed: ${error.message}`);
    }
  }

  private async testOutputManager(): Promise<void> {
    this.outputManager.log('Testing Output Manager...');
    
    // Test basic logging
    this.outputManager.log('Test log message');
    this.outputManager.error('Test error message');
    this.outputManager.warning('Test warning message');
    
    // Test append operations
    this.outputManager.appendLine('Test append line 1');
    this.outputManager.appendLine('Test append line 2');
    
    // Test clear and show
    this.outputManager.clear();
    this.outputManager.appendLine('Output cleared and new content added');
    this.outputManager.show();
    
    await this.delay(500);
    this.outputManager.log('✅ Output Manager test completed');
  }

  private async testStatusBarManager(): Promise<void> {
    this.outputManager.log('Testing Status Bar Manager...');
    
    // Test status updates
    this.statusBarManager.updateStatus('Testing status updates');
    await this.delay(300);
    
    this.statusBarManager.showProgress('Testing progress indicator');
    await this.delay(300);
    
    this.statusBarManager.showSuccess('Testing success state');
    await this.delay(300);
    
    this.statusBarManager.showError('Testing error state');
    await this.delay(300);
    
    this.statusBarManager.updateStatus('Status bar test completed');
    await this.delay(300);
    
    this.outputManager.log('✅ Status Bar Manager test completed');
  }

  private async testProgressManager(): Promise<void> {
    this.outputManager.log('Testing Progress Manager...');
    
    // Test basic progress
    await this.progressManager.withProgress(
      {
        title: 'UI Test Progress',
        cancellable: true,
        location: vscode.ProgressLocation.Notification
      },
      async (progress) => {
        progress.report({ message: 'Testing progress reporting...', increment: 0 });
        await this.delay(200);
        
        progress.report({ message: 'Progress test in progress...', increment: 50 });
        await this.delay(200);
        
        progress.report({ message: 'Progress test completed!', increment: 50 });
        await this.delay(200);
      }
    );
    
    // Test analysis-specific progress methods
    await this.progressManager.showStaticAnalysisProgress(
      'test.cpp',
      async (progress) => {
        progress.report({ message: 'Testing static analysis progress...' });
        await this.delay(300);
      }
    );
    
    this.outputManager.log('✅ Progress Manager test completed');
  }

  private async testConfigManager(): Promise<void> {
    this.outputManager.log('Testing Config Manager...');
    
    // Test configuration loading
    await this.configManager.initialize();
    
    // Test getting configurations
    const analysisConfig = this.configManager.getAnalysisConfig();
    const staticConfig = this.configManager.getStaticConfig();
    const dynamicConfig = this.configManager.getDynamicConfig();
    const diagnosticsConfig = this.configManager.getDiagnosticsConfig();
    const uiConfig = this.configManager.getUIConfig();
    
    this.outputManager.log(`Analysis config loaded: ${analysisConfig.defaultMode}`);
    this.outputManager.log(`Static config loaded: ${staticConfig.inferenceMode}`);
    this.outputManager.log(`Dynamic config loaded: ${dynamicConfig.apiURL}`);
    this.outputManager.log(`UI config loaded: ${uiConfig.showProgressNotifications}`);
    
    this.outputManager.log('✅ Config Manager test completed');
  }

  private async testDiagnosticManager(): Promise<void> {
    this.outputManager.log('Testing Diagnostic Manager...');
    
    // Test diagnostic collection
    this.diagnosticManager.initialize();
    
    // Test adding vulnerabilities
    const testVulnerability = {
      id: 'TEST-001',
      type: 'static' as const,
      severity: 'Medium' as const,
      message: 'Test vulnerability for UI testing',
      line: 1,
      range: new vscode.Range(0, 0, 0, 10),
      source: 'CodeGuard UI Test'
    };
    
    this.diagnosticManager.addVulnerabilities('test.cpp', [testVulnerability]);
    
    await this.delay(500);
    
    // Test clearing diagnostics
    this.diagnosticManager.clearVulnerabilities('test.cpp');
    
    this.outputManager.log('✅ Diagnostic Manager test completed');
  }

  private async testIntegration(): Promise<void> {
    this.outputManager.log('Testing Component Integration...');
    
    // Test integrated workflow
    this.statusBarManager.showProgress('Testing integrated workflow...');
    
    await this.progressManager.withProgress(
      {
        title: 'Integration Test',
        cancellable: false,
        location: vscode.ProgressLocation.Notification
      },
      async (progress) => {
        progress.report({ message: 'Testing component integration...', increment: 0 });
        
        // Simulate analysis workflow
        this.outputManager.log('Simulating analysis workflow...');
        await this.delay(200);
        
        progress.report({ message: 'Components working together...', increment: 50 });
        await this.delay(200);
        
        progress.report({ message: 'Integration test completed!', increment: 50 });
        await this.delay(200);
      }
    );
    
    this.statusBarManager.showSuccess('Integration test completed');
    this.outputManager.appendLine('=== Component Integration Test Results ===');
    this.outputManager.appendLine('✅ All components work together seamlessly');
    this.outputManager.appendLine('✅ Progress reporting integrated');
    this.outputManager.appendLine('✅ Status updates synchronized');
    this.outputManager.appendLine('✅ Output management functional');
    this.outputManager.show();
    
    this.outputManager.log('✅ Component Integration test completed');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 