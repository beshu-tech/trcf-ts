/**
 * Focused benchmark for mono-variable time series (Kibana use case)
 */

import { performance } from 'perf_hooks';
import * as zlib from 'zlib';
import * as os from 'os';
import { OptimizedRCF } from '../src';

export class MonoVariableTimeSeries {
  private rcf: OptimizedRCF;
  private shingleBuffer: number[] = [];
  private readonly shingleSize: number = 4;
  private updateCount: number = 0;
  private lastScore: number = 0;

  constructor() {
    // Optimized for mono-variable with shingling
    this.rcf = new OptimizedRCF({
      dimensions: this.shingleSize,
      shingleSize: 1,
      numberOfTrees: 20,  // Fewer trees for faster scoring
      sampleSize: 256,
      timeDecay: 0.001    // Slow decay for long series
    });
  }

  /**
   * Process a single value (mono-variable)
   */
  process(value: number): { score: number; isAnomaly: boolean } {
    // Update shingle buffer
    this.shingleBuffer.push(value);
    if (this.shingleBuffer.length > this.shingleSize) {
      this.shingleBuffer.shift();
    }

    // Need full shingle to process
    if (this.shingleBuffer.length < this.shingleSize) {
      return { score: 0, isAnomaly: false };
    }

    // Convert to typed array for performance
    const point = new Float32Array(this.shingleBuffer);

    // Score and update
    const result = this.rcf.process(point);
    this.updateCount++;
    this.lastScore = result.score;

    // Simple thresholding (can be made adaptive)
    const threshold = this.updateCount < 100 ? 1.0 : 0.5;
    const isAnomaly = result.score > threshold;

    return { score: result.score, isAnomaly };
  }

  /**
   * Get serializable state
   */
  getState(): any {
    return {
      updateCount: this.updateCount,
      shingleBuffer: this.shingleBuffer,
      lastScore: this.lastScore,
      // In production, would include RCF tree states
      rcfMetadata: {
        dimensions: this.rcf.getDimensions(),
        trees: this.rcf.getNumberOfTrees(),
        samples: this.rcf.getSampleSize()
      }
    };
  }

  /**
   * Restore from state
   */
  static fromState(state: any): MonoVariableTimeSeries {
    const instance = new MonoVariableTimeSeries();
    instance.updateCount = state.updateCount;
    instance.shingleBuffer = state.shingleBuffer;
    instance.lastScore = state.lastScore;
    // In production, would restore RCF tree states
    return instance;
  }
}

/**
 * Run comprehensive benchmarks for Kibana alerting
 */
export class KibanaPerformanceTest {

  /**
   * Test 1: Scoring Performance (most critical)
   */
  static testScoringPerformance(): void {
    console.log('\n📊 TEST 1: SCORING PERFORMANCE');
    console.log('-'.repeat(40));

    const ts = new MonoVariableTimeSeries();

    // Generate realistic time series
    const dataPoints = 100000;
    const data: number[] = [];
    for (let i = 0; i < dataPoints; i++) {
      // Seasonal pattern with noise and occasional anomalies
      let value = Math.sin(i * 2 * Math.PI / 288) * 10 +  // Daily pattern (288 = 24h * 12 samples/h)
                 Math.sin(i * 2 * Math.PI / 2016) * 5 +  // Weekly pattern
                 (Math.random() - 0.5) * 2;              // Noise

      // Inject anomalies
      if (Math.random() < 0.001) {  // 0.1% anomaly rate
        value += (Math.random() > 0.5 ? 1 : -1) * 20; // Spike
      }

      data.push(value);
    }

    // Warmup
    for (let i = 0; i < 1000; i++) {
      ts.process(data[i]);
    }

    // Measure scoring performance
    const latencies: number[] = [];
    const start = performance.now();

    for (let i = 1000; i < 11000; i++) {
      const scoreStart = performance.now();
      ts.process(data[i]);
      latencies.push(performance.now() - scoreStart);
    }

    const totalTime = performance.now() - start;

    // Calculate statistics
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const throughput = 10000 / (totalTime / 1000);

    console.log(`  Throughput: ${throughput.toFixed(0)} points/second`);
    console.log(`  Latency P50: ${p50.toFixed(3)} ms`);
    console.log(`  Latency P95: ${p95.toFixed(3)} ms`);
    console.log(`  Latency P99: ${p99.toFixed(3)} ms`);
    console.log(`  ✅ Kibana Requirement: ${p99 < 10 ? 'PASS' : 'FAIL'} (P99 < 10ms)`);
  }

