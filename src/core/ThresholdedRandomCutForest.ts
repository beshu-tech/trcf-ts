/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

import { ForestMode } from '../config/ForestMode';
import { TransformMethod } from '../config/TransformMethod';
import { ScoringStrategy } from '../config/ScoringStrategy';
import { ImputationMethod } from '../config/ImputationMethod';
import { Preprocessor, PreprocessorConfig } from '../preprocessor/Preprocessor';
import { PredictorCorrector } from './PredictorCorrector';
import { AnomalyDescriptor } from '../types/AnomalyDescriptor';
import { BasicThresholder } from '../threshold/BasicThresholder';

// Simplified RCF interface - in production, this would be the actual RCF implementation
export interface RandomCutForest {
  process(point: Float64Array): {
    score: number;
    expectedPoint?: number[];
    attribution?: number[];
  };
  getTotalUpdates(): number;
  getShingleSize(): number;
  getDimensions(): number;
}

export interface TRCFConfig {
  // Forest configuration
  dimensions?: number;
  shingleSize?: number;
  sampleSize?: number;
  numberOfTrees?: number;
  timeDecay?: number;
  anomalyRate?: number;

  // Preprocessing configuration
  forestMode?: ForestMode;
  transformMethod?: TransformMethod;
  scoringStrategy?: ScoringStrategy;
  imputationMethod?: ImputationMethod;

  // Normalization parameters
  startNormalization?: number;
  stopNormalization?: number;
  clipFactor?: number;

  // Thresholding parameters
  autoAdjust?: boolean;
  absoluteThreshold?: number;
  zFactor?: number;

  // Other parameters
  randomSeed?: number;
  boundingBoxCacheFraction?: number;
  initialAcceptFraction?: number;
  outputAfterFraction?: number;
}

export class ThresholdedRandomCutForest {
  // Java-compatible defaults
  private static readonly DEFAULT_SHINGLE_SIZE = 1;  // Java base default
  private static readonly DEFAULT_SAMPLE_SIZE = 256;
  private static readonly DEFAULT_NUMBER_OF_TREES = 30;  // Match Java Python wrapper
  private static readonly DEFAULT_TIME_DECAY = 0.0001;
  private static readonly DEFAULT_ANOMALY_RATE = 0.005;  // Match Java Python wrapper
  private static readonly DEFAULT_BOUNDING_BOX_CACHE_FRACTION = 1.0;
  private static readonly DEFAULT_INITIAL_ACCEPT_FRACTION = 0.125;
  private static readonly DEFAULT_OUTPUT_AFTER_FRACTION = 0.25;
  private static readonly DEFAULT_Z_FACTOR = 2.5;  // Java default
  private static readonly DEFAULT_AUTO_ADJUST = true;  // Java default
  private static readonly DEFAULT_TRANSFORM_METHOD = TransformMethod.NORMALIZE;  // Java default

  private forestMode: ForestMode;
  private transformMethod: TransformMethod;
  private scoringStrategy: ScoringStrategy;
  private preprocessor: Preprocessor;
  private predictorCorrector: PredictorCorrector;
  private forest: RandomCutForest | null = null;
  private lastAnomalyDescriptor: AnomalyDescriptor | null = null;
  private config: TRCFConfig;
  private totalUpdates: number = 0;
  private boundingBoxCacheFraction: number;

