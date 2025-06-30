import { EventEmitter } from 'events';
import { CryptoService } from './crypto';
import { TokenService } from './token';
import { AnalysisCore } from '../../core/analysis-core';
import { Orchestrator } from '../../core/orchestrator';
import { compileSourceFile } from '../../core/compile';
import dotenv from 'dotenv';
import path from 'path';
import * as fs from 'fs';
import * as os from 'os';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

/**
 * Represents an active analysis session.
 */
interface AnalysisSession {
  status: 'initializing' | 'fuzzing' | 'analyzing' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: any;
  error?: string;
  cancellationToken: CancellationToken;
  startTime: number;
  decryptedContent?: string;
  tempFilePath?: string;
  crashes?: number;
}

/**
 * CancellationToken for signaling cancellation
 */
class CancellationToken {
  private isCancelled = false;
  private emitter = new EventEmitter();

  cancel() {
    if (!this.isCancelled) {
      this.isCancelled = true;
      this.emitter.emit('cancel');
    }
  }

  get isCancellationRequested() {
    return this.isCancelled;
  }

  onCancel(callback: () => void) {
    this.emitter.on('cancel', callback);
  }

  dispose() {
    this.emitter.removeAllListeners();
  }
}

export class AnalysisService {
  private encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  private analysisCore = new AnalysisCore();
  private activeAnalyses = new Map<string, AnalysisSession>();
  private static ANALYSIS_TIMEOUT = 300000; // 5 minutes

  async startAnalysis(
    encryptedContent: string,
    contentIV: string,
    encryptedPath: string,
    pathIV: string
  ): Promise<string> {
    const analysisId = TokenService.generateAnalysisToken();
    const cancellationToken = new CancellationToken();
    let timeout!: NodeJS.Timeout;

    try {
      // Decrypt payload
      const decryptedContent = CryptoService.decrypt(encryptedContent, this.encryptionKey, contentIV);
      const decryptedPath = CryptoService.decrypt(encryptedPath, this.encryptionKey, pathIV);

      // Write to temporary file
      const tempFilePath = process.env.NODE_ENV !== 'development'
        ? this.createSecureTempFile(decryptedPath, decryptedContent)
        : decryptedPath;

      const session: AnalysisSession = {
        status: 'running',
        decryptedContent,
        tempFilePath,
        cancellationToken,
        startTime: Date.now()
      };
      this.activeAnalyses.set(analysisId, session);

      // Set overall timeout
      timeout = setTimeout(() => this.handleAnalysisTimeout(analysisId), AnalysisService.ANALYSIS_TIMEOUT);

      // Execute analysis
      await this.executeAnalysis(analysisId, tempFilePath, cancellationToken);
      return analysisId;
    } catch (error) {
      this.handleAnalysisError(analysisId, error);
      throw error;
    } finally {
      if (timeout) clearTimeout(timeout);
      // Schedule cleanup after TTL
      setTimeout(() => this.cleanupAnalysis(analysisId), AnalysisService.ANALYSIS_TIMEOUT);
    }
  }

  getAnalysisStatus(analysisId: string) {
    const session = this.activeAnalyses.get(analysisId);
    if (!session) return null;
    return {
      id: analysisId,
      state: session.status,
      results: session.result,
      error: session.error,
      duration: Date.now() - session.startTime,
      crashes: session.crashes
    };
  }

  cancelAnalysis(analysisId: string): boolean {
    const session = this.activeAnalyses.get(analysisId);
    if (!session) return false;
    if (['running','initializing','fuzzing','analyzing'].includes(session.status)) {
      session.cancellationToken.cancel();
      this.updateSession(analysisId, { status: 'cancelled' });
      this.cleanupAnalysis(analysisId);
      return true;
    }
    return false;
  }

