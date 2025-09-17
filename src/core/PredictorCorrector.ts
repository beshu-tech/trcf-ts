/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

import { BasicThresholder } from '../threshold/BasicThresholder';
import { Deviation } from '../utils/Deviation';
import { AnomalyDescriptor } from '../types/AnomalyDescriptor';
import { ScoringStrategy } from '../config/ScoringStrategy';

export class PredictorCorrector {
  private static readonly DEFAULT_DIFFERENTIAL_FACTOR = 0.3;
  private static readonly DEFAULT_NUMBER_OF_MAX_ATTRIBUTORS = 5;
  private static readonly DEFAULT_NOISE_SUPPRESSION_FACTOR = 1.0;
  private static readonly DEFAULT_MULTI_MODE_SAMPLING_RATE = 0.1;
  private static readonly DEFAULT_SAMPLING_SUPPORT = 0.1;
  private static readonly DEFAULT_RUN_ALLOWED = 2;
  private static readonly NUMBER_OF_MODES = 2;
  private static readonly EXPECTED_INVERSE_DEPTH_INDEX = 0;
  private static readonly DISTANCE_INDEX = 1;

  private thresholders: BasicThresholder[];
  private baseDimension: number;
  private randomSeed: number;
  private lastScore: number[];
  private lastStrategy: ScoringStrategy;
  private ignoreNearExpectedFromBelow: number[];
  private ignoreNearExpectedFromAbove: number[];
  private ignoreNearExpectedFromBelowByRatio: number[];
  private ignoreNearExpectedFromAboveByRatio: number[];
  private numberOfAttributors: number;
  private deviationsActual: Deviation[] | null = null;
  private deviationsExpected: Deviation[] | null = null;
  private samplingRate: number;
  private noiseFactor: number;
  private autoAdjust: boolean;
  private runLength: number = 0;
  private ignoreDrift: boolean = false;
  private samplingSupport: number;

  constructor(
    timeDecay: number,
    anomalyRate: number,
    adjust: boolean,
    baseDimension: number,
    randomSeed: number = Date.now()
  ) {
    this.thresholders = new Array(PredictorCorrector.NUMBER_OF_MODES);
    this.thresholders[0] = new BasicThresholder(timeDecay, timeDecay, adjust);
    this.thresholders[1] = new BasicThresholder(timeDecay);

    this.baseDimension = baseDimension;
    this.randomSeed = randomSeed;
    this.autoAdjust = adjust;
    this.lastScore = new Array(PredictorCorrector.NUMBER_OF_MODES).fill(0);
    this.lastStrategy = ScoringStrategy.EXPECTED_INVERSE_DEPTH;

    this.numberOfAttributors = PredictorCorrector.DEFAULT_NUMBER_OF_MAX_ATTRIBUTORS;
    this.samplingRate = PredictorCorrector.DEFAULT_MULTI_MODE_SAMPLING_RATE;
    this.noiseFactor = PredictorCorrector.DEFAULT_NOISE_SUPPRESSION_FACTOR;
    this.samplingSupport = PredictorCorrector.DEFAULT_SAMPLING_SUPPORT;

    if (adjust) {
      this.deviationsActual = new Array(baseDimension);
      this.deviationsExpected = new Array(baseDimension);
      for (let i = 0; i < baseDimension; i++) {
        this.deviationsActual[i] = new Deviation(timeDecay);
        this.deviationsExpected[i] = new Deviation(timeDecay);
      }
    }

    this.ignoreNearExpectedFromAbove = new Array(baseDimension).fill(0);
    this.ignoreNearExpectedFromBelow = new Array(baseDimension).fill(0);
    this.ignoreNearExpectedFromAboveByRatio = new Array(baseDimension).fill(0);
    this.ignoreNearExpectedFromBelowByRatio = new Array(baseDimension).fill(0);
  }

  public detect(
    description: AnomalyDescriptor,
    lastDescriptor: AnomalyDescriptor | null,
    rcfScore: number,
    threshold: number,
    expectedPoint: number[] | null = null,
    attribution: number[] | null = null
  ): void {
    // Store the raw RCF score
    description.anomalyScore = rcfScore;
    description.threshold = threshold;

    // Determine scoring strategy index
    const strategyIndex = description.scoringStrategy === ScoringStrategy.DISTANCE ?
                         PredictorCorrector.DISTANCE_INDEX :
                         PredictorCorrector.EXPECTED_INVERSE_DEPTH_INDEX;

    // Update thresholder with current score
    this.thresholders[strategyIndex].update(rcfScore);
    this.lastScore[strategyIndex] = rcfScore;

    // Calculate anomaly grade based on threshold
    const grade = this.thresholders[strategyIndex].getAnomalyGrade(rcfScore);
    description.anomalyGrade = grade;

    // Set expected point and attribution if provided
    if (expectedPoint) {
      description.expectedRCFPoint = expectedPoint;
    }
    if (attribution) {
      description.attribution = attribution;
    }

    // Apply correction if needed
    if (this.autoAdjust && grade > 0) {
      this.applyCorrection(description, lastDescriptor);
    }

    // Update run length for consecutive anomalies
    if (grade > 0) {
      this.runLength++;
    } else {
      this.runLength = 0;
    }

    // Calculate confidence based on deviation readiness
    if (this.thresholders[strategyIndex].isDeviationReady()) {
      const mean = this.thresholders[strategyIndex].getPrimaryMean();
      const std = this.thresholders[strategyIndex].getPrimaryStandardDeviation();
      if (std > 0) {
        description.confidence = Math.min(1, Math.abs(rcfScore - mean) / std);
      }
    }
  }

