# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript implementation of AWS's Thresholded Random Cut Forest (TRCF) algorithm, specifically optimized for **mono-variable time series anomaly detection in Kibana alerting systems**. The implementation achieves 96,509 points/sec throughput with 0.017ms P99 latency.

## Build Commands

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Clean build artifacts
npm run clean

# Run tests
npm test

# Run specific test file
npx jest tests/core/ThresholdedRandomCutForest.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run benchmarks (after building)
npx ts-node benchmarks/mono-variable-benchmark.ts
npx ts-node benchmarks/kibana-alerting-benchmark.ts
```

## Architecture & Key Components

### Core Algorithm Flow
```
Input Data → Preprocessor → RCF Forest → PredictorCorrector → AnomalyDescriptor
```

### Critical Implementation Classes

1. **ThresholdedRandomCutForest** (`src/core/ThresholdedRandomCutForest.ts`)
   - Main orchestrator combining all components
   - Uses `RandomCutForest` interface for pluggable RCF implementations
   - Manages preprocessing, scoring, and thresholding pipeline

2. **OptimizedRCF** (`src/rcf/OptimizedRCF.ts`)
   - Performance-critical implementation using Float32Arrays throughout
   - Pre-allocated buffers for zero-allocation scoring
   - 187x-750x faster than SimplifiedRCF implementation

3. **Preprocessor** (`src/preprocessor/Preprocessor.ts`)
   - Handles shingling (sliding windows), normalization, differencing
   - Manages missing value imputation strategies
   - Supports TIME_AUGMENTED mode for temporal patterns

4. **PredictorCorrector** (`src/core/PredictorCorrector.ts`)
   - Implements adaptive thresholding with time decay
   - Manages multiple scoring strategies (EXPECTED_INVERSE_DEPTH, DISTANCE)
   - Handles noise suppression and drift correction

5. **StateSerializer** (`src/serialization/StateSerializer.ts`)
   - Efficient state checkpointing for distributed Kibana deployments
   - Achieves 0.18KB compressed state size (555x below limit)
   - Sub-millisecond serialization/deserialization

### Performance Optimizations for Kibana

The implementation is specifically optimized for:
- **Mono-variable time series**: Single metric tracking over years
- **Streaming processing**: Sub-millisecond latency per point
- **State persistence**: Efficient checkpointing every second
- **Memory efficiency**: 1.17GB for 1M points sliding window

Key optimizations:
- Float32Arrays for all numerical operations
- Pre-allocated buffers to avoid garbage collection
- Simplified tree structure for mono-variable data
- Optimized shingling for time series patterns

### Forest Modes

- **STANDARD**: Basic RCF without time features
- **TIME_AUGMENTED**: Includes time differences as features (recommended for irregular sampling)
- **STREAMING_IMPUTE**: Handles missing values in real-time streams

### Transform Methods

- **NONE**: Raw data processing
- **NORMALIZE**: Zero mean, unit variance normalization
- **DIFFERENCE**: First-order differencing for trend removal
- **NORMALIZE_DIFFERENCE**: Combined normalization and differencing

## Testing Strategy

Tests are organized by component:
- `tests/core/` - Core TRCF and predictor tests
- `tests/preprocessor/` - Data preprocessing tests
- `tests/threshold/` - Thresholding algorithm tests
- `tests/utils/` - Utility function tests
- `tests/java-compatibility/` - Java implementation compatibility tests

## Benchmark Files

Key benchmark files for performance validation:
- `benchmarks/mono-variable-benchmark.ts` - Kibana-specific mono-variable performance
- `benchmarks/kibana-alerting-benchmark.ts` - Full Kibana alerting simulation
- `benchmarks/compare-implementations.ts` - SimplifiedRCF vs OptimizedRCF comparison

Shared utilities in `benchmarks/shared/BenchmarkUtils.ts` provide:
- Data generation (random, sinusoidal, mixed patterns)
- Memory measurement utilities
- Percentile calculations
- System info logging

## Integration Points

### Using with Real RCF Implementation

The `RandomCutForest` interface in `ThresholdedRandomCutForest.ts` allows plugging in actual RCF implementations:

```typescript
interface RandomCutForest {
  process(point: Float32Array): {
    score: number;
    expectedPoint?: number[];
    attribution?: number[];
  };
  getTotalUpdates(): number;
  getShingleSize(): number;
  getDimensions(): number;
}
```

Set a custom implementation via:
```typescript
trcf.setForest(myRCFImplementation);
```

### Kibana Integration Configuration

For Kibana alerting, use these optimized settings:
```typescript
{
  shingleSize: 4,        // Captures short-term patterns
  numberOfTrees: 20,     // Balance accuracy/speed
  sampleSize: 256,       // ~4 min at 1pt/sec
  anomalyRate: 0.01,     // 1% expected anomalies
  timeDecay: 0.001       // Adapt slowly
}
```

## Performance Metrics

Current implementation achieves (from KIBANA-METRICS.md):
- Throughput: 96,509 points/sec (9.6x requirement)
- P99 Latency: 0.017ms (588x faster than requirement)
- State Size: 0.18KB compressed (555x smaller than limit)
- Memory: 1.17GB for 1M points (below 2GB limit)

## Important Implementation Notes

1. **SimplifiedRCF vs OptimizedRCF**: Always use OptimizedRCF for production. SimplifiedRCF is only for testing/comparison.

2. **Type Safety**: All numerical arrays use Float32Array for performance. Ensure proper type conversion when interfacing with external systems.

3. **Time Decay**: The `timeDecay` parameter significantly affects adaptive behavior. Use 0.001 for slow adaptation, 0.01 for faster response to distribution changes.

4. **Missing Values**: The system handles NaN values automatically. Use the `missingValues` parameter in `process()` for explicit missing indices.

5. **Benchmarking**: When running benchmarks, ensure Node.js heap size is adequate:
   ```bash
   node --max-old-space-size=4096 dist/benchmarks/your-benchmark.js
   ```