  private async executeAnalysis(
    analysisId: string,
    filePath: string,
    cancellationToken: CancellationToken
  ) {
    if (process.env.ANALYSIS_MODE === 'FUZZING') {
      await this.executeFuzzingAnalysis(analysisId, filePath, cancellationToken);
      return;
    }

    // DIRECT mode: single-input analysis
    this.updateSession(analysisId, { status: 'initializing' });

    // Prepare dummy input
    const inputFile = path.join(path.dirname(filePath), 'analysis_input');
    fs.writeFileSync(inputFile, 'A'.repeat(1000));

    const allReports: any[] = [];

    // Loop per sanitizer
    for (const sanitizer of ['asan','ubsan','msan'] as const) {
      this.updateSession(analysisId, { status: 'analyzing', crashes: allReports.length });
      this.handleProgress(analysisId, `Compiling for ${sanitizer.toUpperCase()}`);

      const binPath = filePath.replace(/\.(c|cpp)$/, `_${sanitizer}`);
      try {
        await compileSourceFile(filePath, binPath, {
          asan:  sanitizer === 'asan',
          ubsan: sanitizer === 'ubsan',
          msan:  sanitizer === 'msan'
        });
      } catch (compileErr) {
        this.handleProgress(analysisId, `Compile failed for ${sanitizer}`);
        continue;
      }

      this.handleProgress(analysisId, `Running CASR for ${sanitizer.toUpperCase()}`);
      const reports = await this.analysisCore.analyzeCrashes(
        binPath,
        inputFile,
        [sanitizer],
        { cancellationToken, onProgress: msg => this.handleProgress(analysisId, `[${sanitizer}] ${msg}`) }
      );

      reports.forEach(r => { r.sanitizerType = sanitizer; allReports.push(r); });

      // Cleanup binary
      await fs.promises.unlink(binPath).catch(() => {});
    }

    // Deduplicate
    const seen = new Set<string>();
    const deduped = allReports.filter(r => {
      const key = `${r.CrashLine}|${r.cweId}`;
      return seen.has(key) ? false : (seen.add(key), true);
    });

    this.updateSession(analysisId, {
      status: 'completed',
      result: deduped,
      crashes: deduped.length
    });

    // Cleanup input & temp source
    await fs.promises.unlink(inputFile).catch(() => {});
    if (process.env.NODE_ENV !== 'development') {
      await fs.promises.unlink(filePath).catch(() => {});
    }
  }

  // Fuzzing mode unchanged
  private async executeFuzzingAnalysis(
    analysisId: string,
    sourceFilePath: string,
    cancellationToken: CancellationToken
  ) {
    this.updateSession(analysisId, { status: 'initializing' });
    const orchestrator = new Orchestrator(sourceFilePath, process.env.AFL_PATH!, process.env.ECLIPSER_DLL_PATH!);
    try {
      this.updateSession(analysisId, { status: 'fuzzing' });
      this.handleProgress(analysisId, 'Running fuzzing...');
      await orchestrator.run(AnalysisService.ANALYSIS_TIMEOUT);

      const crashInputs = orchestrator.getCrashInputs();
      const crashCount = crashInputs.length;
      this.updateSession(analysisId, { crashes: crashCount });

      if (crashCount === 0) {
        this.updateSession(analysisId, { status: 'completed', result: [] });
        return;
      }

      this.updateSession(analysisId, { status: 'analyzing' });
      const allReports: any[] = [];
      for (const cfg of orchestrator.getAllBinaryPaths()) {
        this.handleProgress(analysisId, `Analyzing ${cfg.type.toUpperCase()}`);
        const reps = await this.analysisCore.analyzeCrashes(cfg.path, crashInputs, ['asan','ubsan','msan'], { cancellationToken, onProgress: msg => this.handleProgress(analysisId, `[${cfg.type}] ${msg}`) });
        allReports.push(...reps);
      }

      this.updateSession(analysisId, { status: 'completed', result: allReports });
    } catch (error) {
      this.handleAnalysisError(analysisId, error);
    }
  }

  private handleAnalysisTimeout(id: string) {
    this.updateSession(id, { status: 'failed', error: 'Analysis timed out' });
    this.cleanupAnalysis(id);
  }

  private handleAnalysisError(id: string, error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    this.updateSession(id, { status: 'failed', error: msg });
  }

  private createSecureTempFile(originalPath: string, content: string): string {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sca-'));
    const fullPath = path.join(tmpDir, path.basename(originalPath));
    fs.writeFileSync(fullPath, content);
    return fullPath;
  }

  private cleanupAnalysis(id: string) {
    const sess = this.activeAnalyses.get(id);
    if (!sess) return;
    sess.cancellationToken.dispose();
    this.activeAnalyses.delete(id);
  }

  private updateSession(id: string, upd: Partial<AnalysisSession>) {
    const sess = this.activeAnalyses.get(id);
    if (sess) this.activeAnalyses.set(id, { ...sess, ...upd });
  }

  private handleProgress(id: string, msg: string) {
    const sess = this.activeAnalyses.get(id);
    if (sess && !['completed','failed','cancelled'].includes(sess.status)) {
      console.log(`[${id}] ${msg}`);
    }
  }

  public dispose() {
    Array.from(this.activeAnalyses.keys()).forEach(id => this.cleanupAnalysis(id));
  }
}
