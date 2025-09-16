/**
 * Shared utilities for benchmarks to reduce code duplication
 */

import { performance } from 'perf_hooks';
import * as os from 'os';
import * as fs from 'fs';

export class BenchmarkUtils {
  /**
   * Generate test data with different patterns
   */
  static generateTestData(
    size: number,
    dimensions: number,
    pattern: 'random' | 'sinusoidal' | 'mixed' = 'mixed'
  ): number[][] {
    const data: number[][] = [];

    for (let i = 0; i < size; i++) {
      const point: number[] = [];

      for (let d = 0; d < dimensions; d++) {
        let value: number;

        switch (pattern) {
          case 'random':
            value = Math.random() * 10;
            break;
          case 'sinusoidal':
            value = Math.sin(i * 0.1 + d) * 5 + (Math.random() - 0.5);
            break;
          case 'mixed':
            // Mix of patterns (similar to existing implementations)
            const center = (i % 5) * 2;
            value = center + (Math.random() - 0.5) * 2;
            // Add occasional anomalies
            if (Math.random() < 0.001) {
              value += (Math.random() > 0.5 ? 1 : -1) * 10;
            }
            break;
        }

        point.push(value);
      }

      data.push(point);
    }

    return data;
  }

  /**
   * Generate mono-variable time series data
   */
  static generateMonoVariableData(
    size: number,
    anomalyRate: number = 0.001
  ): number[] {
    const data: number[] = [];

    for (let i = 0; i < size; i++) {
      // Seasonal pattern with noise
      let value = Math.sin(i * 2 * Math.PI / 288) * 10 +  // Daily pattern
                 Math.sin(i * 2 * Math.PI / 2016) * 5 +    // Weekly pattern
                 (Math.random() - 0.5) * 2;                 // Noise

      // Inject anomalies
      if (Math.random() < anomalyRate) {
        value += (Math.random() > 0.5 ? 1 : -1) * 20;
      }

      data.push(value);
    }

    return data;
  }

  /**
   * Get current memory usage in MB
   */
  static getMemoryUsageMB(): number {
    if (global.gc) {
      global.gc();
    }
    const usage = process.memoryUsage();
    return usage.heapUsed / 1024 / 1024;
  }

  /**
   * Calculate percentiles from an array of values
   */
  static calculatePercentiles(values: number[]): {
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
    mean: number;
  } {
    const sorted = [...values].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      min: sorted[0],
      max: sorted[len - 1],
      mean: values.reduce((a, b) => a + b, 0) / len,
      p50: sorted[Math.floor(len * 0.5)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)]
    };
  }

  /**
   * Log system information
   */
  static logSystemInfo(): void {
    console.log('=== System Information ===');
    console.log('Node.js:', process.version);
    console.log('Platform:', process.platform, process.arch);
    console.log('CPU:', os.cpus()[0].model);
    console.log('CPU Cores:', os.cpus().length);
    console.log('Memory:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
    console.log('=========================\n');
  }

  /**
   * Measure performance of an operation
   */
  static measurePerformance<T>(
    operation: () => T,
    iterations: number = 1
  ): {
    result: T;
    totalTime: number;
    avgTime: number;
    throughput: number;
  } {
    const start = performance.now();
    let result: T;

    for (let i = 0; i < iterations; i++) {
      result = operation();
    }

    const totalTime = performance.now() - start;

    return {
      result: result!,
      totalTime,
      avgTime: totalTime / iterations,
      throughput: (iterations / totalTime) * 1000 // ops per second
    };
  }

  /**
   * Warm up a function before benchmarking
   */
  static warmup(operation: () => void, iterations: number = 100): void {
    for (let i = 0; i < iterations; i++) {
      operation();
    }
  }

  /**
   * Format number with appropriate units
   */
  static formatNumber(value: number, decimals: number = 2): string {
    if (value >= 1e9) return (value / 1e9).toFixed(decimals) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(decimals) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(decimals) + 'K';
    return value.toFixed(decimals);
  }

  /**
   * Save benchmark results to JSON file
   */
  static saveResults(results: any, baseFilename: string = 'benchmark'): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${baseFilename}-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    return filename;
  }

  /**
   * Print a formatted table of results
   */
  static printResultsTable(results: Array<{
    name: string;
    throughput?: number;
    latencyP50?: number;
    latencyP95?: number;
    latencyP99?: number;
    memory?: number;
    [key: string]: any;
  }>): void {
    console.table(results.map(r => ({
      'Test': r.name,
      'Throughput': r.throughput ? this.formatNumber(r.throughput, 0) + ' ops/s' : 'N/A',
      'P50 Latency': r.latencyP50 ? r.latencyP50.toFixed(3) + ' ms' : 'N/A',
      'P95 Latency': r.latencyP95 ? r.latencyP95.toFixed(3) + ' ms' : 'N/A',
      'P99 Latency': r.latencyP99 ? r.latencyP99.toFixed(3) + ' ms' : 'N/A',
      'Memory': r.memory ? r.memory.toFixed(2) + ' MB' : 'N/A'
    })));
  }
}