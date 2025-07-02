import * as vscode from 'vscode';
import * as path from 'path';
import { AnalysisManager } from './analysis/analysis-manager';
import { ConfigManager } from './config/config-manager';
import { DiagnosticManager } from './diagnostics/diagnostic-manager';
import { StatusBarManager } from './ui/status-bar-manager';
import { OutputManager } from './ui/output-manager';
import { ProgressManager } from './ui/progress-manager';
import { UITest } from './ui/ui-test';
import { UIComponentsTest } from './test/ui-components.test';
import { VulnerabilityFixProvider } from './providers/vulnerability-fix-provider';
import { PerformanceMonitor } from './shared/performance-monitor';

// Global managers
let analysisManager: AnalysisManager;
let configManager: ConfigManager;
let diagnosticManager: DiagnosticManager;
let statusBarManager: StatusBarManager;
let outputManager: OutputManager;
let progressManager: ProgressManager;
let performanceMonitor: PerformanceMonitor;

export async function activate(context: vscode.ExtensionContext) {
  try {
    // Initialize output manager first
    outputManager = new OutputManager(context);
    
    // Initialize other managers
    configManager = new ConfigManager(context);
    diagnosticManager = new DiagnosticManager(context);
    statusBarManager = new StatusBarManager(context);
    progressManager = new ProgressManager(outputManager);
    analysisManager = new AnalysisManager(context, {
      configManager,
      diagnosticManager,
      statusBarManager,
      outputManager,
      progressManager
    });
    performanceMonitor = new PerformanceMonitor(outputManager);

    // Initialize the extension
    await initializeExtension(context);

    // Register commands
    registerCommands(context);

    // Register providers
    registerProviders(context);

    outputManager.log('CodeGuard extension activated successfully 🛡️');

  } catch (error: any) {
    // Fallback logging if output manager fails
    console.error('Failed to activate CodeGuard extension:', error);
    try {
      if (outputManager) {
        outputManager.log(`Failed to activate CodeGuard extension: ${error.message}`, 'error');
      }
    } catch (logError) {
      console.error('Failed to log activation error:', logError);
    }
    vscode.window.showErrorMessage(`CodeGuard activation failed: ${error.message}`);
  }
}

async function initializeExtension(context: vscode.ExtensionContext) {
  // Initialize configuration
  await configManager.initialize();

  // Initialize status bar
  statusBarManager.initialize();

  // Initialize diagnostic collection
  diagnosticManager.initialize();

  // Initialize analysis manager
  await analysisManager.initialize();

  outputManager.log('CodeGuard components initialized successfully');
}

function registerCommands(context: vscode.ExtensionContext) {
  // Main analysis command - shows selection dialog
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.runAnalysis', async () => {
      await analysisManager.runAnalysisWithSelection();
    })
  );

  // Direct static analysis
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.runStaticAnalysis', async () => {
      await analysisManager.runStaticAnalysis();
    })
  );

  // Direct dynamic analysis
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.runDynamicAnalysis', async () => {
      await analysisManager.runDynamicAnalysis();
    })
  );

  // Cancel analysis
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.cancelAnalysis', async () => {
      await analysisManager.cancelAnalysis();
    })
  );

  // Fix vulnerability
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.fixVulnerability', async (document: vscode.TextDocument, range: vscode.Range) => {
      await analysisManager.fixVulnerability(document, range);
    })
  );

  // Register user (for dynamic analysis)
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.registerUser', async () => {
      await analysisManager.registerUser();
    })
  );

  // Restart extension
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.restart', async () => {
      await restartExtension(context);
    })
  );

  // UI Test command
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.testUI', async () => {
      const uiTest = new UITest(outputManager, statusBarManager, progressManager);
      await uiTest.runUITest();
    })
  );

  // Comprehensive UI Components Test command
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.testUIComponents', async () => {
      const uiComponentsTest = new UIComponentsTest(context);
      await uiComponentsTest.runAllTests();
    })
  );

  // Performance Report command
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.showPerformanceReport', async () => {
      const report = performanceMonitor.generatePerformanceReport();
      outputManager.clear();
      outputManager.appendLine(report);
      outputManager.show();
      vscode.window.showInformationMessage('Performance report generated and displayed in output panel');
    })
  );

  // Debug Output Channel command
  context.subscriptions.push(
    vscode.commands.registerCommand('codeguard.debugOutput', async () => {
      const fallbackLogs = outputManager.getFallbackLogs();
      if (fallbackLogs.length > 0) {
        const message = `Found ${fallbackLogs.length} fallback logs. Check console for details.`;
        vscode.window.showInformationMessage(message);
        console.log('Fallback logs:', fallbackLogs);
      } else {
        vscode.window.showInformationMessage('No fallback logs found. Output channel is working properly.');
      }
    })
  );
}

function registerProviders(context: vscode.ExtensionContext) {
  // Register vulnerability fix provider
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ['c', 'cpp'],
      new VulnerabilityFixProvider(analysisManager),
      {
        providedCodeActionKinds: VulnerabilityFixProvider.providedCodeActionKinds
      }
    )
  );
}

async function restartExtension(context: vscode.ExtensionContext) {
  outputManager.log('Restarting CodeGuard extension...');
  
  // Cleanup current state
  await analysisManager.cleanup();
  diagnosticManager.cleanup();
  statusBarManager.cleanup();
  
  // Reinitialize
  await initializeExtension(context);
  
  outputManager.log('CodeGuard extension restarted successfully');
  vscode.window.showInformationMessage('CodeGuard extension restarted successfully');
}

export function deactivate() {
  outputManager.log('Deactivating CodeGuard extension...');
  
  // Cleanup all managers
  if (analysisManager) {
    analysisManager.cleanup();
  }
  if (diagnosticManager) {
    diagnosticManager.cleanup();
  }
  if (statusBarManager) {
    statusBarManager.cleanup();
  }
  
  outputManager.log('CodeGuard extension deactivated');
} 