  private applyCorrection(
    description: AnomalyDescriptor,
    lastDescriptor: AnomalyDescriptor | null
  ): void {
    if (!this.deviationsActual || !this.deviationsExpected) return;

    const inputData = description.inputData;
    const expectedPoint = description.expectedRCFPoint;

    if (!expectedPoint) return;

    // Update deviations with actual and expected values
    for (let i = 0; i < Math.min(inputData.length, this.baseDimension); i++) {
      this.deviationsActual[i].update(inputData[i]);
      this.deviationsExpected[i].update(expectedPoint[i]);
    }

    // Apply noise suppression if within expected ranges
    let shouldSuppress = true;
    for (let i = 0; i < Math.min(inputData.length, this.baseDimension); i++) {
      const actual = inputData[i];
      const expected = expectedPoint[i];
      const diff = actual - expected;
      const ratio = expected !== 0 ? actual / expected : 1;

      // Check absolute differences
      if (diff > this.ignoreNearExpectedFromAbove[i] ||
          diff < -this.ignoreNearExpectedFromBelow[i]) {
        shouldSuppress = false;
        break;
      }

      // Check ratio differences
      if (ratio > 1 + this.ignoreNearExpectedFromAboveByRatio[i] ||
          ratio < 1 - this.ignoreNearExpectedFromBelowByRatio[i]) {
        shouldSuppress = false;
        break;
      }
    }

    if (shouldSuppress && this.runLength < PredictorCorrector.DEFAULT_RUN_ALLOWED) {
      // Suppress the anomaly by reducing the grade
      description.anomalyGrade *= this.noiseFactor;
    }

    // Apply drift correction if enabled
    if (!this.ignoreDrift && lastDescriptor) {
      const driftFactor = this.calculateDriftFactor(description, lastDescriptor);
      description.anomalyGrade *= driftFactor;
    }
  }

  private calculateDriftFactor(
    current: AnomalyDescriptor,
    previous: AnomalyDescriptor
  ): number {
    if (!current.expectedRCFPoint || !previous.expectedRCFPoint) {
      return 1.0;
    }

    let totalDrift = 0;
    let count = 0;

    for (let i = 0; i < Math.min(
      current.expectedRCFPoint.length,
      previous.expectedRCFPoint.length,
      this.baseDimension
    ); i++) {
      const currentExpected = current.expectedRCFPoint[i];
      const previousExpected = previous.expectedRCFPoint[i];

      if (previousExpected !== 0) {
        const drift = Math.abs(currentExpected - previousExpected) / Math.abs(previousExpected);
        totalDrift += drift;
        count++;
      }
    }

    if (count === 0) return 1.0;

    const avgDrift = totalDrift / count;
    // Reduce anomaly grade if drift is significant
    return avgDrift > 0.1 ? Math.max(0.5, 1 - avgDrift) : 1.0;
  }

  public getThresholder(index: number = 0): BasicThresholder {
    return this.thresholders[Math.min(index, this.thresholders.length - 1)];
  }

  public getLastScore(strategy: ScoringStrategy = ScoringStrategy.EXPECTED_INVERSE_DEPTH): number {
    const index = strategy === ScoringStrategy.DISTANCE ?
                 PredictorCorrector.DISTANCE_INDEX :
                 PredictorCorrector.EXPECTED_INVERSE_DEPTH_INDEX;
    return this.lastScore[index];
  }

  public setIgnoreNearExpected(
    dimension: number,
    fromBelow: number,
    fromAbove: number,
    fromBelowByRatio: number = 0,
    fromAboveByRatio: number = 0
  ): void {
    if (dimension >= 0 && dimension < this.baseDimension) {
      this.ignoreNearExpectedFromBelow[dimension] = fromBelow;
      this.ignoreNearExpectedFromAbove[dimension] = fromAbove;
      this.ignoreNearExpectedFromBelowByRatio[dimension] = fromBelowByRatio;
      this.ignoreNearExpectedFromAboveByRatio[dimension] = fromAboveByRatio;
    }
  }

  public setNoiseFactor(factor: number): void {
    this.noiseFactor = Math.max(0, Math.min(1, factor));
  }

  public setIgnoreDrift(ignore: boolean): void {
    this.ignoreDrift = ignore;
  }

  public getRunLength(): number {
    return this.runLength;
  }
}