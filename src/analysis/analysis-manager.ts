import * as vscode from 'vscode';
import { ConfigManager } from '../config/config-manager';
import { DiagnosticManager, Vulnerability } from '../diagnostics/diagnostic-manager';
import { StatusBarManager } from '../ui/status-bar-manager';
import { OutputManager } from '../ui/output-manager';
import { ProgressManager } from '../ui/progress-manager';
import { StaticAnalysis } from '../static/static-analysis';
import { DynamicAnalysis } from '../dynamic/dynamic-analysis';

export interface AnalysisResult {
  success: boolean;
  vulnerabilities: Vulnerability[];
  errors?: string[];
  duration: number;
  type: 'static' | 'dynamic' | 'combined';
}

export interface ManagerDependencies {
  configManager: ConfigManager;
  diagnosticManager: DiagnosticManager;
  statusBarManager: StatusBarManager;
  outputManager: OutputManager;
  progressManager: ProgressManager;
}

export class AnalysisManager {
  private context: vscode.ExtensionContext;
  private dependencies: ManagerDependencies;
  private staticAnalysis: StaticAnalysis;
  private dynamicAnalysis: DynamicAnalysis;
  private currentAnalysis: {
    cancellationToken: vscode.CancellationTokenSource;
    type: string;
    filePath: string;
    startTime: number;
  } | null = null;
  private maxConcurrentAnalyses = 1; // Can be increased for parallel analysis
  private static decorationTypes: { [key: string]: vscode.TextEditorDecorationType } = {};
  private static decorationDisposables: vscode.TextEditorDecorationType[] = [];
  private static hoverProviderDisposable: vscode.Disposable | undefined;

  constructor(context: vscode.ExtensionContext, dependencies: ManagerDependencies) {
    this.context = context;
    this.dependencies = dependencies;
    this.staticAnalysis = new StaticAnalysis(
      dependencies.configManager,
      dependencies.diagnosticManager,
      dependencies.outputManager
    );
    this.dynamicAnalysis = new DynamicAnalysis(
      dependencies.configManager,
      dependencies.diagnosticManager,
      dependencies.outputManager
    );
    // Register hover provider for C/C++
    if (!AnalysisManager.hoverProviderDisposable) {
      AnalysisManager.hoverProviderDisposable = vscode.languages.registerHoverProvider(['c', 'cpp'], {
        provideHover(document, position) {
          const diagnostics = vscode.languages.getDiagnostics(document.uri);
          const diagnostic = diagnostics.find(d => d.range.contains(position) && d.source === 'CodeGuard');
          if (diagnostic) {
            // Try to extract vulnerability details from the message or code
            let cweId = diagnostic.code ? diagnostic.code.toString() : '';
            let description = '';
            let severity = '';
            let abstract = '';
            let moreDetailsUrl = '';
            // Try to parse message for details
            const msg = diagnostic.message;
            const cweMatch = msg.match(/CWE-(\d+)/);
            if (cweMatch) {
              cweId = cweMatch[0];
              moreDetailsUrl = `https://cwe.mitre.org/data/definitions/${cweMatch[1]}.html`;
            }
            // Try to extract severity and abstract
            const sevMatch = msg.match(/\[(Critical|High|Medium|Low|Info)\]/i);
            if (sevMatch) severity = sevMatch[1];
            // If relatedInformation is present, use as description
            if (diagnostic.relatedInformation && diagnostic.relatedInformation.length > 0) {
              description = diagnostic.relatedInformation[0].message;
            }
            // Compose markdown
            const markdown = new vscode.MarkdownString();
            if (cweId) markdown.appendMarkdown(`### ${cweId}\n\n`);
            if (abstract) markdown.appendMarkdown(`**Abstract**: ${abstract}\n\n`);
            if (severity) markdown.appendMarkdown(`**Severity**: ${severity}\n\n`);
            if (description) markdown.appendMarkdown(`**Description**: ${description}\n\n`);
            if (moreDetailsUrl) markdown.appendMarkdown(`**More Details**: [View Documentation](${moreDetailsUrl})\n\n`);
            return new vscode.Hover(markdown);
          }
          return null;
        }
      });
    }
  }

  async initialize(): Promise<void> {
    this.dependencies.outputManager.log('Analysis manager initialized');
    
    // Set max concurrent analyses based on configuration
    const config = this.dependencies.configManager.getConfig();
    this.maxConcurrentAnalyses = config.analysis.defaultMode === 'both' ? 2 : 1;
  }

  async runAnalysisWithSelection(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    const filePath = editor.document.fileName;
    const config = this.dependencies.configManager.getAnalysisConfig();

    // Check if we should ask user or use default
    if (config.defaultMode === 'ask') {
      await this.showAnalysisSelection(filePath);
    } else {
      await this.runAnalysisByType(config.defaultMode, filePath);
    }
  }