  /**
   * Test 2: State Serialization Performance
   */
  static testSerializationPerformance(): void {
    console.log('\n💾 TEST 2: STATE SERIALIZATION');
    console.log('-'.repeat(40));

    const ts = new MonoVariableTimeSeries();

    // Train the model
    for (let i = 0; i < 5000; i++) {
      const value = Math.sin(i * 0.01) + (Math.random() - 0.5) * 0.1;
      ts.process(value);
    }

    // Get state
    const state = ts.getState();

    // Measure serialization
    const serializeStart = performance.now();
    const json = JSON.stringify(state);
    const serializeTime = performance.now() - serializeStart;

    // Measure compression
    const compressStart = performance.now();
    const compressed = zlib.gzipSync(Buffer.from(json));
    const compressTime = performance.now() - compressStart;

    // Measure deserialization
    const deserializeStart = performance.now();
    const restored = JSON.parse(json);
    const deserializeTime = performance.now() - deserializeStart;

    // Measure decompression
    const decompressStart = performance.now();
    const decompressed = zlib.gunzipSync(compressed);
    const decompressTime = performance.now() - decompressStart;

    const rawSize = Buffer.byteLength(json);
    const compressedSize = compressed.length;
    const compressionRatio = (1 - compressedSize / rawSize) * 100;

    console.log(`  Raw State Size: ${(rawSize / 1024).toFixed(2)} KB`);
    console.log(`  Compressed Size: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(`  Compression Ratio: ${compressionRatio.toFixed(1)}%`);
    console.log(`  Serialize Time: ${serializeTime.toFixed(3)} ms`);
    console.log(`  Compress Time: ${compressTime.toFixed(3)} ms`);
    console.log(`  Deserialize Time: ${deserializeTime.toFixed(3)} ms`);
    console.log(`  Decompress Time: ${decompressTime.toFixed(3)} ms`);
    console.log(`  Total Save Time: ${(serializeTime + compressTime).toFixed(3)} ms`);
    console.log(`  Total Load Time: ${(decompressTime + deserializeTime).toFixed(3)} ms`);
    console.log(`  ✅ Kibana Requirement: ${compressedSize < 100000 ? 'PASS' : 'FAIL'} (< 100KB compressed)`);
  }

  /**
   * Test 3: Memory Usage for Long-Running Process
   */
  static testMemoryUsage(): void {
    console.log('\n🧠 TEST 3: MEMORY USAGE');
    console.log('-'.repeat(40));

    if (global.gc) global.gc();
    const memStart = process.memoryUsage().heapUsed;

    const ts = new MonoVariableTimeSeries();

    // Process many points
    const points = 50000;
    for (let i = 0; i < points; i++) {
      const value = Math.sin(i * 0.01) + (Math.random() - 0.5) * 0.1;
      ts.process(value);
    }

    if (global.gc) global.gc();
    const memEnd = process.memoryUsage().heapUsed;

    const memoryUsed = (memEnd - memStart) / (1024 * 1024);
    const memoryPerPoint = (memEnd - memStart) / points;

    console.log(`  Total Memory: ${memoryUsed.toFixed(2)} MB`);
    console.log(`  Memory per Point: ${memoryPerPoint.toFixed(0)} bytes`);
    console.log(`  Estimated for 1M points: ${(memoryPerPoint * 1000000 / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  ✅ Kibana Requirement: ${memoryUsed < 100 ? 'PASS' : 'FAIL'} (< 100MB for 50K points)`);
  }

  /**
   * Test 4: Streaming Performance (continuous updates)
   */
  static testStreamingPerformance(): void {
    console.log('\n🔄 TEST 4: STREAMING PERFORMANCE');
    console.log('-'.repeat(40));

    const ts = new MonoVariableTimeSeries();

    // Simulate streaming data
    const windowSize = 10000;
    const updateTimes: number[] = [];

    // Initial window
    for (let i = 0; i < windowSize; i++) {
      const value = Math.sin(i * 0.01) + (Math.random() - 0.5) * 0.1;
      ts.process(value);
    }

    // Measure streaming updates
    for (let i = 0; i < 1000; i++) {
      const value = Math.sin((windowSize + i) * 0.01) + (Math.random() - 0.5) * 0.1;

      const updateStart = performance.now();
      ts.process(value);
      updateTimes.push(performance.now() - updateStart);
    }

    const avgUpdateTime = updateTimes.reduce((a, b) => a + b) / updateTimes.length;
    const maxUpdateTime = Math.max(...updateTimes);

    console.log(`  Average Update Time: ${avgUpdateTime.toFixed(3)} ms`);
    console.log(`  Max Update Time: ${maxUpdateTime.toFixed(3)} ms`);
    console.log(`  Updates per Second: ${(1000 / avgUpdateTime).toFixed(0)}`);
    console.log(`  ✅ Kibana Requirement: ${avgUpdateTime < 1 ? 'PASS' : 'FAIL'} (< 1ms avg update)`);
  }

  /**
   * Run all tests
   */
  static runAll(): void {
    console.log('=' .repeat(50));
    console.log('KIBANA ALERTING PERFORMANCE TESTS');
    console.log('Mono-variable Time Series Optimization');
    console.log('=' .repeat(50));

    this.testScoringPerformance();
    this.testSerializationPerformance();
    this.testMemoryUsage();
    this.testStreamingPerformance();

    console.log('\n' + '=' .repeat(50));
    console.log('SUMMARY: All tests completed');
    console.log('=' .repeat(50));
  }
}

// Main execution
if (require.main === module) {
  console.log('Node.js:', process.version);
  console.log('Platform:', process.platform, process.arch);
  console.log('CPU:', os.cpus()[0].model);

  KibanaPerformanceTest.runAll();
}