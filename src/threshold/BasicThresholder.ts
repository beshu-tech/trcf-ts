/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

import { Deviation } from '../utils/Deviation';

export class BasicThresholder {
  public static readonly DEFAULT_SCORE_DIFFERENCING = 0.5;
  public static readonly DEFAULT_MINIMUM_SCORES = 10;
  public static readonly DEFAULT_FACTOR_ADJUSTMENT_THRESHOLD = 0.9;
  public static readonly DEFAULT_ABSOLUTE_THRESHOLD = 0.8;
  public static readonly DEFAULT_INITIAL_THRESHOLD = 1.5;
  public static readonly DEFAULT_Z_FACTOR = 2.5;  // Java default
  public static readonly MINIMUM_Z_FACTOR = 2.0;
  public static readonly DEFAULT_AUTO_THRESHOLD = true;
  public static readonly DEFAULT_DEVIATION_STATES = 3;

  public count: number = 0;
  public scoreDifferencing: number;
  public minimumScores: number;
  private primaryDeviation: Deviation;
  private secondaryDeviation: Deviation;
  private thresholdDeviation: Deviation;
  private autoThreshold: boolean;
  private absoluteThreshold: number;
  private factorAdjustmentThreshold: number;
  public initialThreshold: number;
  private zFactor: number;

  constructor(
    primaryDiscount: number,
    secondaryDiscount?: number,
    adjust: boolean = false
  ) {
    this.primaryDeviation = new Deviation(primaryDiscount);
    this.secondaryDeviation = new Deviation(secondaryDiscount || primaryDiscount);
    this.thresholdDeviation = new Deviation(primaryDiscount / 2);
    this.autoThreshold = adjust;

    this.scoreDifferencing = BasicThresholder.DEFAULT_SCORE_DIFFERENCING;
    this.minimumScores = BasicThresholder.DEFAULT_MINIMUM_SCORES;
    this.absoluteThreshold = BasicThresholder.DEFAULT_ABSOLUTE_THRESHOLD;
    this.factorAdjustmentThreshold = BasicThresholder.DEFAULT_FACTOR_ADJUSTMENT_THRESHOLD;
    this.initialThreshold = BasicThresholder.DEFAULT_INITIAL_THRESHOLD;
    this.zFactor = BasicThresholder.DEFAULT_Z_FACTOR;
  }

  public isDeviationReady(): boolean {
    if (this.count < this.minimumScores) {
      return false;
    }

    if (this.scoreDifferencing !== 0) {
      return this.secondaryDeviation.getCount() >= this.minimumScores;
    }
    return true;
  }

  public intermediateTermFraction(): number {
    if (this.count < this.minimumScores) {
      return 0;
    } else if (this.count >= 2 * this.minimumScores) {
      return 1;
    } else {
      return (this.count - this.minimumScores) / this.minimumScores;
    }
  }

  public update(score: number, secondaryScore?: number): void {
    this.count++;
    this.primaryDeviation.update(score);

    if (secondaryScore !== undefined) {
      this.secondaryDeviation.update(secondaryScore);
    } else if (this.scoreDifferencing > 0) {
      const diff = Math.max(0, score - this.getPrimaryMean());
      this.secondaryDeviation.update(diff);
    }

    if (this.autoThreshold) {
      this.thresholdDeviation.update(score);
    }
  }

  public updatePrimary(score: number): void {
    this.count++;
    this.primaryDeviation.update(score);

    if (this.autoThreshold) {
      this.thresholdDeviation.update(score);
    }
  }

  public setCount(count: number): void {
    this.count = count;
  }

  public setScoreDifferencing(value: number): void {
    if (value < 0 || value > 1 + 1e-10) {
      throw new Error('Score differencing must be between 0 and 1');
    }
    this.scoreDifferencing = value;
  }

  public setMinimumScores(value: number): void {
    this.minimumScores = value;
  }

  public setZFactor(value: number): void {
    this.zFactor = Math.max(value, BasicThresholder.MINIMUM_Z_FACTOR);
  }

  public getZFactor(): number {
    return this.zFactor;
  }

  public getPrimaryMean(): number {
    return this.primaryDeviation.getMean();
  }

  public getPrimaryStandardDeviation(): number {
    return this.primaryDeviation.getStandardDeviation();
  }

  public getSecondaryMean(): number {
    return this.secondaryDeviation.getMean();
  }

  public getSecondaryStandardDeviation(): number {
    return this.secondaryDeviation.getStandardDeviation();
  }

  public getThreshold(score: number): number {
    if (!this.isDeviationReady()) {
      return this.initialThreshold;
    }

    const fraction = this.intermediateTermFraction();
    const primaryThreshold = this.getPrimaryMean() +
                           this.zFactor * this.getPrimaryStandardDeviation();

    if (this.scoreDifferencing > 0 && fraction > 0) {
      const secondaryThreshold = this.getSecondaryMean() +
                                this.zFactor * this.getSecondaryStandardDeviation();
      const combined = (1 - this.scoreDifferencing) * primaryThreshold +
                      this.scoreDifferencing * secondaryThreshold;
      return Math.max(this.absoluteThreshold, combined * fraction +
                     this.initialThreshold * (1 - fraction));
    }

    return Math.max(this.absoluteThreshold, primaryThreshold * fraction +
                   this.initialThreshold * (1 - fraction));
  }

  public getAnomalyGrade(score: number): number {
    const threshold = this.getThreshold(score);
    if (score <= threshold) {
      return 0;
    }

    const stdDev = this.isDeviationReady() ?
                  this.getPrimaryStandardDeviation() : 1;
    return Math.min(1, (score - threshold) / (stdDev + 1e-10));
  }

  public getPrimaryGrade(score: number): number {
    return this.getAnomalyGrade(score);
  }

  public getPrimaryThreshold(): number {
    return this.getPrimaryMean() + this.zFactor * this.getPrimaryStandardDeviation();
  }

  public getPrimaryThresholdAndGrade(score: number): { weight: number; index: number } {
    const threshold = this.getPrimaryThreshold();
    const grade = score > threshold ? 1.0 : 0.0;
    return { weight: grade, index: threshold };
  }

  public getThresholdAndGrade(score: number, transformMethod: any, inputLength: number, outputLength: number): { weight: number; index: number } {
    const threshold = this.getThreshold(score);
    const grade = this.getAnomalyGrade(score);
    return { weight: grade, index: threshold };
  }

  public getSurpriseIndex(score: number, primary: number, factor: number, secondary: number): number {
    return factor;
  }

  public longTermDeviation(transformMethod: any, inputLength: number): number {
    if (transformMethod === 'NONE' && inputLength === 1) {
      return 0;
    }
    return this.getPrimaryStandardDeviation();
  }

  public threshold(): number {
    return this.getThreshold(0);
  }

  public setInitialThreshold(value: number): void {
    this.initialThreshold = value;
  }

  public setAbsoluteThreshold(value: number): void {
    this.absoluteThreshold = value;
  }

  public getDeviations(): Deviation[] {
    return [this.primaryDeviation, this.secondaryDeviation, this.thresholdDeviation];
  }

  public getPrimaryDeviation(): Deviation {
    return this.primaryDeviation;
  }

  public getSecondaryDeviation(): Deviation {
    return this.secondaryDeviation;
  }

  public getThresholdDeviation(): Deviation {
    return this.thresholdDeviation;
  }

  public getCount(): number {
    return this.count;
  }
}