import * as vscode from 'vscode';

export interface Vulnerability {
  id: string;
  type: 'static' | 'dynamic';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  message: string;
  line: number;
  column?: number;
  range: vscode.Range;
  cweId?: string;
  cweDescription?: string;
  confidence?: number;
  source: string;
  details?: any;
}

export class DiagnosticManager {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private context: vscode.ExtensionContext;
  private vulnerabilities: Map<string, Vulnerability[]> = new Map();

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('codeguard');
    context.subscriptions.push(this.diagnosticCollection);
  }

  initialize(): void {
    // Clear any existing diagnostics
    this.diagnosticCollection.clear();
    this.vulnerabilities.clear();
  }

  addVulnerability(filePath: string, vulnerability: Vulnerability): void {
    if (!this.vulnerabilities.has(filePath)) {
      this.vulnerabilities.set(filePath, []);
    }
    
    this.vulnerabilities.get(filePath)!.push(vulnerability);
    this.updateDiagnostics(filePath);
  }

  addVulnerabilities(filePath: string, vulnerabilities: Vulnerability[]): void {
    if (!this.vulnerabilities.has(filePath)) {
      this.vulnerabilities.set(filePath, []);
    }
    
    this.vulnerabilities.get(filePath)!.push(...vulnerabilities);
    this.updateDiagnostics(filePath);
  }

  clearVulnerabilities(filePath?: string): void {
    if (filePath) {
      this.vulnerabilities.delete(filePath);
      this.diagnosticCollection.delete(vscode.Uri.file(filePath));
    } else {
      this.vulnerabilities.clear();
      this.diagnosticCollection.clear();
    }
  }

  getVulnerabilities(filePath: string): Vulnerability[] {
    return this.vulnerabilities.get(filePath) || [];
  }

  getAllVulnerabilities(): Vulnerability[] {
    const allVulnerabilities: Vulnerability[] = [];
    for (const vulnerabilities of this.vulnerabilities.values()) {
      allVulnerabilities.push(...vulnerabilities);
    }
    return allVulnerabilities;
  }

  private updateDiagnostics(filePath: string): void {
    const vulnerabilities = this.vulnerabilities.get(filePath);
    if (!vulnerabilities) {
      this.diagnosticCollection.delete(vscode.Uri.file(filePath));
      return;
    }

    const diagnostics: vscode.Diagnostic[] = vulnerabilities.map(vuln => {
      const diagnostic = new vscode.Diagnostic(
        vuln.range,
        this.formatVulnerabilityMessage(vuln),
        this.getDiagnosticSeverity(vuln.severity)
      );

      // Add additional information
      diagnostic.source = 'CodeGuard';
      diagnostic.code = vuln.cweId;
      
      // Add related information
      if (vuln.cweDescription) {
        diagnostic.relatedInformation = [
          new vscode.DiagnosticRelatedInformation(
            new vscode.Location(vscode.Uri.file(filePath), vuln.range),
            vuln.cweDescription
          )
        ];
      }

      return diagnostic;
    });

    this.diagnosticCollection.set(vscode.Uri.file(filePath), diagnostics);
  }

  private formatVulnerabilityMessage(vulnerability: Vulnerability): string {
    let message = `[${vulnerability.type.toUpperCase()}] ${vulnerability.message}`;
    
    if (vulnerability.cweId) {
      message += ` (CWE-${vulnerability.cweId})`;
    }
    
    if (vulnerability.confidence !== undefined) {
      message += ` [Confidence: ${vulnerability.confidence}%]`;
    }
    
    return message;
  }

  private getDiagnosticSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity.toLowerCase()) {
      case 'critical':
        return vscode.DiagnosticSeverity.Error;
      case 'high':
        return vscode.DiagnosticSeverity.Error;
      case 'medium':
        return vscode.DiagnosticSeverity.Warning;
      case 'low':
        return vscode.DiagnosticSeverity.Information;
      case 'info':
        return vscode.DiagnosticSeverity.Hint;
      default:
        return vscode.DiagnosticSeverity.Warning;
    }
  }

  getVulnerabilityCount(filePath?: string): number {
    if (filePath) {
      return this.vulnerabilities.get(filePath)?.length || 0;
    }
    
    let total = 0;
    for (const vulnerabilities of this.vulnerabilities.values()) {
      total += vulnerabilities.length;
    }
    return total;
  }

  getVulnerabilityCountBySeverity(severity: string, filePath?: string): number {
    const vulnerabilities = filePath 
      ? this.vulnerabilities.get(filePath) || []
      : this.getAllVulnerabilities();
    
    return vulnerabilities.filter(v => v.severity.toLowerCase() === severity.toLowerCase()).length;
  }

  cleanup(): void {
    this.diagnosticCollection.clear();
    this.vulnerabilities.clear();
  }

  dispose(): void {
    this.diagnosticCollection.dispose();
  }
} 