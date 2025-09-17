/**
 * Java vs TypeScript TRCF Implementation Comparison Benchmark
 *
 * This benchmark compares the TypeScript TRCF implementation against
 * the official Java implementation for various time series lengths.
 */

import { ThresholdedRandomCutForest } from '../src/core/ThresholdedRandomCutForest';
import { TransformMethod } from '../src/config/TransformMethod';
import { ForestMode } from '../src/config/ForestMode';
import { JavaRandom } from '../src/utils/JavaRandom';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  implementation: string;
  testName: string;
  length: number;
  shingleSize: number;
  meanScore: number;
  maxScore: number;
  minScore: number;
  stdScore: number;
  anomalyCount: number;
  anomalyRate: number;
  elapsedTime: number;
  throughput: number;
  first10Scores: number[];
  anomalyIndices: number[];
}

/**
 * Generate test time series data matching Java implementation exactly
 */
function generateTimeSeries(length: number, seed: number): number[] {
  const random = new JavaRandom(seed);
  const data: number[] = [];

  for (let i = 0; i < length; i++) {
    const t = (i / length) * 4 * Math.PI;
    // Base signal - exactly as in Java
    const base = 10 * Math.sin(t) + 5 * Math.sin(3 * t) + 2 * Math.sin(5 * t);
    const noise = (random.nextDouble() - 0.5) * 0.5;
    data[i] = base + noise;

    // Add anomalies at specific positions (matching Java test exactly)
    if (i === Math.floor(length / 4) || i === Math.floor(length / 2) || i === Math.floor(3 * length / 4)) {
      data[i] += 20;
    }

    // Smaller anomalies
    if (i % 200 === 150) {
      data[i] += 10;
    }
  }

  return data;
}

/**
 * Run TypeScript TRCF test matching Java configuration exactly
 */
function runTypeScriptTest(length: number, shingleSize: number, testName: string): TestResult {
  const startTime = Date.now();

  // Create TRCF with exact Java configuration
  const forest = new ThresholdedRandomCutForest({
    dimensions: shingleSize,
    shingleSize: shingleSize,
    sampleSize: 256,
    numberOfTrees: 50,  // Match Java exactly
    timeDecay: 0.0001,
    anomalyRate: 0.01,  // Match Java test
    transformMethod: TransformMethod.NORMALIZE,
    forestMode: ForestMode.STANDARD,
    autoAdjust: true,
    outputAfterFraction: 0.25,  // Match Java's initialAcceptFraction
    boundingBoxCacheFraction: 1,
    randomSeed: 42  // Fixed seed for reproducibility
  });

  // Set z-factor to match Java test
  forest.setZFactor(3.0);

  // Generate data with same seed as Java
  const data = generateTimeSeries(length, 42);

  // Process data
  const scores: number[] = [];
  const grades: number[] = [];
  const anomalies: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const result = forest.process([data[i]], i);

    const score = result.anomalyScore || 0;
    const grade = result.anomalyGrade || 0;

    scores.push(score);
    grades.push(grade);

    if (grade > 0) {
      anomalies.push(i);
    }
  }

  const elapsedTime = (Date.now() - startTime) / 1000;

  // Calculate statistics
  const validScores = scores.filter(s => !isNaN(s) && s !== null);
  const meanScore = validScores.length > 0
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : 0;
  const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;
  const minScore = validScores.length > 0 ? Math.min(...validScores) : 0;

  // Calculate std deviation
  const variance = validScores.length > 0
    ? validScores.reduce((sum, score) => sum + Math.pow(score - meanScore, 2), 0) / validScores.length
    : 0;
  const stdScore = Math.sqrt(variance);

  return {
    implementation: 'TypeScript',
    testName: testName,
    length: length,
    shingleSize: shingleSize,
    meanScore: meanScore,
    maxScore: maxScore,
    minScore: minScore,
    stdScore: stdScore,
    anomalyCount: anomalies.length,
    anomalyRate: anomalies.length / length,
    elapsedTime: elapsedTime,
    throughput: length / elapsedTime,
    first10Scores: scores.slice(0, 10),
    anomalyIndices: anomalies
  };
}

// Java results from actual Java test run (update these when re-running Java tests)
const JAVA_RESULTS: TestResult[] = [
  {
    implementation: 'Java',
    testName: 'Short univariate series',
    length: 500,
    shingleSize: 1,
    meanScore: 0.7271,
    maxScore: 4.7746,
    minScore: 0.0,
    stdScore: 0.4599,
    anomalyCount: 5,
    anomalyRate: 0.01,
    elapsedTime: 0.202,
    throughput: 2475,
    first10Scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    anomalyIndices: [121, 122, 123, 250, 350]
  },
  {
    implementation: 'Java',
    testName: 'Medium univariate series',
    length: 2000,
    shingleSize: 1,
    meanScore: 0.8092,
    maxScore: 5.0485,
    minScore: 0.0,
    stdScore: 0.3596,
    anomalyCount: 7,
    anomalyRate: 0.0035,
    elapsedTime: 0.159,
    throughput: 12579,
    first10Scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    anomalyIndices: [92, 104, 150, 350, 500, 1000, 1150]
  },
  {
    implementation: 'Java',
    testName: 'Long univariate series',
    length: 5000,
    shingleSize: 1,
    meanScore: 0.8163,
    maxScore: 5.9223,
    minScore: 0.0,
    stdScore: 0.3571,
    anomalyCount: 9,
    anomalyRate: 0.0018,
    elapsedTime: 0.199,
    throughput: 25126,
    first10Scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    anomalyIndices: [150, 350, 750, 1950, 2150, 2350, 2500, 2750, 3750]
  },
  {
    implementation: 'Java',
    testName: 'Medium series with shingle=4',
    length: 2000,
    shingleSize: 4,
    meanScore: 0.7324,
    maxScore: 3.4073,
    minScore: 0.0,
    stdScore: 0.3737,
    anomalyCount: 7,
    anomalyRate: 0.0035,
    elapsedTime: 0.174,
    throughput: 11494,
    first10Scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    anomalyIndices: [145, 150, 350, 500, 550, 1000, 1500]
  }
];

