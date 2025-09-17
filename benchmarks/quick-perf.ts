/**
 * Quick performance baseline test
 */

import { performance } from 'perf_hooks';
import * as os from 'os';
import { ThresholdedRandomCutForest, OptimizedRCF } from '../src';

function quickBenchmark() {
  console.log('Quick Performance Baseline');
  console.log('==========================\n');

  // Small configuration for quick testing
  const configs = [
    { dims: 2, trees: 5, samples: 100, desc: 'Tiny (2D, 5 trees)' },
    { dims: 4, trees: 10, samples: 256, desc: 'Small (4D, 10 trees)' },
    { dims: 10, trees: 20, samples: 256, desc: 'Medium (10D, 20 trees)' },
  ];

  for (const config of configs) {
    const rcf = new OptimizedRCF({
      dimensions: config.dims,
      shingleSize: 1,
      numberOfTrees: config.trees,
      sampleSize: config.samples,
      timeDecay: 0
    });

    const trcf = new ThresholdedRandomCutForest({
      dimensions: config.dims,
      shingleSize: 1
    });
    trcf.setForest(rcf);

    // Generate test data
    const testSize = 1000;
    const data: number[][] = [];
    for (let i = 0; i < testSize; i++) {
      const point = Array(config.dims).fill(0).map(() => Math.random());
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
    const latency = elapsed / ops;

    console.log(`${config.desc}:`);
    console.log(`  Throughput: ${throughput.toFixed(0)} ops/sec`);
    console.log(`  Latency: ${latency.toFixed(2)} ms/op`);
    console.log(`  Total time: ${elapsed.toFixed(0)} ms for ${ops} ops\n`);
  }
}

// Profile specific operations
function profileOperations() {
  console.log('\nOperation Profiling');
  console.log('===================\n');

  const dims = 4;
  const rcf = new SimplifiedRCF({
    dimensions: dims,
    shingleSize: 1,
    numberOfTrees: 10,
    sampleSize: 256,
    timeDecay: 0
  });

  // Warmup RCF
  for (let i = 0; i < 300; i++) {
    const point = new Float32Array(dims).map(() => Math.random());
    rcf.process(point);
  }

  const operations = [
    {
      name: 'RCF process only',
      fn: () => {
        const point = new Float32Array(dims).map(() => Math.random());
        rcf.process(point);
      }
    },
    {
      name: 'RCF getAnomalyScore',
      fn: () => {
        const point = new Float32Array(dims).map(() => Math.random());
        rcf.getAnomalyScore(point);
      }
    },
    {
      name: 'RCF process (score + update)',
      fn: () => {
        const point = new Float32Array(dims).map(() => Math.random());
        const result = rcf.process(point);
      }
    }
  ];

  const iterations = 10000;

  for (const op of operations) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      op.fn();
    }
    const elapsed = performance.now() - start;
    const opsPerSec = (iterations / elapsed) * 1000;

    console.log(`${op.name}:`);
    console.log(`  ${opsPerSec.toFixed(0)} ops/sec`);
    console.log(`  ${(elapsed / iterations).toFixed(3)} ms/op\n`);
  }
}

// Memory profiling
function profileMemory() {
  console.log('Memory Profiling');
  console.log('================\n');

  if (global.gc) {
    global.gc();
  }

  const getMemMB = () => process.memoryUsage().heapUsed / 1024 / 1024;

  const measurements: { [key: string]: number } = {};

  // Baseline
  measurements.baseline = getMemMB();

  // Create RCF
  const rcf = new SimplifiedRCF({
    dimensions: 10,
    shingleSize: 1,
    numberOfTrees: 30,
    sampleSize: 256,
    timeDecay: 0
  });

  if (global.gc) global.gc();
  measurements.afterRCF = getMemMB();

  // Create TRCF
  const trcf = new ThresholdedRandomCutForest({
    dimensions: 10,
    shingleSize: 1
  });
  trcf.setForest(rcf);

  if (global.gc) global.gc();
  measurements.afterTRCF = getMemMB();

  // Process data
  for (let i = 0; i < 1000; i++) {
    const point = Array(10).fill(0).map(() => Math.random());
    trcf.process(point, i * 100);
  }

  if (global.gc) global.gc();
  measurements.after1000 = getMemMB();

  console.log(`Baseline: ${measurements.baseline.toFixed(2)} MB`);
  console.log(`After RCF creation: ${measurements.afterRCF.toFixed(2)} MB (∆${(measurements.afterRCF - measurements.baseline).toFixed(2)} MB)`);
  console.log(`After TRCF setup: ${measurements.afterTRCF.toFixed(2)} MB (∆${(measurements.afterTRCF - measurements.afterRCF).toFixed(2)} MB)`);
  console.log(`After 1000 points: ${measurements.after1000.toFixed(2)} MB (∆${(measurements.after1000 - measurements.afterTRCF).toFixed(2)} MB)`);
}

if (require.main === module) {
  console.log('Node.js:', process.version);
  console.log('Platform:', process.platform, process.arch);
  console.log('CPU:', os.cpus()[0].model);
  console.log('Memory:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(1), 'GB\n');

  quickBenchmark();
  profileOperations();
  profileMemory();
}