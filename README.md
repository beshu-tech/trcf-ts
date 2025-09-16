# TRCF TypeScript 🔍

**High-performance anomaly detection for streaming data** - A TypeScript implementation of AWS's Thresholded Random Cut Forest (TRCF) algorithm, optimized for real-time monitoring and alerting systems.

[![npm version](https://img.shields.io/npm/v/@beshu-tech/trcf-ts.svg)](https://www.npmjs.com/package/@beshu-tech/trcf-ts)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Performance](https://img.shields.io/badge/Performance-96K%20ops%2Fsec-green.svg)](PERFORMANCE.md)

## ⚡ Quick Start

### Installation

```bash
npm install @beshu-tech/trcf-ts
```

### Basic Usage - Time Series Monitoring

Perfect for monitoring single metrics like CPU usage, response times, or sensor readings:

```typescript
import { createTimeSeriesDetector } from '@beshu-tech/trcf-ts';

// Create a detector optimized for time series
const detector = createTimeSeriesDetector({
  anomalyRate: 0.01, // Expect 1% of points to be anomalous
  windowSize: 256    // Keep 256 points in memory
});

// Monitor your metric
const cpuUsages = [45, 52, 48, 51, 89, 47, 49]; // Spike at 89!

cpuUsages.forEach((cpu, i) => {
  const result = detector.detect([cpu]);

  if (result.isAnomaly) {
    console.log(`🚨 CPU spike detected at ${cpu}% (confidence: ${result.confidence.toFixed(2)})`);
  }

  console.log(`Point ${i}: ${cpu}% - Grade: ${result.grade.toFixed(3)} ${result.isAnomaly ? '⚠️' : '✅'}`);
});
```

### Multi-Metric Monitoring

Monitor multiple related metrics together for better anomaly detection:

```typescript
import { createMultiVariateDetector } from '@beshu-tech/trcf-ts';

const detector = createMultiVariateDetector({
  anomalyRate: 0.005,
  numberOfTrees: 30 // More trees for better multi-dimensional accuracy
});

// Monitor system health across multiple metrics
const systemMetrics = [
  [45, 60, 1500, 200], // [CPU%, Memory%, ResponseTime, ActiveUsers]
  [48, 62, 1450, 195],
  [52, 65, 1600, 210],
  [89, 95, 5000, 180], // System under stress!
  [47, 61, 1520, 205]
];

systemMetrics.forEach((metrics, i) => {
  const [cpu, memory, responseTime, users] = metrics;
  const result = detector.detect(metrics);

  if (result.isAnomaly) {
    console.log(`🔥 System anomaly detected:`, {
      cpu: `${cpu}%`,
      memory: `${memory}%`,
      responseTime: `${responseTime}ms`,
      users: users,
      confidence: result.confidence.toFixed(2)
    });
  }
});
```

### Real-time Stream Processing

```typescript
import { AnomalyDetector } from '@beshu-tech/trcf-ts';

const detector = new AnomalyDetector({
  windowSize: 512,
  anomalyRate: 0.02,
  normalize: true,
  timeAware: true // Better for irregular timestamps
});

// Simulate real-time data stream
const stream = setInterval(() => {
  const value = Math.random() * 100 + (Math.random() > 0.95 ? 200 : 0); // Occasional spikes
  const result = detector.detect([value], Date.now());

  if (result.isAnomaly) {
    console.log(`📈 Anomaly: ${value.toFixed(1)} (grade: ${result.grade.toFixed(3)})`);
  }
}, 1000);

// Stop after 30 seconds
setTimeout(() => clearInterval(stream), 30000);
```

## 🚀 Key Features

- **🏃‍♂️ High Performance**: 96,509 points/sec, 0.017ms P99 latency
- **🧠 Smart Detection**: Adaptive thresholding with minimal false positives
- **📊 Time Series Optimized**: Built-in support for seasonal patterns and trends
- **🔄 Streaming Ready**: Process data points in real-time with constant memory usage
- **📦 Simple API**: Easy-to-use interface with TypeScript support
- **🎛️ Configurable**: Fine-tune for your specific use case
- **💾 Stateful**: Save/restore detector state for distributed systems

## 📖 API Reference

### AnomalyDetector

The main class for anomaly detection:

```typescript
interface AnomalyDetectorConfig {
  windowSize?: number;      // Points to keep in memory (default: 256)
  anomalyRate?: number;     // Expected anomaly rate 0-1 (default: 0.01)
  numberOfTrees?: number;   // Forest size (default: 20)
  shingleSize?: number;     // Time pattern window (default: 4)
  normalize?: boolean;      // Auto-normalize data (default: true)
  timeAware?: boolean;      // Use timestamps (default: false)
}

interface AnomalyResult {
  score: number;           // Raw anomaly score
  grade: number;           // Normalized grade 0-1
  isAnomaly: boolean;      // Above threshold?
  confidence: number;      // Detection confidence 0-1
  threshold: number;       // Current threshold
  expectedValues?: number[]; // What was expected
}
```

### Convenience Functions

```typescript
// For single metrics (CPU, memory, response time, etc.)
createTimeSeriesDetector(config?: AnomalyDetectorConfig): AnomalyDetector

// For multiple related metrics
createMultiVariateDetector(config?: AnomalyDetectorConfig): AnomalyDetector
```

### Batch Processing

```typescript
// Process multiple points at once
const results = detector.detectBatch(
  [[1, 2], [3, 4], [100, 200]], // Data points
  [t1, t2, t3],                 // Optional timestamps
  true                          // Only return anomalies
);
```

## 🛠️ Common Use Cases

### Website Monitoring

```typescript
import { createTimeSeriesDetector } from '@beshu-tech/trcf-ts';

const responseTimeDetector = createTimeSeriesDetector({ anomalyRate: 0.005 });

// Monitor API response times
const responseTimes = [120, 134, 145, 139, 2400, 128, 142]; // Spike at 2400ms

responseTimes.forEach(time => {
  const result = responseTimeDetector.detect([time]);
  if (result.isAnomaly) {
    console.log(`🐌 Slow response detected: ${time}ms`);
    // Trigger alert, scale resources, etc.
  }
});
```

### IoT Sensor Monitoring

```typescript
import { createMultiVariateDetector } from '@beshu-tech/trcf-ts';

const sensorDetector = createMultiVariateDetector({
  windowSize: 128,
  timeAware: true // Handle irregular sensor readings
});

// Monitor temperature, humidity, pressure
const sensorData = [
  [22.5, 65, 1013.2], // Normal conditions
  [23.1, 67, 1012.8],
  [45.2, 45, 980.3],  // Anomalous reading - possible sensor malfunction
  [22.8, 66, 1013.0]
];

sensorData.forEach((reading, i) => {
  const result = sensorDetector.detect(reading, Date.now() + i * 5000);
  if (result.isAnomaly) {
    console.log(`⚠️ Sensor anomaly: ${reading} (confidence: ${result.confidence})`);
  }
});
```

### Financial Transaction Monitoring

```typescript
const transactionDetector = createMultiVariateDetector({
  anomalyRate: 0.001, // Very low false positive rate for financial data
  numberOfTrees: 50,  // Higher accuracy
  normalize: true
});

// Monitor [amount, frequency, merchant_risk_score, time_since_last]
const transactions = [
  [25.50, 1, 0.1, 3600],
  [34.20, 1, 0.2, 7200],
  [15000, 1, 0.9, 300], // Large amount + high risk + quick succession
  [28.75, 1, 0.1, 5400]
];

transactions.forEach(tx => {
  const result = transactionDetector.detect(tx);
  if (result.isAnomaly) {
    console.log(`🚨 Suspicious transaction: $${tx[0]} (grade: ${result.grade})`);
    // Flag for review, require additional authentication, etc.
  }
});
```

## ⚙️ Configuration Guide

### Performance Tuning

```typescript
// High-throughput, low-latency (like Kibana alerting)
const highPerformance = new AnomalyDetector({
  numberOfTrees: 20,    // Fewer trees = faster
  windowSize: 256,      // Smaller window = less memory
  shingleSize: 4,       // Good balance for time patterns
  normalize: true       // Essential for mixed data types
});

// High-accuracy, resource-intensive
const highAccuracy = new AnomalyDetector({
  numberOfTrees: 50,    // More trees = better accuracy
  windowSize: 1024,     // Larger window = better context
  anomalyRate: 0.005,   // Lower rate = stricter detection
  timeAware: true       // Use timing information
});
```

### Memory Management

```typescript
// Get detector statistics
const stats = detector.getStats();
console.log({
  totalUpdates: stats.totalUpdates,
  dimensions: stats.dimensions,
  isReady: stats.isReady,        // Ready after warmup
  lastThreshold: stats.lastThreshold
});

// For long-running processes, consider periodic state snapshots
if (stats.totalUpdates % 10000 === 0) {
  const state = detector.getState();
  // Save state to file/database for recovery
}
```

## 🔧 Advanced Usage

For fine-grained control, use the advanced API:

```typescript
import {
  ThresholdedRandomCutForest,
  OptimizedRCF,
  ForestMode,
  TransformMethod
} from '@beshu-tech/trcf-ts';

// Full control over the algorithm
const trcf = new ThresholdedRandomCutForest({
  dimensions: 4,
  forestMode: ForestMode.TIME_AUGMENTED,
  transformMethod: TransformMethod.NORMALIZE_DIFFERENCE,
  anomalyRate: 0.01,
  autoAdjust: true
});

// Use the high-performance RCF implementation
const rcf = new OptimizedRCF({
  dimensions: 4,
  numberOfTrees: 30,
  sampleSize: 512,
  timeDecay: 0.001
});

trcf.setForest(rcf);
```

## 📊 Performance

Optimized for production use with **96,509 points/sec** throughput:

| Metric | Value | Status |
|--------|-------|---------|
| **Throughput** | 96,509 points/sec | ✅ Production ready |
| **Latency P99** | 0.017 ms | ✅ Sub-millisecond |
| **Memory (1M points)** | 1.17 GB | ✅ Efficient |
| **State size** | 0.18 KB compressed | ✅ Minimal overhead |

Achieves **187x-750x performance improvement** over naive implementations through:
- Float32Arrays for optimal memory usage
- Pre-allocated buffers to eliminate garbage collection
- Optimized distance calculations
- Efficient state serialization

See [PERFORMANCE.md](PERFORMANCE.md) for detailed benchmarks.

## 🧪 Testing & Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run benchmarks
npm run build
npx ts-node benchmarks/mono-variable-benchmark.ts

# Build for production
npm run build
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

This implementation is based on the AWS Random Cut Forest library, which is also licensed under the Apache License 2.0. See the [NOTICE](NOTICE) file for attribution and third-party licenses.

### Copyright Notice

```
Copyright 2024 Beshu Limited and Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## References

- [AWS Random Cut Forest](https://github.com/aws/random-cut-forest-by-aws)
- [Random Cut Forest Paper](https://proceedings.mlr.press/v48/guha16.html)
- [TRCF in OpenSearch](https://opensearch.org/docs/latest/observing-your-data/ad/index/)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- How to submit issues and pull requests
- Development setup and coding standards
- Performance considerations for this high-performance library
- Contribution License Agreement

Before contributing, please review the [Contribution License Agreement](CONTRIBUTING.md#contribution-license-agreement) which ensures that contributions can be safely incorporated into the project.

## Production Deployment

### For Kibana Alerting

Use the optimized configuration:
```typescript
const trcf = new ThresholdedRandomCutForest({
  dimensions: 4,
  shingleSize: 4,        // Captures short-term patterns
  numberOfTrees: 20,     // Balance accuracy/speed
  sampleSize: 256,       // ~4 min at 1pt/sec
  anomalyRate: 0.01,     // 1% expected anomalies
  timeDecay: 0.001       // Adapt slowly
});

// Use OptimizedRCF for production
const rcf = new OptimizedRCF(config);
trcf.setForest(rcf);
```

### State Management

For distributed systems, use the StateSerializer:
```typescript
import { StateSerializer } from '@beshu-tech/trcf-ts';

// Save state for checkpointing
const state = trcf.getState();
const serialized = StateSerializer.serialize(state, true); // with compression

// Restore after failure
const restored = StateSerializer.deserialize(serialized);
const trcf = ThresholdedRandomCutForest.fromState(restored);
```

## Next Steps

For extending this implementation:

1. **Full RCF Algorithm**: Implement complete random cut trees for higher accuracy
2. **WebAssembly**: Compile performance-critical sections for additional speed
3. **Streaming Interface**: Add Kafka/Kinesis connectors for real-time data
4. **Visualization**: Build dashboards for anomaly analysis
5. **AutoML**: Implement automatic parameter tuning based on data characteristics