  async runStaticAnalysis(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    await this.runAnalysisByType('static', editor.document.fileName);
  }

  async runDynamicAnalysis(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found');
      return;
    }

    await this.runAnalysisByType('dynamic', editor.document.fileName);
  }

  private async showAnalysisSelection(filePath: string): Promise<void> {
    const options = [
      { label: 'Static Analysis', description: 'AI-powered vulnerability detection', value: 'static' },
      { label: 'Dynamic Analysis', description: 'Runtime fuzzing and sanitizer analysis', value: 'dynamic' },
      { label: 'Both Analyses', description: 'Run static and dynamic analysis', value: 'both' }
    ];

    const selection = await vscode.window.showQuickPick(options, {
      placeHolder: 'Select analysis type',
      title: 'CodeGuard Analysis Selection'
    });

    if (selection) {
      await this.runAnalysisByType(selection.value as 'static' | 'dynamic' | 'both', filePath);
    }
  }

  public async runAnalysisByType(type: 'static' | 'dynamic' | 'both', filePath: string): Promise<void> {
    // Check if analysis is already running
    if (this.currentAnalysis) {
      const choice = await vscode.window.showWarningMessage(
        'Analysis is already running. Do you want to cancel it and start a new one?',
        'Cancel Current', 'Keep Running'
      );
      
      if (choice === 'Keep Running') {
        return;
      }
      
      await this.cancelAnalysis();
    }

    // Validate file exists and is accessible
    try {
      const fileUri = vscode.Uri.file(filePath);
      await vscode.workspace.fs.stat(fileUri);
    } catch (error) {
      this.dependencies.outputManager.error(`File not accessible: ${filePath}`);
      vscode.window.showErrorMessage(`Cannot access file: ${filePath}`);
      return;
    }

    // Create cancellation token
    const cancellationToken = new vscode.CancellationTokenSource();
    this.currentAnalysis = {
      cancellationToken,
      type,
      filePath,
      startTime: Date.now()
    };

    try {
      this.dependencies.statusBarManager.showProgress(`Running ${type} analysis...`);
      this.dependencies.outputManager.log(`Starting ${type} analysis for: ${filePath}`);

      let result: AnalysisResult;

      if (type === 'static') {
        result = await this.dependencies.progressManager.showStaticAnalysisProgress(
          filePath,
          async (progress) => {
            return await this.runStaticAnalysisInternal(filePath, cancellationToken.token);
          }
        );
      } else if (type === 'dynamic') {
        result = await this.dependencies.progressManager.showDynamicAnalysisProgress(
          filePath,
          async (progress) => {
            return await this.runDynamicAnalysisInternal(filePath, cancellationToken.token);
          }
        );
      } else {
        result = await this.dependencies.progressManager.showCombinedAnalysisProgress(
          filePath,
          async (progress) => {
            return await this.runCombinedAnalysis(filePath, cancellationToken.token);
          }
        );
      }

      if (result.success) {
        this.handleAnalysisSuccess(result, filePath);
      } else {
        this.handleAnalysisError(result.errors || ['Unknown error occurred'], filePath);
      }

    } catch (error: any) {
      // Enhanced error handling with specific error types
      if (error.name === 'TimeoutError') {
        this.handleAnalysisError(['Analysis timed out. Please try again with a smaller file or increase timeout.'], filePath);
      } else if (error.name === 'DockerError') {
        this.handleAnalysisError(['Docker container failed to start. Please ensure Docker is running.'], filePath);
      } else if (error.name === 'NetworkError') {
        this.handleAnalysisError(['Network connection failed. Please check your internet connection.'], filePath);
      } else if (error.name === 'CancellationError') {
        this.dependencies.outputManager.log('Analysis cancelled by user');
        this.dependencies.statusBarManager.updateStatus('Analysis cancelled');
        return;
      } else {
        this.handleAnalysisError([error.message || 'An unexpected error occurred'], filePath);
      }
    } finally {
      this.currentAnalysis = null;
      this.dependencies.statusBarManager.updateStatus('CodeGuard Ready');
    }
  }

  private async runStaticAnalysisInternal(filePath: string, token: vscode.CancellationToken): Promise<AnalysisResult> {
    this.dependencies.outputManager.log('Starting static analysis...');
    const staticResult = await this.staticAnalysis.runAnalysis(filePath, token);
    
    return {
      success: staticResult.success,
      vulnerabilities: staticResult.vulnerabilities,
      errors: staticResult.errors,
      duration: staticResult.duration,
      type: 'static'
    };
  }

  private async runDynamicAnalysisInternal(filePath: string, token: vscode.CancellationToken): Promise<AnalysisResult> {
    this.dependencies.outputManager.log('Starting dynamic analysis...');
    const dynamicResult = await this.dynamicAnalysis.runAnalysis(filePath, token);
    
    return {
      success: dynamicResult.success,
      vulnerabilities: dynamicResult.vulnerabilities,
      errors: dynamicResult.errors,
      duration: dynamicResult.duration,
      type: 'dynamic'
    };
  }

  private async runCombinedAnalysis(filePath: string, token: vscode.CancellationToken): Promise<AnalysisResult> {
    this.dependencies.outputManager.log('Starting combined analysis (static + dynamic)...');
    
    // Run both analyses concurrently if supported
    const [staticResult, dynamicResult] = await Promise.all([
      this.runStaticAnalysisInternal(filePath, token),
      this.runDynamicAnalysisInternal(filePath, token)
    ]);
    
    // Combine results
    const allVulnerabilities = [
      ...staticResult.vulnerabilities,
      ...dynamicResult.vulnerabilities
    ];
    
    const allErrors = [
      ...(staticResult.errors || []),
      ...(dynamicResult.errors || [])
    ];
    
    const success = staticResult.success || dynamicResult.success;
    const duration = Math.max(staticResult.duration, dynamicResult.duration); // Use max duration for concurrent execution
    
    this.dependencies.outputManager.log(`Combined analysis completed - Static: ${staticResult.vulnerabilities.length} vulns, Dynamic: ${dynamicResult.vulnerabilities.length} vulns`);
    
    return {
      success,
      vulnerabilities: allVulnerabilities,
      errors: allErrors.length > 0 ? allErrors : undefined,
      duration,
      type: 'combined'
    };
  }

  private handleAnalysisSuccess(result: AnalysisResult, filePath: string): void {
    const { vulnerabilities, duration, type } = result;
    
    // Add vulnerabilities to diagnostics
    this.dependencies.diagnosticManager.addVulnerabilities(filePath, vulnerabilities);
    
    // Inline decorations logic
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.fileName === filePath) {
      // Clear previous decorations
      AnalysisManager.clearDecorations(editor);
      // Group ranges by severity
      const rangesBySeverity: { [key: string]: vscode.Range[] } = {
        'Critical': [], 'High': [], 'Medium': [], 'Low': [], 'Info': []
      };
      for (const vuln of vulnerabilities) {
        if (rangesBySeverity[vuln.severity]) {
          rangesBySeverity[vuln.severity].push(vuln.range);
        }
      }
      for (const severity of Object.keys(rangesBySeverity)) {
        const decoType = AnalysisManager.getDecorationType(severity);
        editor.setDecorations(decoType, rangesBySeverity[severity]);
      }
    }
    
    // Update status bar with color
    const vulnCount = vulnerabilities.length;
    if (vulnCount === 0) {
      this.dependencies.statusBarManager.showSuccess(`No vulnerabilities found (${duration}ms)`);
      this.dependencies.outputManager.log(`${type} analysis completed successfully - No vulnerabilities found`);
    } else {
      // Color logic: red for >=5 critical/high, orange for >=3, yellow for >0
      let color = 'yellow';
      const highCount = vulnerabilities.filter(v => v.severity === 'Critical' || v.severity === 'High').length;
      if (highCount >= 5) color = 'red';
      else if (highCount >= 3) color = 'orange';
      this.dependencies.statusBarManager.updateStatus(`$(alert) ${vulnCount} Vulnerabilities Found`, undefined);
      // Set color via command (VSCode API doesn't allow direct color, but you can use icons/colors in text)
      // Optionally, you could use a custom status bar item for more control
    }
    
    // Show results in output
    this.dependencies.outputManager.show();
    this.dependencies.outputManager.appendLine(`Analysis completed in ${duration}ms`);
    this.dependencies.outputManager.appendLine(`Found ${vulnCount} vulnerabilities`);

    // Print detailed vulnerability info
    if (vulnerabilities.length > 0) {
      this.dependencies.outputManager.appendLine('Vulnerability Details:');
      vulnerabilities.forEach((vuln, idx) => {
        this.dependencies.outputManager.appendLine(
          `#${idx + 1} [${vuln.severity}] ${vuln.message}` +
          (vuln.cweId ? ` (CWE-${vuln.cweId})` : '') +
          (vuln.cweDescription ? `\n    Description: ${vuln.cweDescription}` : '') +
          `\n    Line: ${vuln.line + 1}` +
          (vuln.source ? `\n    Source: ${vuln.source}` : '')
        );
      });
    }
    
    // Show summary notification
    if (vulnCount > 0) {
      vscode.window.showInformationMessage(
        `CodeGuard found ${vulnCount} vulnerability${vulnCount > 1 ? 'ies' : ''} in ${type} analysis`,
        'View Details'
      );
    } else {
      vscode.window.showInformationMessage(
        `CodeGuard analysis completed - No vulnerabilities found`,
        'View Details'
      );
    }
  }

  private handleAnalysisError(errors: string[], filePath: string): void {
    const errorMessage = errors.join(', ');
    this.dependencies.statusBarManager.showError('Analysis failed');
    this.dependencies.outputManager.error(`Analysis failed: ${errorMessage}`);
    vscode.window.showErrorMessage(`CodeGuard analysis failed: ${errorMessage}`);
  }

  async cancelAnalysis(): Promise<void> {
    if (this.currentAnalysis) {
      const duration = Date.now() - this.currentAnalysis.startTime;
      this.currentAnalysis.cancellationToken.cancel();
      this.currentAnalysis = null;
      this.dependencies.statusBarManager.updateStatus('Analysis cancelled');
      this.dependencies.outputManager.log(`Analysis cancelled by user after ${duration}ms`);
    }
  }

  async fixVulnerability(document: vscode.TextDocument, range: vscode.Range): Promise<void> {
    const fixedCode = await this.staticAnalysis.fixVulnerability(document, range);
    if (fixedCode) {
      // Apply the fix to the document
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, range, fixedCode);
      await vscode.workspace.applyEdit(edit);
      this.dependencies.outputManager.log('Vulnerability fix applied successfully');
      vscode.window.showInformationMessage('Vulnerability fix applied successfully');
    } else {
      vscode.window.showInformationMessage('No fix available for this vulnerability');
    }
  }

  async registerUser(): Promise<void> {
    // TODO: Implement user registration for dynamic analysis
    this.dependencies.outputManager.log('User registration not yet implemented');
    vscode.window.showInformationMessage('User registration feature coming soon!');
  }

  getCurrentAnalysis(): { type: string; filePath: string; duration: number } | null {
    if (!this.currentAnalysis) {
      return null;
    }
    
    return {
      type: this.currentAnalysis.type,
      filePath: this.currentAnalysis.filePath,
      duration: Date.now() - this.currentAnalysis.startTime
    };
  }

  isAnalysisRunning(): boolean {
    return this.currentAnalysis !== null;
  }

  async cleanup(): Promise<void> {
    await this.cancelAnalysis();
    this.dependencies.outputManager.log('Analysis manager cleaned up');
  }

  private static getDecorationType(severity: string): vscode.TextEditorDecorationType {
    if (!this.decorationTypes[severity]) {
      let options: vscode.DecorationRenderOptions;
      switch (severity) {
        case 'Critical':
          options = {
            backgroundColor: 'rgba(139, 0, 0, 0.25)',
            isWholeLine: true,
            borderWidth: '0 0 0 4px',
            borderStyle: 'solid',
            borderColor: 'rgba(139, 0, 0, 0.9)',
            after: { contentText: '  ⚠️ CRITICAL Risk', color: 'darkred', fontWeight: 'bold' }
          };
          break;
        case 'High':
          options = {
            backgroundColor: 'rgba(255, 0, 0, 0.15)',
            isWholeLine: true,
            borderWidth: '0 0 0 4px',
            borderStyle: 'solid',
            borderColor: 'rgba(255, 0, 0, 0.8)',
            after: { contentText: '  ⚠️ High Risk', color: 'red', fontWeight: 'normal' }
          };
          break;
        case 'Medium':
          options = {
            backgroundColor: 'rgba(255, 165, 0, 0.15)',
            isWholeLine: true,
            borderWidth: '0 0 0 4px',
            borderStyle: 'solid',
            borderColor: 'rgba(255, 165, 0, 0.8)',
            after: { contentText: '  ⚠️ Medium Risk', color: 'orange', fontWeight: 'normal' }
          };
          break;
        case 'Low':
          options = {
            backgroundColor: 'rgba(0, 191, 255, 0.15)',
            isWholeLine: true,
            borderWidth: '0 0 0 4px',
            borderStyle: 'solid',
            borderColor: 'rgba(0, 191, 255, 0.8)',
            after: { contentText: '  ⚠️ Low Risk', color: 'blue', fontWeight: 'normal' }
          };
          break;
        case 'Info':
        default:
          options = {
            backgroundColor: 'rgba(200, 200, 200, 0.15)',
            isWholeLine: true,
            borderWidth: '0 0 0 4px',
            borderStyle: 'solid',
            borderColor: 'rgba(150, 150, 150, 0.8)',
            after: { contentText: '  ℹ️ Info', color: 'gray', fontWeight: 'normal' }
          };
      }
      this.decorationTypes[severity] = vscode.window.createTextEditorDecorationType(options);
      this.decorationDisposables.push(this.decorationTypes[severity]);
    }
    return this.decorationTypes[severity];
  }

  private static clearDecorations(editor: vscode.TextEditor) {
    for (const deco of Object.values(this.decorationTypes)) {
      editor.setDecorations(deco, []);
    }
  }
} 