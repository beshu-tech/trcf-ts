/**
 * Complete example demonstrating TRCF with simplified RCF implementation
 * for time series anomaly detection
 */

import {
  ThresholdedRandomCutForest,
  SimplifiedRCF,
  ForestMode,
  TransformMethod,
  ScoringStrategy,
  ImputationMethod,
  RCFConfig,
  TRCFConfig,
  AnomalyDescriptor
} from '../src';

// Generate synthetic time series data with anomalies
function generateTimeSeriesData(): number[][] {
  const data: number[][] = [];
  const numPoints = 500;

  for (let i = 0; i < numPoints; i++) {
    const t = i * 0.1;

    // Normal pattern: sine wave with small noise
    const value1 = Math.sin(t) + (Math.random() - 0.5) * 0.1;
    const value2 = Math.cos(t) + (Math.random() - 0.5) * 0.1;

    // Inject anomalies at specific points
    if (i === 150 || i === 300 || i === 450) {
      // Spike anomaly
      data.push([value1 + 3, value2 - 2]);
    } else if (i >= 200 && i <= 210) {
      // Sustained anomaly
      data.push([value1 + 1.5, value2 + 1.5]);
    } else {
      data.push([value1, value2]);
    }
  }

  return data;
}

// Example 1: Basic anomaly detection with TRCF and SimplifiedRCF
async function basicAnomalyDetection() {
  console.log('=== Example 1: Basic Anomaly Detection ===\n');

  // Configure RCF
  const rcfConfig: RCFConfig = {
    dimensions: 2,
    shingleSize: 1,
    numberOfTrees: 10,
    sampleSize: 256,
    timeDecay: 0.0001,
    randomSeed: 42
  };

  // Create simplified RCF
  const rcf = new SimplifiedRCF(rcfConfig);

  // Configure TRCF
  const trcfConfig: TRCFConfig = {
    dimensions: 2,
    shingleSize: 1,
    forestMode: ForestMode.STANDARD,
    transformMethod: TransformMethod.NONE,
    scoringStrategy: ScoringStrategy.EXPECTED_INVERSE_DEPTH,
    autoAdjust: true,
    zFactor: 3.0
  };

  // Create TRCF with RCF
  const trcf = new ThresholdedRandomCutForest(trcfConfig);
  trcf.setForest(rcf);

  // Generate data
  const data = generateTimeSeriesData();

  // Process data and detect anomalies
  const anomalies: AnomalyDescriptor[] = [];

  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const timestamp = Date.now() + i * 1000;

    const result = trcf.process(point, timestamp);

    if (result.anomalyGrade > 0.5) {
      anomalies.push(result);
      console.log(`Anomaly detected at index ${i}:`);
      console.log(`  Score: ${result.anomalyScore.toFixed(4)}`);
      console.log(`  Grade: ${result.anomalyGrade.toFixed(4)}`);
      console.log(`  Data: [${point[0].toFixed(4)}, ${point[1].toFixed(4)}]`);
    }
  }

  console.log(`\nTotal anomalies detected: ${anomalies.length}`);
}

// Example 2: Time-augmented anomaly detection
async function timeAugmentedDetection() {
  console.log('\n=== Example 2: Time-Augmented Detection ===\n');

  // Configure RCF with time augmentation
  const rcfConfig: RCFConfig = {
    dimensions: 3, // 2 data dimensions + 1 time
    shingleSize: 1,
    numberOfTrees: 15,
    sampleSize: 256,
    timeDecay: 0.0001
  };

  const rcf = new SimplifiedRCF(rcfConfig);

  // Configure TRCF for time-augmented mode
  const trcfConfig: TRCFConfig = {
    dimensions: 2,
    shingleSize: 1,
    forestMode: ForestMode.TIME_AUGMENTED,
    transformMethod: TransformMethod.NONE,
    scoringStrategy: ScoringStrategy.EXPECTED_INVERSE_DEPTH
  };

  const trcf = new ThresholdedRandomCutForest(trcfConfig);
  trcf.setForest(rcf);

  // Generate data with irregular timestamps
  const data = generateTimeSeriesData();
  const timestamps: number[] = [];
  let currentTime = Date.now();

  for (let i = 0; i < data.length; i++) {
    // Irregular time intervals
    const interval = i % 50 === 0 ? 5000 : 1000; // Occasional gaps
    currentTime += interval;
    timestamps[i] = currentTime;
  }

  // Process with timestamps
  const results = trcf.processSequentially(data, timestamps);

  console.log(`Anomalies with time augmentation: ${results.length}`);
  results.slice(0, 5).forEach(r => {
    console.log(`  Grade: ${r.anomalyGrade.toFixed(4)}, Time: ${new Date(r.timestamp).toISOString()}`);
  });
}

