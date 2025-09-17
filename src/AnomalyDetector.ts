/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

import { ThresholdedRandomCutForest, TRCFConfig } from './core/ThresholdedRandomCutForest';
import { OptimizedRCF } from './rcf/OptimizedRCF';
import { ForestMode } from './config/ForestMode';
import { TransformMethod } from './config/TransformMethod';
import { ScoringStrategy } from './config/ScoringStrategy';
import { AnomalyDescriptor } from './types/AnomalyDescriptor';

/**
 * Simple configuration for the AnomalyDetector
 */
export interface AnomalyDetectorConfig {
  /** Number of data points to consider for anomaly detection (default: 256) */
  windowSize?: number;
  /** Expected rate of anomalies in your data (0-1, default: 0.01) */
  anomalyRate?: number;
  /** Number of trees in the forest (default: 20 for performance, 50 for accuracy) */
  numberOfTrees?: number;
  /** Size of sliding window for time series patterns (default: 4) */
  shingleSize?: number;
  /** Normalize data to handle different scales (default: true) */
  normalize?: boolean;
  /** Enable time-aware features for irregular sampling (default: false) */
  timeAware?: boolean;
}

/**
 * Result of anomaly detection
 */
export interface AnomalyResult {
  /** Anomaly score (higher = more anomalous) */
  score: number;
  /** Anomaly grade from 0-1 (0 = normal, 1 = highly anomalous) */
  grade: number;
  /** Whether this point is considered anomalous */
  isAnomaly: boolean;
  /** Confidence in the detection (0-1) */
  confidence: number;
  /** Threshold used for detection */
  threshold: number;
  /** Expected normal values (if available) */
  expectedValues?: number[];
}

/**
 * Simple, high-performance anomaly detector for streaming data
 *
 * @example
 * ```typescript
 * import { AnomalyDetector } from 'trcf-typescript';
 *
 * const detector = new AnomalyDetector({
 *   windowSize: 256,
 *   anomalyRate: 0.01
 * });
 *
 * const result = detector.detect([1.0, 2.0, 3.0]);
 * if (result.isAnomaly) {
 *   console.log(`Anomaly detected! Grade: ${result.grade}`);
 * }
 * ```
 */
export class AnomalyDetector {
  private trcf: ThresholdedRandomCutForest;
  private dimensions: number;
  private initialized = false;
  private config: AnomalyDetectorConfig;

  constructor(config: AnomalyDetectorConfig = {}) {
    const {
      windowSize = 256,
      anomalyRate = 0.01,
      numberOfTrees = 20, // Optimized for performance
      shingleSize = 4,
      normalize = true,
      timeAware = false
    } = config;

    // Store config for later initialization
    this.config = {
      windowSize,
      anomalyRate,
      numberOfTrees,
      shingleSize,
      normalize,
      timeAware
    };

    // We'll determine dimensions from the first data point
    this.dimensions = 0;
    this.trcf = null as any; // Will be initialized properly later
  }

  /**
   * Detect anomalies in a single data point
   *
   * @param dataPoint Array of numbers representing your data
   * @param timestamp Optional timestamp (default: current time)
   * @returns Anomaly detection result
   */
  detect(dataPoint: number[], timestamp?: number): AnomalyResult {
    if (!this.initialized) {
      this.initialize(dataPoint);
    }

    if (dataPoint.length !== this.dimensions) {
      throw new Error(`Expected ${this.dimensions} dimensions, got ${dataPoint.length}`);
    }

    const actualTimestamp = timestamp ?? Date.now();
    const descriptor = this.trcf.process(dataPoint, actualTimestamp);

    return this.formatResult(descriptor);
  }

  /**
   * Detect anomalies in multiple data points at once
   *
   * @param dataPoints Array of data points
   * @param timestamps Optional timestamps for each point
   * @param onlyAnomalies If true, only return anomalous points (default: false)
   * @returns Array of anomaly detection results
   */
  detectBatch(
    dataPoints: number[][],
    timestamps?: number[],
    onlyAnomalies = false
  ): AnomalyResult[] {
    if (dataPoints.length === 0) return [];

    if (!this.initialized) {
      this.initialize(dataPoints[0]);
    }

    const actualTimestamps = timestamps || dataPoints.map((_, i) => Date.now() + i);

    const descriptors = this.trcf.processSequentially(
      dataPoints,
      actualTimestamps,
      onlyAnomalies ? (d) => d.anomalyGrade > 0 : () => true // Return all results
    );

    return descriptors.map(d => this.formatResult(d));
  }

  /**
   * Get the current state for checkpointing/serialization
   */
  getState(): any {
    if (!this.initialized) {
      return null;
    }
    return this.trcf.getLastAnomalyDescriptor();
  }