  constructor(config: TRCFConfig = {}) {
    this.config = config;
    this.forestMode = config.forestMode || ForestMode.STANDARD;
    this.transformMethod = config.transformMethod || ThresholdedRandomCutForest.DEFAULT_TRANSFORM_METHOD;
    this.scoringStrategy = config.scoringStrategy || ScoringStrategy.EXPECTED_INVERSE_DEPTH;
    this.boundingBoxCacheFraction = config.boundingBoxCacheFraction ||
                                   ThresholdedRandomCutForest.DEFAULT_BOUNDING_BOX_CACHE_FRACTION;

    const shingleSize = config.shingleSize || ThresholdedRandomCutForest.DEFAULT_SHINGLE_SIZE;
    const dimensions = config.dimensions || shingleSize;
    const inputLength = this.forestMode === ForestMode.TIME_AUGMENTED ?
                       dimensions / shingleSize : dimensions / shingleSize;

    // Initialize preprocessor
    const preprocessorConfig: PreprocessorConfig = {
      shingleSize,
      dimensions: this.forestMode === ForestMode.TIME_AUGMENTED ? dimensions + shingleSize : dimensions,
      inputLength,
      transformMethod: this.transformMethod,
      forestMode: this.forestMode,
      imputationMethod: config.imputationMethod || ImputationMethod.RCF,
      startNormalization: config.startNormalization || Preprocessor.DEFAULT_START_NORMALIZATION,
      stopNormalization: config.stopNormalization,
      clipFactor: config.clipFactor,
      normalizeTime: this.forestMode === ForestMode.TIME_AUGMENTED,
      weightTime: this.forestMode === ForestMode.TIME_AUGMENTED ? 1.0 : 0
    };

    this.preprocessor = new Preprocessor(preprocessorConfig);

    // Initialize predictor corrector
    const timeDecay = config.timeDecay || ThresholdedRandomCutForest.DEFAULT_TIME_DECAY;
    const anomalyRate = config.anomalyRate || ThresholdedRandomCutForest.DEFAULT_ANOMALY_RATE;
    const autoAdjust = config.autoAdjust !== undefined ? config.autoAdjust : ThresholdedRandomCutForest.DEFAULT_AUTO_ADJUST;
    const zFactor = config.zFactor || ThresholdedRandomCutForest.DEFAULT_Z_FACTOR;

    this.predictorCorrector = new PredictorCorrector(
      timeDecay,
      anomalyRate,
      autoAdjust,
      inputLength,
      config.randomSeed || Date.now()
    );

    // Set zFactor on the thresholder
    this.predictorCorrector.getThresholder().setZFactor(zFactor);

    // Initialize with empty descriptor
    this.lastAnomalyDescriptor = new AnomalyDescriptor(new Array(inputLength).fill(0), 0);
  }

  /**
   * Process a single input point and return anomaly detection results
   */
  public process(inputPoint: number[], timestamp: number, missingValues?: number[]): AnomalyDescriptor {
    const description = new AnomalyDescriptor(inputPoint, timestamp);
    description.setScoringStrategy(this.scoringStrategy);

    const cacheDisabled = this.boundingBoxCacheFraction === 0;

    try {
      if (cacheDisabled) {
        this.boundingBoxCacheFraction = 1.0;
      }

      if (missingValues && missingValues.length > 0) {
        this.validateMissingValues(missingValues, inputPoint.length);
        description.missingValues = missingValues;
      }

      this.augment(description);
    } finally {
      if (cacheDisabled) {
        this.boundingBoxCacheFraction = 0;
      }
    }

    if (this.saveDescriptor(description)) {
      this.lastAnomalyDescriptor = description.copyOf();
    }

    return description;
  }

  /**
   * Process multiple input points sequentially
   */
  public processSequentially(
    data: number[][],
    timestamps?: number[],
    filter: (desc: AnomalyDescriptor) => boolean = (d) => d.anomalyGrade > 0
  ): AnomalyDescriptor[] {
    if (!data || data.length === 0) {
      return [];
    }

    // Generate timestamps if not provided
    let actualTimestamps: number[];
    if (timestamps) {
      this.validateTimestamps(timestamps, data.length);
      actualTimestamps = timestamps;
    } else {
      const startTime = this.preprocessor.getInternalTimeStamp();
      actualTimestamps = data.map((_, i) => startTime + i + 1);
    }

    const results: AnomalyDescriptor[] = [];
    const cacheDisabled = this.boundingBoxCacheFraction === 0;

    try {
      if (cacheDisabled) {
        this.boundingBoxCacheFraction = 1.0;
      }

      const inputLength = this.preprocessor.getInputLength();

      for (let i = 0; i < data.length; i++) {
        const point = data[i];
        const timestamp = actualTimestamps[i];

        if (!point) {
          throw new Error("Data point cannot be null");
        }
        if (point.length !== inputLength) {
          throw new Error(`Data point length ${point.length} does not match expected ${inputLength}`);
        }

        const description = new AnomalyDescriptor(point, timestamp);
        description.setScoringStrategy(this.scoringStrategy);

        // Check for missing values (NaN)
        const missingIndices = this.generateMissingIndicesArray(point);
        if (missingIndices) {
          description.missingValues = missingIndices;
        }

        this.augment(description);

        if (this.saveDescriptor(description)) {
          this.lastAnomalyDescriptor = description.copyOf();
        }

        if (filter(description)) {
          results.push(description);
        }
      }
    } finally {
      if (cacheDisabled) {
        this.boundingBoxCacheFraction = 0;
      }
    }

    return results;
  }