// Example 3: Normalized and shingled data
async function normalizedShingledDetection() {
  console.log('\n=== Example 3: Normalized & Shingled Detection ===\n');

  const shingleSize = 4;
  const inputDimensions = 2;
  const totalDimensions = inputDimensions * shingleSize;

  // Configure RCF for shingled data
  const rcfConfig: RCFConfig = {
    dimensions: totalDimensions,
    shingleSize: shingleSize,
    numberOfTrees: 20,
    sampleSize: 256,
    timeDecay: 0.0001
  };

  const rcf = new SimplifiedRCF(rcfConfig);

  // Configure TRCF with normalization and shingling
  const trcfConfig: TRCFConfig = {
    dimensions: totalDimensions,
    shingleSize: shingleSize,
    forestMode: ForestMode.STANDARD,
    transformMethod: TransformMethod.NORMALIZE,
    scoringStrategy: ScoringStrategy.EXPECTED_INVERSE_DEPTH,
    startNormalization: 10, // Start normalizing after 10 points
    clipFactor: 10 // Clip normalized values at ±10 std devs
  };

  const trcf = new ThresholdedRandomCutForest(trcfConfig);
  trcf.setForest(rcf);

  // Process data
  const data = generateTimeSeriesData();
  const results = trcf.processSequentially(data.slice(0, 100));

  console.log(`Anomalies with normalization & shingling: ${results.length}`);
  if (results.length > 0) {
    console.log('Sample anomaly:');
    const sample = results[0];
    console.log(`  Score: ${sample.anomalyScore.toFixed(4)}`);
    console.log(`  Grade: ${sample.anomalyGrade.toFixed(4)}`);
    console.log(`  Confidence: ${sample.confidence.toFixed(4)}`);
  }
}

// Example 4: Missing value handling
async function missingValueHandling() {
  console.log('\n=== Example 4: Missing Value Handling ===\n');

  const rcfConfig: RCFConfig = {
    dimensions: 3,
    shingleSize: 1,
    numberOfTrees: 10,
    sampleSize: 256,
    timeDecay: 0.0001
  };

  const rcf = new SimplifiedRCF(rcfConfig);

  const trcfConfig: TRCFConfig = {
    dimensions: 3,
    shingleSize: 1,
    forestMode: ForestMode.STREAMING_IMPUTE,
    imputationMethod: ImputationMethod.RCF,
    scoringStrategy: ScoringStrategy.EXPECTED_INVERSE_DEPTH
  };

  const trcf = new ThresholdedRandomCutForest(trcfConfig);
  trcf.setForest(rcf);

  // Data with missing values (NaN)
  const dataWithMissing = [
    [1.0, 2.0, 3.0],
    [1.1, NaN, 3.1], // Missing value
    [1.2, 2.2, NaN], // Missing value
    [5.0, 6.0, 7.0], // Anomaly
    [1.3, 2.3, 3.3]
  ];

  console.log('Processing data with missing values:');

  for (let i = 0; i < dataWithMissing.length; i++) {
    const point = dataWithMissing[i];
    const missingIndices: number[] = [];

    // Find missing values
    point.forEach((val, idx) => {
      if (isNaN(val)) {
        missingIndices.push(idx);
      }
    });

    const result = trcf.process(point, Date.now() + i * 1000, missingIndices);

    console.log(`Point ${i}: [${point.map(v => isNaN(v) ? 'NaN' : v.toFixed(1)).join(', ')}]`);
    if (missingIndices.length > 0) {
      console.log(`  Missing indices: ${missingIndices.join(', ')}`);
      if (result.expectedRCFPoint) {
        console.log(`  Imputed values: ${missingIndices.map(idx =>
          result.expectedRCFPoint![idx].toFixed(2)).join(', ')}`);
      }
    }
    console.log(`  Anomaly grade: ${result.anomalyGrade.toFixed(4)}`);
  }
}

// Example 5: Multi-mode scoring
async function multiModeScoring() {
  console.log('\n=== Example 5: Multi-Mode Scoring ===\n');

  const rcfConfig: RCFConfig = {
    dimensions: 2,
    shingleSize: 1,
    numberOfTrees: 15,
    sampleSize: 256,
    timeDecay: 0.0001
  };

  const rcf = new SimplifiedRCF(rcfConfig);

  // Test different scoring strategies
  const strategies = [
    ScoringStrategy.EXPECTED_INVERSE_DEPTH,
    ScoringStrategy.DISTANCE,
    ScoringStrategy.MULTI_MODE
  ];

  const data = generateTimeSeriesData().slice(0, 50);

  for (const strategy of strategies) {
    console.log(`\nScoring with ${strategy}:`);

    const trcfConfig: TRCFConfig = {
      dimensions: 2,
      shingleSize: 1,
      scoringStrategy: strategy,
      autoAdjust: true
    };

    const trcf = new ThresholdedRandomCutForest(trcfConfig);
    trcf.setForest(rcf);

    const results = trcf.processSequentially(data);
    const avgGrade = results.reduce((sum, r) => sum + r.anomalyGrade, 0) /
                    (results.length || 1);

    console.log(`  Anomalies detected: ${results.length}`);
    console.log(`  Average grade: ${avgGrade.toFixed(4)}`);
  }
}

// Main function to run all examples
async function main() {
  console.log('TRCF TypeScript Implementation Examples');
  console.log('=' .repeat(40) + '\n');

  try {
    await basicAnomalyDetection();
    await timeAugmentedDetection();
    await normalizedShingledDetection();
    await missingValueHandling();
    await multiModeScoring();

    console.log('\n' + '=' .repeat(40));
    console.log('All examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main };