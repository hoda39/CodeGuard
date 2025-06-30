import * as vscode from 'vscode';
import { OutputManager } from './output-manager';

export interface ProgressOptions {
  title: string;
  cancellable?: boolean;
  location?: vscode.ProgressLocation;
}

export interface ProgressStep {
  message: string;
  increment?: number;
}

export class ProgressManager {
  constructor(private outputManager: OutputManager) {}

  async withProgress<T>(
    options: ProgressOptions,
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: options.location || vscode.ProgressLocation.Notification,
        title: options.title,
        cancellable: options.cancellable || false
      },
      async (progress) => {
        this.outputManager.log(`Starting: ${options.title}`);
        try {
          const result = await task(progress);
          this.outputManager.log(`Completed: ${options.title}`);
          return result;
        } catch (error: any) {
          this.outputManager.error(`Failed: ${options.title} - ${error.message}`);
          throw error;
        }
      }
    );
  }

  async withSteps<T>(
    options: ProgressOptions,
    steps: ProgressStep[],
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Promise<T> {
    return this.withProgress(options, async (progress) => {
      let currentStep = 0;
      const stepIncrement = 100 / steps.length;

      // Create a progress wrapper that automatically advances through steps
      const stepProgress: vscode.Progress<{ message?: string; increment?: number }> = {
        report: (update) => {
          if (update.message) {
            progress.report({
              message: `[${currentStep + 1}/${steps.length}] ${update.message}`,
              increment: update.increment || 0
            });
          } else {
            progress.report(update);
          }
        }
      };

      // Report initial step
      if (steps.length > 0) {
        progress.report({
          message: `[1/${steps.length}] ${steps[0].message}`,
          increment: 0
        });
      }

      const result = await task(stepProgress);

      // Complete all steps
      for (let i = currentStep + 1; i < steps.length; i++) {
        progress.report({
          message: `[${i + 1}/${steps.length}] ${steps[i].message}`,
          increment: stepIncrement
        });
      }

      return result;
    });
  }

  showAnalysisProgress<T>(
    analysisType: string,
    filePath: string,
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Promise<T> {
    const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'Unknown file';
    
    return this.withProgress(
      {
        title: `CodeGuard ${analysisType} Analysis`,
        cancellable: true,
        location: vscode.ProgressLocation.Notification
      },
      async (progress) => {
        progress.report({ message: `Analyzing ${fileName}...` });
        return await task(progress);
      }
    );
  }

  showStaticAnalysisProgress<T>(
    filePath: string,
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Promise<T> {
    return this.showAnalysisProgress('Static', filePath, task);
  }

  showDynamicAnalysisProgress<T>(
    filePath: string,
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Promise<T> {
    return this.showAnalysisProgress('Dynamic', filePath, task);
  }

  showCombinedAnalysisProgress<T>(
    filePath: string,
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Promise<T> {
    return this.showAnalysisProgress('Combined', filePath, task);
  }
} 