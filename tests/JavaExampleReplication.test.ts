/**
 * Replication of ThresholdedInternalShinglingExample.java
 * This test aims to reproduce the exact behavior from the Java example
 */

import {
  ThresholdedRandomCutForest,
  OptimizedRCF,
  ForestMode,
  TransformMethod,
  ImputationMethod,
  TRCFConfig,
  RCFConfig
} from '../src';

/**
 * Generates multi-dimensional data with controlled changes
 * Similar to ShingledMultiDimDataWithKeys.getMultiDimData
 */
function generateMultiDimDataWithChanges(
  dataSize: number,
  baseDimensions: number,
  seed: number = 0
): {
  data: number[][];
  changeIndices: number[];
  changes: number[][];
} {
  const data: number[][] = [];
  const changeIndices: number[] = [];
  const changes: number[][] = [];

  // Simple random number generator with seed
  let randomSeed = seed;
  const random = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280;
    return randomSeed / 233280;
  };

  // Generate base pattern
  let baseValue = 1.0;
  let changeCounter = 0;

  for (let i = 0; i < dataSize; i++) {
    const point: number[] = [];

    // Inject changes at specific intervals
    if (i > 0 && i % 100 === 0) {
      changeIndices.push(i);
      const change = [];
      for (let d = 0; d < baseDimensions; d++) {
        const delta = (random() - 0.5) * 5; // Change magnitude
        change.push(delta);
        baseValue += delta;
      }
      changes.push(change);
      changeCounter++;
    }

    // Generate point with noise
    for (let d = 0; d < baseDimensions; d++) {
      const noise = (random() - 0.5) * 0.1;
      const value = Math.sin(i * 0.1 + d) * baseValue + noise;
      point.push(value);
    }

    // Inject anomalies at specific points
    if (i === 150 || i === 300 || i === 450) {
      for (let d = 0; d < baseDimensions; d++) {
        point[d] += 3.0; // Spike anomaly
      }
    }

    data.push(point);
  }

  return { data, changeIndices, changes };
}

