/**
 * Performance Benchmarks for TRCF TypeScript Implementation
 * Based on Java RCF benchmark methodology
 */

import { performance } from 'perf_hooks';
import * as fs from 'fs';
import { ThresholdedRandomCutForest, SimplifiedRCF, ForestMode, TransformMethod } from '../src';

interface BenchmarkConfig {
  dimensions: number;
  shingleSize: number;
  numberOfTrees: number;
  sampleSize: number;
  parallel?: boolean;
  dataSize: number;
  warmupSize: number;
}

interface BenchmarkResult {
  operation: string;
  config: BenchmarkConfig;
  throughput: number; // operations per second
  latencyP50: number; // median latency in ms
  latencyP95: number; // 95th percentile latency in ms
  latencyP99: number; // 99th percentile latency in ms
  memoryUsed: number; // MB
}

export class TRCFBenchmark {
  private static readonly DEFAULT_CONFIG: BenchmarkConfig = {
    dimensions: 40,
    shingleSize: 1,
    numberOfTrees: 30,
    sampleSize: 256,
    dataSize: 50000,
    warmupSize: 25000
  };

  /**
   * Generate synthetic test data with mixture of normal distributions
   */
  private static generateTestData(size: number, dimensions: number): number[][] {
    const data: number[][] = [];
    const centers = [
      Array(dimensions).fill(0),
      Array(dimensions).fill(5),
      Array(dimensions).fill(-5)
    ];

    for (let i = 0; i < size; i++) {
      const center = centers[Math.floor(Math.random() * centers.length)];
      const point = center.map(c => c + (Math.random() - 0.5) * 2);
      data.push(point);
    }

    return data;
  }

  /**
   * Measure memory usage
   */
  private static getMemoryUsage(): number {
    if (global.gc) {
      global.gc();
    }
    const usage = process.memoryUsage();
    return usage.heapUsed / 1024 / 1024; // Convert to MB
  }

  /**
   * Calculate percentiles from latency array
   */
  private static calculatePercentiles(latencies: number[]): {
    p50: number;
    p95: number;
    p99: number;
  } {
    latencies.sort((a, b) => a - b);
    const p50Index = Math.floor(latencies.length * 0.5);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    return {
      p50: latencies[p50Index] || 0,
      p95: latencies[p95Index] || 0,
      p99: latencies[p99Index] || 0
    };
  }

  /**
   * Benchmark update operations only
   */
  static benchmarkUpdateOnly(config: BenchmarkConfig = this.DEFAULT_CONFIG): BenchmarkResult {
    const data = this.generateTestData(config.dataSize, config.dimensions);

    // Setup forest
    const rcf = new SimplifiedRCF({
      dimensions: config.dimensions * config.shingleSize,
      shingleSize: config.shingleSize,
      numberOfTrees: config.numberOfTrees,
      sampleSize: config.sampleSize,
      timeDecay: 0
    });

    const trcf = new ThresholdedRandomCutForest({
      dimensions: config.dimensions,
      shingleSize: config.shingleSize
    });
    trcf.setForest(rcf);

    // Warmup
    for (let i = 0; i < config.warmupSize; i++) {
      const point = data[i % data.length];
      trcf.process(point, i * 100);
    }

    const memBefore = this.getMemoryUsage();
    const latencies: number[] = [];

    // Benchmark
    const startTime = performance.now();
    for (let i = config.warmupSize; i < config.dataSize; i++) {
      const pointStart = performance.now();
      trcf.process(data[i % data.length], i * 100);
      latencies.push(performance.now() - pointStart);
    }
    const endTime = performance.now();

    const memAfter = this.getMemoryUsage();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds
    const operations = config.dataSize - config.warmupSize;
    const percentiles = this.calculatePercentiles(latencies);

    return {
      operation: 'updateOnly',
      config,
      throughput: operations / totalTime,
      latencyP50: percentiles.p50,
      latencyP95: percentiles.p95,
      latencyP99: percentiles.p99,
      memoryUsed: memAfter - memBefore
    };
  }

  /**
   * Benchmark score operations only
   */
  static benchmarkScoreOnly(config: BenchmarkConfig = this.DEFAULT_CONFIG): BenchmarkResult {
    const data = this.generateTestData(config.dataSize, config.dimensions);

    // Setup and warmup forest
    const rcf = new SimplifiedRCF({
      dimensions: config.dimensions * config.shingleSize,
      shingleSize: config.shingleSize,
      numberOfTrees: config.numberOfTrees,
      sampleSize: config.sampleSize,
      timeDecay: 0
    });

    const trcf = new ThresholdedRandomCutForest({
      dimensions: config.dimensions,
      shingleSize: config.shingleSize
    });
    trcf.setForest(rcf);

    // Warmup with initial data
    for (let i = 0; i < config.warmupSize; i++) {
      trcf.process(data[i % data.length], i * 100);
    }

    const memBefore = this.getMemoryUsage();
    const latencies: number[] = [];
    let totalScore = 0;

    // Benchmark scoring
    const startTime = performance.now();
    for (let i = config.warmupSize; i < config.dataSize; i++) {
      const pointStart = performance.now();
      const result = trcf.process(data[i % data.length], i * 100);
      totalScore += result.anomalyScore;
      latencies.push(performance.now() - pointStart);

      // Update sparingly (1% of the time) like in Java benchmark
      if (Math.random() < 0.01) {
        trcf.process(data[i % data.length], i * 100);
      }
    }
    const endTime = performance.now();

    const memAfter = this.getMemoryUsage();
    const totalTime = (endTime - startTime) / 1000;
    const operations = config.dataSize - config.warmupSize;
    const percentiles = this.calculatePercentiles(latencies);

    return {
      operation: 'scoreOnly',
      config,
      throughput: operations / totalTime,
      latencyP50: percentiles.p50,
      latencyP95: percentiles.p95,
      latencyP99: percentiles.p99,
      memoryUsed: memAfter - memBefore
    };
  }