  private augment(description: AnomalyDescriptor): void {
    description.setScoringStrategy(this.scoringStrategy);

    // Process through preprocessor
    const preprocessed = this.preprocessor.process(
      description.inputData,
      description.timestamp,
      description.missingValues || undefined
    );

    // Calculate score using RCF (or mock in this case)
    let rcfScore = 0;
    let expectedPoint: number[] | null = null;
    let attribution: number[] | null = null;

    if (this.forest) {
      const rcfResult = this.forest.process(preprocessed.point);
      rcfScore = rcfResult.score;
      expectedPoint = rcfResult.expectedPoint || null;
      attribution = rcfResult.attribution || null;
    } else {
      // Simplified scoring for demonstration
      rcfScore = this.calculateSimplifiedScore(preprocessed.point);
      expectedPoint = this.calculateExpectedPoint(preprocessed.shingledInput);
    }

    // Calculate threshold
    const threshold = this.predictorCorrector.getThresholder().getThreshold(rcfScore);

    // Run detection
    this.predictorCorrector.detect(
      description,
      this.lastAnomalyDescriptor,
      rcfScore,
      threshold,
      expectedPoint,
      attribution
    );

    // Post-process
    this.postProcess(description);

    // Update total count
    this.totalUpdates++;
    description.totalUpdates = this.totalUpdates;
  }

  private calculateSimplifiedScore(point: Float64Array): number {
    // Simple anomaly score calculation based on deviation from mean
    // In production, this would be replaced by actual RCF scoring
    let sum = 0;
    for (let i = 0; i < point.length; i++) {
      sum += Math.abs(point[i]);
    }
    return sum / point.length;
  }

  private calculateExpectedPoint(shingledInput: number[]): number[] {
    // Simple expected point calculation
    // In production, this would use RCF's neighbor information
    const inputLength = this.preprocessor.getInputLength();
    const expected = new Array(inputLength);

    for (let i = 0; i < inputLength; i++) {
      // Use the average of the shingled values for that dimension
      let sum = 0;
      let count = 0;
      for (let j = i; j < shingledInput.length; j += inputLength) {
        sum += shingledInput[j];
        count++;
      }
      expected[i] = count > 0 ? sum / count : 0;
    }

    return expected;
  }

  private postProcess(description: AnomalyDescriptor): void {
    // Apply any post-processing logic
    // This could include:
    // - Smoothing anomaly scores
    // - Applying business rules
    // - Adjusting confidence levels

    // Ensure anomaly grade is within [0, 1]
    description.anomalyGrade = Math.max(0, Math.min(1, description.anomalyGrade));

    // Set confidence if not already set
    if (!description.confidence) {
      description.confidence = description.anomalyGrade;
    }
  }

  private saveDescriptor(descriptor: AnomalyDescriptor): boolean {
    return descriptor.anomalyGrade > 0;
  }

  private validateMissingValues(missingValues: number[], dataLength: number): void {
    for (const idx of missingValues) {
      if (idx < 0) {
        throw new Error("Missing value index cannot be negative");
      }
      if (idx >= dataLength) {
        throw new Error(`Missing value index ${idx} exceeds data length ${dataLength}`);
      }
    }
  }

  private validateTimestamps(timestamps: number[], dataLength: number): void {
    if (timestamps.length !== dataLength) {
      throw new Error(`Timestamps length ${timestamps.length} must equal data length ${dataLength}`);
    }

    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] <= timestamps[i - 1]) {
        throw new Error(`Timestamps must be strictly ascending at index ${i}`);
      }
    }
  }

  private generateMissingIndicesArray(point: number[]): number[] | null {
    const missing: number[] = [];
    for (let i = 0; i < point.length; i++) {
      if (isNaN(point[i])) {
        missing.push(i);
      }
    }
    return missing.length > 0 ? missing : null;
  }

  /**
   * Set a RandomCutForest implementation
   */
  public setForest(forest: RandomCutForest): void {
    this.forest = forest;
  }

  /**
   * Get the current preprocessor
   */
  public getPreprocessor(): Preprocessor {
    return this.preprocessor;
  }

  /**
   * Get the current predictor corrector
   */
  public getPredictorCorrector(): PredictorCorrector {
    return this.predictorCorrector;
  }

  /**
   * Get total number of updates processed
   */
  public getTotalUpdates(): number {
    return this.totalUpdates;
  }

  /**
   * Get the last anomaly descriptor
   */
  public getLastAnomalyDescriptor(): AnomalyDescriptor | null {
    return this.lastAnomalyDescriptor;
  }

  /**
   * Set the Z-factor for threshold calculation (Java API compatibility)
   */
  public setZFactor(value: number): void {
    this.predictorCorrector.getThresholder().setZFactor(value);
  }

  /**
   * Get the current Z-factor
   */
  public getZFactor(): number {
    return this.predictorCorrector.getThresholder().getZFactor();
  }
}