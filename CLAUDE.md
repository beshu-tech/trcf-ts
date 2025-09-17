# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript implementation of AWS's Thresholded Random Cut Forest (TRCF) algorithm for real-time anomaly detection in streaming time series data. Optimized for production use with 96,509 points/sec throughput and Java implementation parity (91-96% score accuracy, 25-58x faster performance).

## Development Commands

```bash
# Install and build
npm install
npm run build
npm run clean  # Remove dist/

# Testing
npm test                                    # Run all tests
npm run test:watch                         # Watch mode
npm run test:coverage                      # With coverage
npx jest tests/JavaCompatibility.test.ts   # Single test file
npx jest -t "threshold and grade"          # Single test by name

# Benchmarks (requires build first)
npx ts-node benchmarks/java-typescript-comparison.ts
npx ts-node benchmarks/kibana-alerting-benchmark.ts
npx ts-node benchmarks/quick-perf.ts

# Development
node --max-old-space-size=4096 dist/benchmarks/[benchmark].js  # With more memory
```

## Architecture

### Data Flow Pipeline
```
Input → Preprocessor → RCF Forest → PredictorCorrector → Thresholder → AnomalyDescriptor
         ↓               ↓            ↓                    ↓
      Shingling    Anomaly Score  Correction      Grade/Threshold
      Normalize    Attribution     Time Decay     Auto-adjust
      Transform    Imputation      Smoothing      Z-factor
```

### Core Architecture

**ThresholdedRandomCutForest** (`src/core/ThresholdedRandomCutForest.ts`)
- Orchestrates the entire anomaly detection pipeline
- Manages component lifecycle and data flow
- Key methods:
  - `process(data, timestamp)` - Main entry point returning AnomalyDescriptor
  - `setForest(rcf)` - Inject custom RCF implementation
  - `getState()/fromState()` - Serialization for distributed systems

**OptimizedRCF** (`src/rcf/OptimizedRCF.ts`)
- Production RCF implementation with Java parity
- Uses Float64Array for double precision
- JavaRandom for exact Java LCG algorithm compatibility
- Pre-allocated buffers eliminate GC pressure
- Tree-based anomaly scoring with reservoir sampling

**Preprocessor** (`src/preprocessor/Preprocessor.ts`)
- Data transformation pipeline before forest processing
- Shingling: Creates sliding windows for pattern detection
- Normalization: Zero mean, unit variance scaling
- Transform methods: NONE, NORMALIZE, DIFFERENCE, NORMALIZE_DIFFERENCE
- Imputation: Handles missing values (ZERO, FIXED, PREVIOUS, NEXT)

**PredictorCorrector** (`src/core/PredictorCorrector.ts`)
- Post-processing and score refinement
- Time decay for adaptive learning
- Scoring strategies: EXPECTED_INVERSE_DEPTH, DISTANCE, MULTI_MODE
- Correction modes: NONE, FILTER, SUBTRACT_EXPECTED
- Noise reduction and drift handling

**BasicThresholder** (`src/threshold/BasicThresholder.ts`)
- Dynamic threshold calculation based on score distribution
- Z-factor based anomaly grading (default 2.5)
- Deviation tracking with time decay
- Auto-adjustment based on observed data

**JavaRandom** (`src/utils/JavaRandom.ts`)
- Exact Java Random implementation for reproducibility
- Linear Congruential Generator: seed = (seed * 0x5DEECE66D + 0xB) & ((1 << 48) - 1)
- Critical for Java score parity

### Key Design Decisions

1. **Float64Array over Float32Array**: Full double precision for Java parity
2. **JavaRandom implementation**: Exact LCG algorithm for reproducible scores
3. **Pre-allocated buffers**: Avoid GC in hot paths
4. **Pluggable RCF interface**: Allow custom forest implementations
5. **Configuration alignment**: All defaults match Java (trees=30, z-factor=2.5, etc.)

### Forest Modes

- **STANDARD**: Basic RCF without time features
- **TIME_AUGMENTED**: Includes time differences as features (recommended for irregular sampling)
- **STREAMING_IMPUTE**: Handles missing values in real-time streams

### Transform Methods

- **NONE**: Raw data processing
- **NORMALIZE**: Zero mean, unit variance normalization
- **DIFFERENCE**: First-order differencing for trend removal
- **NORMALIZE_DIFFERENCE**: Combined normalization and differencing

## Test Files

- `tests/ThresholdedRandomCutForest.test.ts` - Core TRCF functionality
- `tests/AnomalyDetector.test.ts` - Simple API tests
- `tests/JavaCompatibility.test.ts` - Java parity validation
- `tests/JavaExampleReplication.test.ts` - Exact Java example replication

## Benchmarks

- `benchmarks/java-typescript-comparison.ts` - Java parity validation
- `benchmarks/kibana-alerting-benchmark.ts` - Production performance simulation
- `benchmarks/TRCFBenchmark.ts` - Comprehensive performance suite
- `benchmarks/results/` - JSON outputs from benchmark runs

## Key Interfaces

```typescript
// Main result object
interface AnomalyDescriptor {
  anomalyScore: number;      // Raw RCF score
  anomalyGrade: number;      // Normalized 0-1 grade
  dataConfidence: number;    // Confidence based on data seen
  isAnomaly: boolean;        // Grade > 0
  threshold: number;         // Current dynamic threshold
}

// Forest configuration
interface TRCFConfig {
  dimensions?: number;       // Default: 1
  shingleSize?: number;      // Default: 1
  numberOfTrees?: number;    // Default: 30 (Java default)
  sampleSize?: number;       // Default: 256
  anomalyRate?: number;      // Default: 0.005
  zFactor?: number;          // Default: 2.5 (Java default)
}
```

## Java Compatibility

| Aspect | Implementation | Result |
|--------|---------------|--------|
| Precision | Float64Array (double) | ✓ Exact |
| Random | Java LCG algorithm | ✓ Exact |
| Defaults | All aligned | ✓ Exact |
| Score Accuracy | - | 91-96% match |
| Performance | - | 25-58x faster |

## Configuration Enums

**ForestMode**: STANDARD, TIME_AUGMENTED (for irregular sampling), STREAMING_IMPUTE
**TransformMethod**: NONE, NORMALIZE, DIFFERENCE, NORMALIZE_DIFFERENCE
**ScoringStrategy**: EXPECTED_INVERSE_DEPTH, DISTANCE, MULTI_MODE
**ImputationMethod**: ZERO, FIXED, PREVIOUS, NEXT

## CI/CD (GitHub Actions)

- **CI**: Tests on Node 16/18/20, coverage, benchmarks
- **CD**: Auto version bump and npm publish on PR merge
- **Labels**: `breaking-change` → major, `feature` → minor, `bug` → patch
- **Required secrets**: `NPM_TOKEN` for publishing

See `.github/workflows/` for pipeline configuration.