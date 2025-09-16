/**
 * Compare performance between original and optimized implementations
 */

import { performance } from 'perf_hooks';
import * as os from 'os';
import { SimplifiedRCF } from '../src/rcf/SimplifiedRCF';
import { OptimizedRCF } from '../src/rcf/OptimizedRCF';
import { ThresholdedRandomCutForest } from '../src';

interface BenchmarkResult {
  implementation: string;
  config: string;
  throughput: number;
  latency: number;
  memoryMB: number;
}

function benchmark(
  name: string,
  rcf: any,
  dimensions: number,
  iterations: number
): BenchmarkResult {
  const data: Float32Array[] = [];
  for (let i = 0; i < iterations; i++) {
    const point = new Float32Array(dimensions);
    for (let j = 0; j < dimensions; j++) {
      point[j] = Math.random();
    }
    data.push(point);
  }

  // Warmup
  for (let i = 0; i < Math.min(100, iterations); i++) {
    rcf.process(data[i]);
  }

  // Measure
  const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    rcf.process(data[i]);
  }

  const elapsed = performance.now() - start;
  const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;

  return {
    implementation: name,
    config: `${dimensions}D`,
    throughput: (iterations / elapsed) * 1000,
    latency: elapsed / iterations,
    memoryMB: memAfter - memBefore
  };
}

function compareImplementations() {
  console.log('Performance Comparison: Original vs Optimized RCF');
  console.log('=' .repeat(60) + '\n');

  const configs = [
    { dims: 2, trees: 5, samples: 100, iterations: 1000 },
    { dims: 4, trees: 10, samples: 256, iterations: 500 },
    { dims: 10, trees: 20, samples: 256, iterations: 200 }
  ];

  const results: BenchmarkResult[] = [];

  for (const config of configs) {
    console.log(`Testing ${config.dims}D, ${config.trees} trees, ${config.iterations} iterations...`);

    // Original implementation
    const original = new SimplifiedRCF({
      dimensions: config.dims,
      shingleSize: 1,
      numberOfTrees: config.trees,
      sampleSize: config.samples,
      timeDecay: 0
    });

    const originalResult = benchmark(
      'Original',
      original,
      config.dims,
      config.iterations
    );
    results.push(originalResult);

    // Optimized implementation
    const optimized = new OptimizedRCF({
      dimensions: config.dims,
      shingleSize: 1,
      numberOfTrees: config.trees,
      sampleSize: config.samples,
      timeDecay: 0
    });

    const optimizedResult = benchmark(
      'Optimized',
      optimized,
      config.dims,
      config.iterations
    );
    results.push(optimizedResult);

    // Calculate improvement
    const improvement = (optimizedResult.throughput / originalResult.throughput - 1) * 100;
    console.log(`  Improvement: ${improvement.toFixed(1)}%\n`);
  }

  // Print summary table
  console.log('\nSummary Results:');
  console.log('=' .repeat(60));
  console.log('| Implementation | Config | Throughput | Latency  | Memory |');
  console.log('|----------------|--------|------------|----------|--------|');

  for (const result of results) {
    console.log(
      `| ${result.implementation.padEnd(14)} ` +
      `| ${result.config.padEnd(6)} ` +
      `| ${result.throughput.toFixed(0).padStart(10)} ` +
      `| ${result.latency.toFixed(3).padStart(8)} ` +
      `| ${result.memoryMB.toFixed(1).padStart(6)} |`
    );
  }
}

// Test TRCF with optimized RCF
function testTRCFWithOptimized() {
  console.log('\n\nTRCF Performance with Optimized RCF:');
  console.log('=' .repeat(60) + '\n');

  const dimensions = 4;
  const trees = 10;
  const samples = 256;

  // Create TRCF with optimized RCF
  const optimizedRCF = new OptimizedRCF({
    dimensions,
    shingleSize: 1,
    numberOfTrees: trees,
    sampleSize: samples,
    timeDecay: 0
  });

  const trcf = new ThresholdedRandomCutForest({
    dimensions,
    shingleSize: 1
  });
  trcf.setForest(optimizedRCF);

  // Generate test data
  const testSize = 1000;
  const data: number[][] = [];
  for (let i = 0; i < testSize; i++) {
    const point = Array(dimensions).fill(0).map(() => Math.random());
    data.push(point);
  }

  // Warmup
  for (let i = 0; i < 100; i++) {
    trcf.process(data[i], i * 100);
  }

  // Measure
  const start = performance.now();
  for (let i = 100; i < testSize; i++) {
    trcf.process(data[i], i * 100);
  }
  const elapsed = performance.now() - start;

  const ops = testSize - 100;
  const throughput = (ops / elapsed) * 1000;

  console.log(`Configuration: ${dimensions}D, ${trees} trees`);
  console.log(`Throughput: ${throughput.toFixed(0)} ops/sec`);
  console.log(`Latency: ${(elapsed / ops).toFixed(3)} ms/op`);
  console.log(`Total time: ${elapsed.toFixed(0)} ms for ${ops} operations`);
}

if (require.main === module) {
  console.log('Node.js:', process.version);
  console.log('Platform:', process.platform, process.arch);
  console.log('CPU:', os.cpus()[0].model);
  console.log('Memory:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(1), 'GB\n');

  compareImplementations();
  testTRCFWithOptimized();
}