/**
 * Calculate similarity metrics between TypeScript and Java results
 */
function calculateSimilarity(tsResult: TestResult, javaResult: TestResult) {
  const scoreRatio = tsResult.meanScore / javaResult.meanScore;
  const maxScoreRatio = tsResult.maxScore / javaResult.maxScore;

  // Calculate Jaccard similarity for anomaly indices
  const tsSet = new Set(tsResult.anomalyIndices);
  const javaSet = new Set(javaResult.anomalyIndices);
  const intersection = new Set([...tsSet].filter(x => javaSet.has(x)));
  const union = new Set([...tsSet, ...javaSet]);
  const jaccard = union.size > 0 ? intersection.size / union.size : 0;

  // Performance comparison
  const speedup = tsResult.throughput / javaResult.throughput;

  return {
    meanScoreRatio: scoreRatio,
    maxScoreRatio: maxScoreRatio,
    anomalyJaccardSimilarity: jaccard,
    performanceSpeedup: speedup,
    anomalyOverlap: intersection.size
  };
}

/**
 * Run the complete benchmark suite
 */
export function runBenchmark() {
  console.log('=' .repeat(80));
  console.log('Java vs TypeScript TRCF Implementation Benchmark');
  console.log('=' .repeat(80));
  console.log('');

  const testCases = [
    { length: 500, shingleSize: 1, name: 'Short univariate series' },
    { length: 2000, shingleSize: 1, name: 'Medium univariate series' },
    { length: 5000, shingleSize: 1, name: 'Long univariate series' },
    { length: 2000, shingleSize: 4, name: 'Medium series with shingle=4' }
  ];

  const tsResults: TestResult[] = [];
  const comparisons: any[] = [];

  // Run TypeScript tests
  for (const testCase of testCases) {
    console.log(`\nRunning: ${testCase.name}...`);
    const tsResult = runTypeScriptTest(testCase.length, testCase.shingleSize, testCase.name);
    tsResults.push(tsResult);

    // Find matching Java result
    const javaResult = JAVA_RESULTS.find(r => r.testName === testCase.name);
    if (javaResult) {
      const comparison = calculateSimilarity(tsResult, javaResult);
      comparisons.push({
        testName: testCase.name,
        ...comparison
      });

      // Print immediate comparison
      console.log(`  TypeScript Mean Score: ${tsResult.meanScore.toFixed(4)}`);
      console.log(`  Java Mean Score: ${javaResult.meanScore.toFixed(4)}`);
      console.log(`  Score Ratio: ${comparison.meanScoreRatio.toFixed(3)}`);
      console.log(`  Performance: ${comparison.performanceSpeedup.toFixed(1)}x faster`);
    }
  }

  // Print summary
  console.log('\n' + '=' .repeat(80));
  console.log('SUMMARY');
  console.log('=' .repeat(80));

  // Calculate averages
  const avgScoreRatio = comparisons.reduce((sum, c) => sum + c.meanScoreRatio, 0) / comparisons.length;
  const avgSpeedup = comparisons.reduce((sum, c) => sum + c.performanceSpeedup, 0) / comparisons.length;
  const avgJaccard = comparisons.reduce((sum, c) => sum + c.anomalyJaccardSimilarity, 0) / comparisons.length;

  console.log(`\nAverage Score Ratio (TS/Java): ${avgScoreRatio.toFixed(3)}`);
  console.log(`Average Performance Speedup: ${avgSpeedup.toFixed(1)}x`);
  console.log(`Average Anomaly Detection Overlap: ${(avgJaccard * 100).toFixed(1)}%`);

  console.log('\nDetailed Results:');
  console.log('-'.repeat(80));

  const table: any[] = [];
  comparisons.forEach((comp, i) => {
    table.push({
      Test: comp.testName,
      'Score Ratio': comp.meanScoreRatio.toFixed(3),
      'Max Score Ratio': comp.maxScoreRatio.toFixed(3),
      'Speedup': `${comp.performanceSpeedup.toFixed(1)}x`,
      'Anomaly Overlap': `${comp.anomalyOverlap}/${JAVA_RESULTS[i].anomalyCount}`
    });
  });

  console.table(table);

  // Save results to file
  const resultsPath = path.join(__dirname, 'java-typescript-comparison-results.json');
  const results = {
    timestamp: new Date().toISOString(),
    typescriptResults: tsResults,
    javaResults: JAVA_RESULTS,
    comparisons: comparisons,
    summary: {
      averageScoreRatio: avgScoreRatio,
      averageSpeedup: avgSpeedup,
      averageJaccardSimilarity: avgJaccard
    }
  };

  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);

  return results;
}

// Run if executed directly
if (require.main === module) {
  runBenchmark();
}