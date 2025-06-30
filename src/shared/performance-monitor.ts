import * as vscode from 'vscode';
import { OutputManager } from '../ui/output-manager';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  memoryUsage: number;
  cpuUsage?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceThresholds {
  maxDuration: number;
  maxMemoryUsage: number;
  warningThreshold: number; // Percentage of max values
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private outputManager: OutputManager;

  constructor(outputManager: OutputManager, thresholds?: Partial<PerformanceThresholds>) {
    this.outputManager = outputManager;
    this.thresholds = {
      maxDuration: 300000, // 5 minutes
      maxMemoryUsage: 500 * 1024 * 1024, // 500MB
      warningThreshold: 0.8, // 80%
      ...thresholds
    };
  }

  async measureOperation<T>(
    operation: string,
    task: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    try {
      const result = await task();
      
      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;
      
      const metrics: PerformanceMetrics = {
        operation,
        duration: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        timestamp: new Date(),
        metadata
      };
      
      this.recordMetrics(metrics);
      this.checkPerformance(metrics);
      
      return result;
      
    } catch (error) {
      // Still record metrics even if operation fails
      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;
      
      const metrics: PerformanceMetrics = {
        operation,
        duration: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        timestamp: new Date(),
        metadata: { ...metadata, error: true }
      };
      
      this.recordMetrics(metrics);
      throw error;
    }
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last 1000 metrics to prevent memory bloat
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private checkPerformance(metrics: PerformanceMetrics): void {
    const durationWarning = metrics.duration > this.thresholds.maxDuration * this.thresholds.warningThreshold;
    const memoryWarning = metrics.memoryUsage > this.thresholds.maxMemoryUsage * this.thresholds.warningThreshold;
    
    if (durationWarning || memoryWarning) {
      this.outputManager.warning(
        `Performance warning for ${metrics.operation}: ` +
        `Duration: ${metrics.duration}ms, Memory: ${this.formatBytes(metrics.memoryUsage)}`
      );
    }
    
    if (metrics.duration > this.thresholds.maxDuration) {
      this.outputManager.error(
        `Performance threshold exceeded for ${metrics.operation}: ` +
        `Duration: ${metrics.duration}ms (max: ${this.thresholds.maxDuration}ms)`
      );
    }
    
    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      this.outputManager.error(
        `Memory threshold exceeded for ${metrics.operation}: ` +
        `Memory: ${this.formatBytes(metrics.memoryUsage)} (max: ${this.formatBytes(this.thresholds.maxMemoryUsage)})`
      );
    }
  }

  getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation);
    }
    return [...this.metrics];
  }

  getAverageMetrics(operation: string): {
    avgDuration: number;
    avgMemoryUsage: number;
    count: number;
  } {
    const operationMetrics = this.getMetrics(operation);
    
    if (operationMetrics.length === 0) {
      return { avgDuration: 0, avgMemoryUsage: 0, count: 0 };
    }
    
    const totalDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    const totalMemory = operationMetrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    
    return {
      avgDuration: totalDuration / operationMetrics.length,
      avgMemoryUsage: totalMemory / operationMetrics.length,
      count: operationMetrics.length
    };
  }

  generatePerformanceReport(): string {
    const report = ['=== CodeGuard Performance Report ==='];
    
    // Overall statistics
    const totalOperations = this.metrics.length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const totalMemory = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    
    report.push(`Total Operations: ${totalOperations}`);
    report.push(`Total Duration: ${this.formatDuration(totalDuration)}`);
    report.push(`Total Memory Usage: ${this.formatBytes(totalMemory)}`);
    
    if (totalOperations > 0) {
      report.push(`Average Duration: ${this.formatDuration(totalDuration / totalOperations)}`);
      report.push(`Average Memory Usage: ${this.formatBytes(totalMemory / totalOperations)}`);
    }
    
    // Per-operation statistics
    const operations = [...new Set(this.metrics.map(m => m.operation))];
    for (const operation of operations) {
      const avgMetrics = this.getAverageMetrics(operation);
      if (avgMetrics.count > 0) {
        report.push('');
        report.push(`${operation}:`);
        report.push(`  Count: ${avgMetrics.count}`);
        report.push(`  Average Duration: ${this.formatDuration(avgMetrics.avgDuration)}`);
        report.push(`  Average Memory: ${this.formatBytes(avgMetrics.avgMemoryUsage)}`);
      }
    }
    
    return report.join('\n');
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }
} 