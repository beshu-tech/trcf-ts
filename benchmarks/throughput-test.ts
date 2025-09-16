/**
 * Simple throughput test - similar to Java's DynamicThroughput example
 */

import { performance } from 'perf_hooks';
import * as os from 'os';
import { ThresholdedRandomCutForest, SimplifiedRCF, ForestMode, TransformMethod } from '../src';

function generateData(size: number, dimensions: number): number[][] {
  const data: number[][] = [];
  for (let i = 0; i < size; i++) {
    const point: number[] = [];
    for (let d = 0; d < dimensions; d++) {
      point.push(Math.sin(i * 0.1 + d) + (Math.random() - 0.5) * 0.1);
    }
    data.push(point);
  }
  return data;
}

function runThroughputTest() {
  console.log('TRCF TypeScript Throughput Test');
  console.log('================================\n');

  const dimensions = 4;
  const numberOfTrees = 50;
  const sampleSize = 256;
  const dataSize = 10 * sampleSize;
  const testSize = sampleSize;

  // Generate test data
  const warmupData = generateData(dataSize, dimensions);
  const testData = generateData(testSize, dimensions);

  console.log(`Configuration:`);
  console.log(`  Dimensions: ${dimensions}`);
  console.log(`  Trees: ${numberOfTrees}`);
  console.log(`  Sample size: ${sampleSize}`);
  console.log(`  Warmup points: ${dataSize}`);
  console.log(`  Test points: ${testSize}\n`);

  // Test with different configurations
  const configs = [
    { name: 'Basic TRCF', forestMode: ForestMode.STANDARD },
    { name: 'Time Augmented', forestMode: ForestMode.TIME_AUGMENTED },
    { name: 'With Normalization', forestMode: ForestMode.STANDARD, normalize: true }
  ];

  for (const config of configs) {
    // Setup forest
    const rcf = new SimplifiedRCF({
      dimensions: config.forestMode === ForestMode.TIME_AUGMENTED ? dimensions + 1 : dimensions,
      shingleSize: 1,
      numberOfTrees,
      sampleSize,
      timeDecay: 0
    });

    const trcf = new ThresholdedRandomCutForest({
      dimensions,
      shingleSize: 1,
      forestMode: config.forestMode,
      transformMethod: config.normalize ? TransformMethod.NORMALIZE : TransformMethod.NONE,
      anomalyRate: 0.01
    });
    trcf.setForest(rcf);

    // Warmup phase
    for (let i = 0; i < warmupData.length; i++) {
      trcf.process(warmupData[i], i * 100);
    }

    // Measure test phase
    const start = performance.now();
    let totalScore = 0;

    for (let i = 0; i < testData.length; i++) {
      const result = trcf.process(testData[i], (dataSize + i) * 100);
      totalScore += result.anomalyScore;
    }

    const elapsed = performance.now() - start;
    const throughput = (testSize / elapsed) * 1000; // ops/sec

    console.log(`${config.name}:`);
    console.log(`  Time: ${elapsed.toFixed(2)} ms`);
    console.log(`  Throughput: ${throughput.toFixed(0)} ops/sec`);
    console.log(`  Avg latency: ${(elapsed / testSize).toFixed(3)} ms/op\n`);
  }
}

// Test memory usage
function testMemoryUsage() {
  console.log('\nMemory Usage Test');
  console.log('=================\n');

  const dimensions = 10;
  const trees = 30;
  const sampleSize = 256;

  if (global.gc) {
    global.gc();
  }
  const memStart = process.memoryUsage().heapUsed / 1024 / 1024;

  const rcf = new SimplifiedRCF({
    dimensions,
    shingleSize: 1,
    numberOfTrees: trees,
    sampleSize,
    timeDecay: 0
  });

  const trcf = new ThresholdedRandomCutForest({
    dimensions,
    shingleSize: 1
  });
  trcf.setForest(rcf);

  // Process some data
  const data = generateData(1000, dimensions);
  for (let i = 0; i < data.length; i++) {
    trcf.process(data[i], i * 100);
  }

  if (global.gc) {
    global.gc();
  }
  const memEnd = process.memoryUsage().heapUsed / 1024 / 1024;

  console.log(`Initial memory: ${memStart.toFixed(2)} MB`);
  console.log(`Final memory: ${memEnd.toFixed(2)} MB`);
  console.log(`Memory used: ${(memEnd - memStart).toFixed(2)} MB`);
  console.log(`Per-tree memory: ${((memEnd - memStart) / trees).toFixed(2)} MB`);
}

// Run tests
if (require.main === module) {
  console.log('Running with Node.js version:', process.version);
  console.log('Platform:', process.platform, process.arch);
  console.log('CPUs:', os.cpus().length, 'x', os.cpus()[0].model);
  console.log('Total memory:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB\n');

  runThroughputTest();
  testMemoryUsage();
}