  /**
   * Get statistics about the detector
   */
  getStats() {
    if (!this.initialized) {
      return {
        totalUpdates: 0,
        dimensions: this.dimensions,
        isReady: false,
        lastThreshold: 0
      };
    }

    const lastDescriptor = this.trcf.getLastAnomalyDescriptor();
    return {
      totalUpdates: this.trcf.getTotalUpdates(),
      dimensions: this.dimensions,
      isReady: this.trcf.getTotalUpdates() > 10, // Ready after some warmup
      lastThreshold: lastDescriptor?.threshold ?? 0
    };
  }

  private initialize(firstDataPoint: number[]) {
    this.dimensions = firstDataPoint.length;

    const {
      anomalyRate,
      numberOfTrees,
      shingleSize,
      normalize,
      timeAware
    } = this.config;

    // Calculate total dimensions for the TRCF (inputDimensions * shingleSize)
    const totalDimensions = this.dimensions * shingleSize!;

    // Create TRCF configuration with proper dimensions
    const trcfConfig: TRCFConfig = {
      dimensions: totalDimensions,
      shingleSize: shingleSize,
      anomalyRate: anomalyRate,
      forestMode: timeAware ? ForestMode.TIME_AUGMENTED : ForestMode.STANDARD,
      transformMethod: normalize ? TransformMethod.NORMALIZE : TransformMethod.NONE,
      scoringStrategy: ScoringStrategy.EXPECTED_INVERSE_DEPTH,
      autoAdjust: true,
      outputAfterFraction: 0.1, // Start detecting after 10% of window
      zFactor: 2.0, // More sensitive thresholding (default is 3.0)
      absoluteThreshold: 0.5 // Lower absolute threshold for more sensitivity
    };

    // Create the TRCF with proper configuration
    this.trcf = new ThresholdedRandomCutForest(trcfConfig);

    // Create and set the optimized RCF
    const rcf = new OptimizedRCF({
      dimensions: totalDimensions,
      shingleSize: 1, // Shingling handled by preprocessor
      numberOfTrees: numberOfTrees!,
      sampleSize: this.config.windowSize!,
      timeDecay: 0.001 // Slow adaptation for stability
    });

    this.trcf.setForest(rcf);
    this.initialized = true;
  }

  private formatResult(descriptor: AnomalyDescriptor): AnomalyResult {
    return {
      score: descriptor.anomalyScore,
      grade: descriptor.anomalyGrade,
      isAnomaly: descriptor.anomalyGrade > 0, // Anomaly grade > 0 indicates anomaly
      confidence: descriptor.confidence || descriptor.anomalyGrade,
      threshold: descriptor.threshold,
      expectedValues: descriptor.expectedRCFPoint || undefined
    };
  }
}

/**
 * Create a simple anomaly detector for single-variable time series
 * Optimized for monitoring metrics like CPU usage, response times, etc.
 *
 * @param config Optional configuration
 * @returns Configured AnomalyDetector
 *
 * @example
 * ```typescript
 * import { createTimeSeriesDetector } from 'trcf-typescript';
 *
 * const detector = createTimeSeriesDetector({ anomalyRate: 0.005 });
 *
 * // Detect anomalies in a single metric
 * const cpuUsage = [45, 52, 48, 51, 89]; // Spike at 89
 * cpuUsage.forEach(value => {
 *   const result = detector.detect([value]);
 *   if (result.isAnomaly) {
 *     console.log(`CPU spike detected: ${value}%`);
 *   }
 * });
 * ```
 */
export function createTimeSeriesDetector(config: Omit<AnomalyDetectorConfig, 'shingleSize'> = {}) {
  return new AnomalyDetector({
    ...config,
    shingleSize: 4, // Optimized for time series
    normalize: true, // Always normalize for time series
  });
}

/**
 * Create an anomaly detector optimized for multi-dimensional data
 * Good for detecting anomalies across multiple related metrics
 *
 * @param config Optional configuration
 * @returns Configured AnomalyDetector
 *
 * @example
 * ```typescript
 * import { createMultiVariateDetector } from 'trcf-typescript';
 *
 * const detector = createMultiVariateDetector({ windowSize: 512 });
 *
 * // Monitor multiple metrics together
 * const metrics = [cpuPercent, memoryPercent, diskIO, networkIO];
 * const result = detector.detect(metrics);
 * ```
 */
export function createMultiVariateDetector(config: Omit<AnomalyDetectorConfig, 'shingleSize'> = {}) {
  return new AnomalyDetector({
    ...config,
    shingleSize: 1, // No shingling for multi-variate
    normalize: true,
    numberOfTrees: 30, // More trees for multi-dimensional accuracy
  });
}