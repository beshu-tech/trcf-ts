# TRCF TypeScript - Real-time Anomaly Detection 🚨

**Catch anomalies in your data streams before they become incidents.** Production-ready TypeScript implementation of AWS's Thresholded Random Cut Forest algorithm with up to **100K+ ops/sec** throughput and **25-58x faster** than Java.

[![npm version](https://img.shields.io/npm/v/@beshu-tech/trcf-ts.svg)](https://www.npmjs.com/package/@beshu-tech/trcf-ts)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-green.svg)](.github/workflows/ci.yml)
[![Performance](https://img.shields.io/badge/Throughput-100K%2B%20ops%2Fsec-orange.svg)](#performance)

## Why TRCF?

✅ **Real-time Detection** - Process streaming data with 0.017ms latency
✅ **Self-Learning** - Adapts to your data patterns automatically
✅ **Production Ready** - Battle-tested algorithm from AWS
✅ **Zero Config** - Works out of the box with sensible defaults
✅ **TypeScript Native** - Full type safety and IntelliSense support

## Java Comparison 🔥

| Aspect | Implementation | Status |
|--------|---------------|--------|
| Precision | Float64Array | ✅ Exact |
| Random | Java LCG | ✅ Exact |
| Defaults | All aligned | ✅ Exact |
| Score Accuracy | - | 91-96% match |
| Performance | - | 25-58x faster |

## Installation

```bash
npm install @beshu-tech/trcf-ts
```

## Quick Start - 30 Seconds to First Anomaly

```typescript
import { createTimeSeriesDetector } from '@beshu-tech/trcf-ts';

// Create detector
const detector = createTimeSeriesDetector();

// Feed your data
const metrics = [50, 52, 48, 51, 200, 49, 52]; // Anomaly at 200!

metrics.forEach(value => {
  const result = detector.detect([value]);

  if (result.isAnomaly) {
    console.log(`🚨 Anomaly detected: ${value}`);
    // Send alert, trigger automation, etc.
  }
});
```

That's it! The detector automatically learns what's normal and flags anomalies.

## Real-World Use Cases

### 🖥️ Server Monitoring
```typescript
const detector = createTimeSeriesDetector({
  anomalyRate: 0.01  // Expect 1% anomalies
});

// Monitor CPU usage
setInterval(async () => {
  const cpu = await getCpuUsage();
  const result = detector.detect([cpu]);

  if (result.isAnomaly && result.confidence > 0.8) {
    await scaleUpServers();
    await notifyOpsTeam(`CPU spike: ${cpu}%`);
  }
}, 1000);
```

### 💳 Fraud Detection
```typescript
const detector = createMultiVariateDetector({
  anomalyRate: 0.001,  // Very low false positives
  numberOfTrees: 50    // Higher accuracy
});

function checkTransaction(amount, frequency, riskScore, timeSinceLast) {
  const result = detector.detect([amount, frequency, riskScore, timeSinceLast]);

  if (result.isAnomaly) {
    return {
      action: 'REVIEW',
      confidence: result.confidence,
      reason: `Anomaly score: ${result.grade.toFixed(3)}`
    };
  }
  return { action: 'APPROVE' };
}
```

### 🌡️ IoT Sensor Monitoring
```typescript
const detector = createMultiVariateDetector({
  timeAware: true  // Handle irregular readings
});

function processSensorData(temperature, humidity, pressure, timestamp) {
  const result = detector.detect(
    [temperature, humidity, pressure],
    timestamp
  );

  if (result.isAnomaly) {
    // Sensor malfunction or environmental anomaly
    logIncident({
      severity: result.confidence > 0.9 ? 'HIGH' : 'MEDIUM',
      readings: { temperature, humidity, pressure },
      anomalyGrade: result.grade
    });
  }
}
```

## API Overview

### Simple API
```typescript
// Single metric monitoring
const detector = createTimeSeriesDetector(config?);

// Multi-metric monitoring
const detector = createMultiVariateDetector(config?);

// Detect anomaly
const result = detector.detect(values, timestamp?);

// result = {
//   isAnomaly: boolean,      // Is this anomalous?
//   confidence: number,      // How confident? (0-1)
//   grade: number,          // Anomaly severity (0-1)
//   score: number,          // Raw anomaly score
//   threshold: number       // Current threshold
// }
```

### Configuration Options
```typescript
{
  windowSize?: number,      // Memory size (default: 256)
  anomalyRate?: number,     // Expected anomaly % (default: 0.005)
  numberOfTrees?: number,   // Accuracy vs speed (default: 30)
  normalize?: boolean,      // Auto-normalize (default: true)
  timeAware?: boolean      // Use timestamps (default: false)
}
```

## Performance

**Blazing fast with minimal resource usage:**

| Metric | Value | Comparison |
|--------|-------|------------|
| **Throughput** | 30-100K+ ops/sec* | 25-58x faster than Java |
| **Latency P99** | <10 ms | Sub-millisecond |
| **Accuracy** | 91-96% | Matches Java implementation |
| **Memory** | ~1GB for 1M points | Efficient |
| **Package Size** | <100 KB | Lightweight |

*Throughput varies by configuration: 30K ops/sec (default: 30 trees, 256 samples), 100K+ ops/sec (optimized: 3-5 trees, 32-64 samples)

## Getting Started

### Step 1: Choose Your Detector Type

```typescript
// For single metrics (CPU, memory, temperature, etc.)
import { createTimeSeriesDetector } from '@beshu-tech/trcf-ts';

// For multiple related metrics
import { createMultiVariateDetector } from '@beshu-tech/trcf-ts';

// For advanced control
import { ThresholdedRandomCutForest } from '@beshu-tech/trcf-ts';
```

### Step 2: Configure for Your Use Case

```typescript
// High accuracy (more trees, stricter threshold)
const accurate = createTimeSeriesDetector({
  numberOfTrees: 50,
  anomalyRate: 0.001
});

// High performance (fewer trees, smaller window)
const fast = createTimeSeriesDetector({
  numberOfTrees: 20,
  windowSize: 128
});

// Irregular data (timestamps matter)
const irregular = createTimeSeriesDetector({
  timeAware: true
});
```

### Step 3: Process Your Data

```typescript
// Single point
const result = detector.detect([value]);

// With timestamp
const result = detector.detect([value], Date.now());

// Batch processing
const results = detector.detectBatch(values, timestamps);
```

### Step 4: Handle Anomalies

```typescript
if (result.isAnomaly && result.confidence > 0.7) {
  // High confidence anomaly
  await sendAlert(result);
} else if (result.grade > 0.5) {
  // Moderate anomaly
  await logWarning(result);
}
```

## Advanced Features

<details>
<summary><b>State Persistence</b> - Save and restore detector state</summary>

```typescript
// Save state
const state = detector.getState();
await saveToDatabase(state);

// Restore state
const savedState = await loadFromDatabase();
const detector = AnomalyDetector.fromState(savedState);
```
</details>

<details>
<summary><b>Custom Forest Implementation</b> - Bring your own RCF</summary>

```typescript
import { ThresholdedRandomCutForest, OptimizedRCF } from '@beshu-tech/trcf-ts';

const rcf = new OptimizedRCF({
  dimensions: 4,
  numberOfTrees: 30,
  sampleSize: 256
});

const trcf = new ThresholdedRandomCutForest({
  dimensions: 4,
  anomalyRate: 0.01
});

trcf.setForest(rcf);
```
</details>

<details>
<summary><b>Fine-Tuned Configuration</b> - Full control</summary>

```typescript
const detector = new ThresholdedRandomCutForest({
  // Forest settings
  dimensions: 4,
  numberOfTrees: 30,
  sampleSize: 256,
  timeDecay: 0.001,

  // Preprocessing
  forestMode: ForestMode.TIME_AUGMENTED,
  transformMethod: TransformMethod.NORMALIZE,
  imputationMethod: ImputationMethod.PREVIOUS,

  // Thresholding
  anomalyRate: 0.01,
  zFactor: 2.5,
  autoAdjust: true
});
```
</details>

## Examples

Full working examples in the [`examples/`](examples/) directory:
- [`simple-usage.ts`](examples/simple-usage.ts) - Basic anomaly detection
- [`complete-example.ts`](examples/complete-example.ts) - Advanced features

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Apache 2.0 - See [LICENSE](LICENSE) for details.

Based on [AWS Random Cut Forest](https://github.com/aws/random-cut-forest-by-aws).

---

## Technical Details

<details>
<summary><b>Architecture Overview</b></summary>

### Data Flow Pipeline
```
Input → Preprocessor → RCF Forest → PredictorCorrector → Thresholder → Result
         ↓               ↓            ↓                    ↓
      Shingling    Anomaly Score  Correction      Grade/Threshold
      Normalize    Attribution     Time Decay     Auto-adjust
```

### Key Components
- **ThresholdedRandomCutForest**: Main orchestrator
- **OptimizedRCF**: High-performance forest implementation
- **Preprocessor**: Data transformation and shingling
- **PredictorCorrector**: Score refinement and smoothing
- **BasicThresholder**: Dynamic threshold calculation

</details>


<details>
<summary><b>Benchmarks</b></summary>

Run benchmarks:
```bash
npm run build
npx ts-node benchmarks/java-typescript-comparison.ts
npx ts-node benchmarks/kibana-alerting-benchmark.ts
```

Results in [`benchmarks/results/`](benchmarks/results/).

</details>

<details>
<summary><b>CI/CD Pipeline</b></summary>

GitHub Actions automates:
- Testing on Node 16/18/20
- Coverage reporting
- Auto version bump on merge
- npm publishing

See [`.github/workflows/`](.github/workflows/) for configuration.

</details>

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/beshu-tech/trcf-ts/issues)
- 💬 [Discussions](https://github.com/beshu-tech/trcf-ts/discussions)
- 📦 [npm Package](https://www.npmjs.com/package/@beshu-tech/trcf-ts)

---

**Ready to detect anomalies?** Install now and catch issues before they escalate:

```bash
npm install @beshu-tech/trcf-ts
```