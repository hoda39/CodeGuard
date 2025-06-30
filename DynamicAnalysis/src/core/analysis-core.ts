import { runWithCasr } from './casr';
import * as path from 'path';

interface CancellationToken {
  isCancellationRequested: boolean;
  onCancel(callback: () => void): void;
}

export class AnalysisCore {
  // Unified analysis method for both single and multiple crashes
  async analyzeCrashes(
    executablePath: string,
    crashInputs: string | string[], // Accept single string or array
    sanitizerTypes: ('asan' | 'ubsan' | 'msan')[] = ['asan', 'ubsan', 'msan'],
    options: {
      cancellationToken?: CancellationToken;
      onProgress?: (message: string) => void;
    }
  ) {
    // Normalize input to always be an array
    const inputs = Array.isArray(crashInputs) 
      ? crashInputs 
      : [crashInputs];
    
    const casrReports = [];
  
    for (const inputFile of inputs) {
      if (options.cancellationToken?.isCancellationRequested) {
        throw new Error('Analysis cancelled');
      }

      options.onProgress?.(`Analyzing input: ${path.basename(inputFile)}`);
      
      // Run analysis for all sanitizer types
      const reports = await runWithCasr(
        executablePath,
        inputFile,
        sanitizerTypes,
        options.cancellationToken
      );

      // Add input file to each report
      for (const report of reports) {
        report.inputFile = inputFile;
        casrReports.push(report);
      }
    }

    return casrReports;
  }
}