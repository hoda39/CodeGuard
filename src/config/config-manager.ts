import * as vscode from 'vscode';

export interface CodeGuardConfig {
  // Analysis settings
  analysis: {
    defaultMode: 'ask' | 'static' | 'dynamic' | 'both';
  };
  
  // Static analysis settings
  static: {
    inferenceMode: 'Local' | 'On Premise';
    inferenceServerURL: string;
    useCUDA: boolean;
  };
  
  // Dynamic analysis settings
  dynamic: {
    apiURL: string;
    containerTimeout: number;
  };
  
  // Diagnostics settings
  diagnostics: {
    informationLevel: 'Verbose' | 'Fluent';
    diagnosticMessageInformation: string[];
    showDescription: boolean;
    highlightSeverityType: 'Error' | 'Warning' | 'Information' | 'Hint';
    maxNumberOfLines: number;
    delayBeforeAnalysis: number;
  };
  
  // UI settings
  ui: {
    showProgressNotifications: boolean;
    showStatusBar: boolean;
    autoShowOutput: boolean;
    progressLocation: 'notification' | 'window';
  };
}

export class ConfigManager {
  private context: vscode.ExtensionContext;
  private config: CodeGuardConfig;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.config = this.getDefaultConfig();
  }

  async initialize(): Promise<void> {
    this.loadConfig();
    
    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('codeguard')) {
        this.loadConfig();
      }
    });
  }

  private getDefaultConfig(): CodeGuardConfig {
    return {
      analysis: {
        defaultMode: 'ask'
      },
      static: {
        inferenceMode: 'Local',
        inferenceServerURL: 'http://localhost:5000',
        useCUDA: false
      },
      dynamic: {
        apiURL: 'https://localhost:3000',
        containerTimeout: 600000
      },
      diagnostics: {
        informationLevel: 'Verbose',
        diagnosticMessageInformation: [
          'lineNumber',
          'cweID',
          'cweType',
          'cweSummary',
          'severityLevel',
          'severityScore'
        ],
        showDescription: true,
        highlightSeverityType: 'Error',
        maxNumberOfLines: 1,
        delayBeforeAnalysis: 1500
      },
      ui: {
        showProgressNotifications: true,
        showStatusBar: true,
        autoShowOutput: true,
        progressLocation: 'notification'
      }
    };
  }

  private loadConfig(): void {
    const vsConfig = vscode.workspace.getConfiguration('codeguard');
    
    // Load analysis settings
    this.config.analysis.defaultMode = vsConfig.get('analysis.defaultMode', 'ask');
    
    // Load static analysis settings
    this.config.static.inferenceMode = vsConfig.get('static.inferenceMode', 'Local');
    this.config.static.inferenceServerURL = vsConfig.get('static.inferenceServerURL', 'http://localhost:5000');
    this.config.static.useCUDA = vsConfig.get('static.useCUDA', false);
    
    // Load dynamic analysis settings
    this.config.dynamic.apiURL = vsConfig.get('dynamic.apiURL', 'https://localhost:3000');
    this.config.dynamic.containerTimeout = vsConfig.get('dynamic.containerTimeout', 600000);
    
    // Load diagnostics settings
    this.config.diagnostics.informationLevel = vsConfig.get('diagnostics.informationLevel', 'Verbose');
    this.config.diagnostics.diagnosticMessageInformation = vsConfig.get('diagnostics.diagnosticMessageInformation', [
      'lineNumber',
      'cweID',
      'cweType',
      'cweSummary',
      'severityLevel',
      'severityScore'
    ]);
    this.config.diagnostics.showDescription = vsConfig.get('diagnostics.showDescription', true);
    this.config.diagnostics.highlightSeverityType = vsConfig.get('diagnostics.highlightSeverityType', 'Error');
    this.config.diagnostics.maxNumberOfLines = vsConfig.get('diagnostics.maxNumberOfLines', 1);
    this.config.diagnostics.delayBeforeAnalysis = vsConfig.get('diagnostics.delayBeforeAnalysis', 1500);
    
    // Load UI settings
    this.config.ui.showProgressNotifications = vsConfig.get('ui.showProgressNotifications', true);
    this.config.ui.showStatusBar = vsConfig.get('ui.showStatusBar', true);
    this.config.ui.autoShowOutput = vsConfig.get('ui.autoShowOutput', true);
    this.config.ui.progressLocation = vsConfig.get('ui.progressLocation', 'notification');
  }

  getConfig(): CodeGuardConfig {
    return this.config;
  }

  getAnalysisConfig() {
    return this.config.analysis;
  }

  getStaticConfig() {
    return this.config.static;
  }

  getDynamicConfig() {
    return this.config.dynamic;
  }

  getDiagnosticsConfig() {
    return this.config.diagnostics;
  }

  getUIConfig() {
    return this.config.ui;
  }

  async updateConfig(updates: Partial<CodeGuardConfig>): Promise<void> {
    const vsConfig = vscode.workspace.getConfiguration('codeguard');
    
    // Update analysis settings
    if (updates.analysis) {
      await vsConfig.update('analysis.defaultMode', updates.analysis.defaultMode);
    }
    
    // Update static settings
    if (updates.static) {
      await vsConfig.update('static.inferenceMode', updates.static.inferenceMode);
      await vsConfig.update('static.inferenceServerURL', updates.static.inferenceServerURL);
      await vsConfig.update('static.useCUDA', updates.static.useCUDA);
    }
    
    // Update dynamic settings
    if (updates.dynamic) {
      await vsConfig.update('dynamic.apiURL', updates.dynamic.apiURL);
      await vsConfig.update('dynamic.containerTimeout', updates.dynamic.containerTimeout);
    }
    
    // Update diagnostics settings
    if (updates.diagnostics) {
      await vsConfig.update('diagnostics.informationLevel', updates.diagnostics.informationLevel);
      await vsConfig.update('diagnostics.diagnosticMessageInformation', updates.diagnostics.diagnosticMessageInformation);
      await vsConfig.update('diagnostics.showDescription', updates.diagnostics.showDescription);
      await vsConfig.update('diagnostics.highlightSeverityType', updates.diagnostics.highlightSeverityType);
      await vsConfig.update('diagnostics.maxNumberOfLines', updates.diagnostics.maxNumberOfLines);
      await vsConfig.update('diagnostics.delayBeforeAnalysis', updates.diagnostics.delayBeforeAnalysis);
    }
    
    // Update UI settings
    if (updates.ui) {
      await vsConfig.update('ui.showProgressNotifications', updates.ui.showProgressNotifications);
      await vsConfig.update('ui.showStatusBar', updates.ui.showStatusBar);
      await vsConfig.update('ui.autoShowOutput', updates.ui.autoShowOutput);
      await vsConfig.update('ui.progressLocation', updates.ui.progressLocation);
    }
    
    // Reload config
    this.loadConfig();
  }
} 