  /**
   * Benchmark score and update operations
   */
  static benchmarkScoreAndUpdate(config: BenchmarkConfig = this.DEFAULT_CONFIG): BenchmarkResult {
    const data = this.generateTestData(config.dataSize, config.dimensions);

    const rcf = new SimplifiedRCF({
      dimensions: config.dimensions * config.shingleSize,
      shingleSize: config.shingleSize,
      numberOfTrees: config.numberOfTrees,
      sampleSize: config.sampleSize,
      timeDecay: 0
    });

    const trcf = new ThresholdedRandomCutForest({
      dimensions: config.dimensions,
      shingleSize: config.shingleSize
    });
    trcf.setForest(rcf);

    // Warmup
    for (let i = 0; i < config.warmupSize; i++) {
      trcf.process(data[i % data.length], i * 100);
    }

    const memBefore = this.getMemoryUsage();
    const latencies: number[] = [];

    // Benchmark
    const startTime = performance.now();
    for (let i = config.warmupSize; i < config.dataSize; i++) {
      const pointStart = performance.now();
      const result = trcf.process(data[i % data.length], i * 100);
      latencies.push(performance.now() - pointStart);
    }
    const endTime = performance.now();

    const memAfter = this.getMemoryUsage();
    const totalTime = (endTime - startTime) / 1000;
    const operations = config.dataSize - config.warmupSize;
    const percentiles = this.calculatePercentiles(latencies);

    return {
      operation: 'scoreAndUpdate',
      config,
      throughput: operations / totalTime,
      latencyP50: percentiles.p50,
      latencyP95: percentiles.p95,
      latencyP99: percentiles.p99,
      memoryUsed: memAfter - memBefore
    };
  }

  /**
   * Run comprehensive benchmark suite
   */
  static runBenchmarkSuite(): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];

    // Different configurations to test
    const configs: Partial<BenchmarkConfig>[] = [
      { dimensions: 4, numberOfTrees: 10 },   // Small
      { dimensions: 10, numberOfTrees: 20 },  // Medium
      { dimensions: 40, numberOfTrees: 30 },  // Large (default)
      { dimensions: 100, numberOfTrees: 50 }, // Extra large
    ];

    console.log('Starting TRCF Benchmark Suite...\n');

    for (const partialConfig of configs) {
      const config = { ...this.DEFAULT_CONFIG, ...partialConfig };
      console.log(`\nTesting config: ${config.dimensions}D, ${config.numberOfTrees} trees`);

      // Run each benchmark type
      const updateResult = this.benchmarkUpdateOnly(config);
      console.log(`  updateOnly: ${updateResult.throughput.toFixed(0)} ops/sec`);
      results.push(updateResult);

      const scoreResult = this.benchmarkScoreOnly(config);
      console.log(`  scoreOnly: ${scoreResult.throughput.toFixed(0)} ops/sec`);
      results.push(scoreResult);

      const scoreUpdateResult = this.benchmarkScoreAndUpdate(config);
      console.log(`  scoreAndUpdate: ${scoreUpdateResult.throughput.toFixed(0)} ops/sec`);
      results.push(scoreUpdateResult);
    }

    return results;
  }

  /**
   * Print detailed benchmark report
   */
  static printReport(results: BenchmarkResult[]): void {
    console.log('\n' + '='.repeat(80));
    console.log('TRCF TypeScript Performance Benchmark Report');
    console.log('='.repeat(80) + '\n');

    console.log('| Operation      | Dim | Trees | Throughput | P50 (ms) | P95 (ms) | P99 (ms) | Mem (MB) |');
    console.log('|----------------|-----|-------|------------|----------|----------|----------|----------|');

    for (const result of results) {
      console.log(
        `| ${result.operation.padEnd(14)} ` +
        `| ${String(result.config.dimensions).padEnd(3)} ` +
        `| ${String(result.config.numberOfTrees).padEnd(5)} ` +
        `| ${result.throughput.toFixed(0).padStart(10)} ` +
        `| ${result.latencyP50.toFixed(3).padStart(8)} ` +
        `| ${result.latencyP95.toFixed(3).padStart(8)} ` +
        `| ${result.latencyP99.toFixed(3).padStart(8)} ` +
        `| ${result.memoryUsed.toFixed(1).padStart(8)} |`
      );
    }

    console.log('\n' + '='.repeat(80));
  }
}

// Main execution
if (require.main === module) {
  console.log('TRCF TypeScript Performance Benchmarks');
  console.log('Based on Java RCF benchmark methodology\n');

  const results = TRCFBenchmark.runBenchmarkSuite();
  TRCFBenchmark.printReport(results);

  // Save results to JSON file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `benchmark-results-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${filename}`);
}