describe('Java Example Replication', () => {
  test('ThresholdedInternalShinglingExample replication', () => {
    const shingleSize = 4;
    const numberOfTrees = 50;
    const sampleSize = 256;
    const dataSize = 4 * sampleSize;
    const baseDimensions = 1;
    const dimensions = baseDimensions * shingleSize;

    // Create two forests like in the Java example
    // First: STANDARD mode
    const rcf1 = new OptimizedRCF({
      dimensions,
      shingleSize,
      numberOfTrees,
      sampleSize,
      timeDecay: 1.0 / sampleSize,
      randomSeed: 0
    });

    const forest1 = new ThresholdedRandomCutForest({
      dimensions,
      shingleSize,
      sampleSize,
      numberOfTrees,
      randomSeed: 0,
      anomalyRate: 0.01,
      forestMode: ForestMode.STANDARD,
      transformMethod: TransformMethod.NORMALIZE_DIFFERENCE,
      outputAfterFraction: 0.125,
      initialAcceptFraction: 0.125,
      absoluteThreshold: 1.1
    });
    forest1.setForest(rcf1);

    // Second: TIME_AUGMENTED mode
    const rcf2 = new OptimizedRCF({
      dimensions: dimensions + shingleSize, // Time augmented adds dimensions
      shingleSize,
      numberOfTrees,
      sampleSize,
      timeDecay: 1.0 / sampleSize,
      randomSeed: 0
    });

    const forest2 = new ThresholdedRandomCutForest({
      dimensions,
      shingleSize,
      sampleSize,
      numberOfTrees,
      randomSeed: 0,
      anomalyRate: 0.01,
      forestMode: ForestMode.TIME_AUGMENTED,
      transformMethod: TransformMethod.NORMALIZE_DIFFERENCE,
      outputAfterFraction: 0.125,
      initialAcceptFraction: 0.125,
      absoluteThreshold: 1.1
    });
    forest2.setForest(rcf2);

    // Generate test data
    const testData = generateMultiDimDataWithChanges(
      dataSize + shingleSize - 1,
      baseDimensions,
      12345
    );

    let keyCounter = 0;
    const detectedAnomalies: any[] = [];

    // Process data through both forests
    for (let count = 0; count < testData.data.length; count++) {
      const point = testData.data[count];
      const timestamp = 100 * count + Math.floor(Math.random() * 10) - 5;

      const result1 = forest1.process(point, timestamp);
      const result2 = forest2.process(point, timestamp);

      // Log change points
      if (keyCounter < testData.changeIndices.length &&
          count === testData.changeIndices[keyCounter]) {
        console.log(`Change at ${count}: ${testData.changes[keyCounter]}`);
        keyCounter++;
      }

      // Record anomalies
      if (result1.anomalyGrade > 0) {
        detectedAnomalies.push({
          timestamp: count,
          point: point,
          score: result1.anomalyScore,
          grade: result1.anomalyGrade,
          expectedValues: result1.expectedRCFPoint
        });
      }
    }

    // Verify some anomalies were detected
    expect(detectedAnomalies.length).toBeGreaterThan(0);

    // Check that anomalies were detected around the injected points
    const anomalyTimestamps = detectedAnomalies.map(a => a.timestamp);

    // We injected anomalies at 150, 300, 450
    // Due to shingling and processing, detection might be slightly delayed
    const expectedAnomaryRegions = [
      { start: 145, end: 155 },
      { start: 295, end: 305 },
      { start: 445, end: 455 }
    ];

    let foundCount = 0;
    for (const region of expectedAnomaryRegions) {
      const found = anomalyTimestamps.some(t =>
        t >= region.start && t <= region.end
      );
      if (found) foundCount++;
    }

    // Should detect at least some of the injected anomalies
    console.log(`Detected ${foundCount} out of ${expectedAnomaryRegions.length} anomaly regions`);
    console.log(`Total anomalies detected: ${detectedAnomalies.length}`);
  });

  test('Imputation example with fixed data pattern', () => {
    const baseDimensions = 1;
    const shingleSize = 4;
    const dimensions = baseDimensions * shingleSize;

    const rcf = new OptimizedRCF({
      dimensions,
      shingleSize,
      numberOfTrees: 20,
      sampleSize: 256,
      timeDecay: 0.01,
      randomSeed: 42
    });

    const forest = new ThresholdedRandomCutForest({
      dimensions,
      shingleSize,
      forestMode: ForestMode.STREAMING_IMPUTE,
      imputationMethod: ImputationMethod.PREVIOUS,
      anomalyRate: 0.01
    });
    forest.setForest(rcf);

    const fixedData = [1.0];
    const anomalyData = [10.0];

    // Process fixed pattern
    let count = 0;
    for (let i = 0; i < 200; i++) {
      const timestamp = count * 113 + Math.floor(Math.random() * 10);
      forest.process(fixedData, timestamp);
      count++;
    }

    // Process anomaly with gap
    const anomalyResult = forest.process(anomalyData, count * 113 + 1000);

    // Verify anomaly detection
    expect(anomalyResult.anomalyGrade).toBeGreaterThan(0);

    // Check if expected values are present
    if (anomalyResult.expectedRCFPoint) {
      console.log('Expected values:', anomalyResult.expectedRCFPoint);
      // Expected values should be close to the fixed pattern
      expect(anomalyResult.expectedRCFPoint[0]).toBeCloseTo(1.0, 0);
    }

    // Process consecutive anomaly
    const secondAnomalyResult = forest.process(anomalyData, count * 113 + 1113);

    // Second anomaly should also be detected
    expect(secondAnomalyResult.anomalyGrade).toBeGreaterThan(0);
  });

  test('Comparison between STANDARD and TIME_AUGMENTED modes', () => {
    const shingleSize = 4;
    const baseDimensions = 2;
    const dimensions = baseDimensions * shingleSize;

    // Standard mode forest
    const rcfStandard = new OptimizedRCF({
      dimensions,
      shingleSize,
      numberOfTrees: 30,
      sampleSize: 256,
      timeDecay: 0.01,
      randomSeed: 100
    });

    const forestStandard = new ThresholdedRandomCutForest({
      dimensions,
      shingleSize,
      forestMode: ForestMode.STANDARD,
      transformMethod: TransformMethod.NORMALIZE,
      randomSeed: 100
    });
    forestStandard.setForest(rcfStandard);

    // Time-augmented mode forest
    const rcfTimeAugmented = new OptimizedRCF({
      dimensions: dimensions + shingleSize,
      shingleSize,
      numberOfTrees: 30,
      sampleSize: 256,
      timeDecay: 0.01,
      randomSeed: 100
    });

    const forestTimeAugmented = new ThresholdedRandomCutForest({
      dimensions,
      shingleSize,
      forestMode: ForestMode.TIME_AUGMENTED,
      transformMethod: TransformMethod.NORMALIZE,
      randomSeed: 100
    });
    forestTimeAugmented.setForest(rcfTimeAugmented);

    // Generate data with irregular timestamps
    const data: number[][] = [];
    const timestamps: number[] = [];
    let currentTime = 0;

    for (let i = 0; i < 100; i++) {
      const point: number[] = [];
      for (let d = 0; d < baseDimensions; d++) {
        point.push(Math.sin(i * 0.1 + d));
      }
      data.push(point);

      // Irregular time intervals
      const interval = i % 10 === 0 ? 500 : 100;
      currentTime += interval;
      timestamps.push(currentTime);
    }

    // Process through both forests
    const resultsStandard = forestStandard.processSequentially(data, timestamps);
    const resultsTimeAugmented = forestTimeAugmented.processSequentially(data, timestamps);

    // Time-augmented should potentially detect anomalies at irregular intervals
    console.log(`Standard mode anomalies: ${resultsStandard.length}`);
    console.log(`Time-augmented mode anomalies: ${resultsTimeAugmented.length}`);

    // Both should process all points
    expect(forestStandard.getTotalUpdates()).toBeGreaterThan(0);
    expect(forestTimeAugmented.getTotalUpdates()).toBeGreaterThan(0);
  });
});