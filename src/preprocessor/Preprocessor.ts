import { ForestMode } from '../config/ForestMode';
import { TransformMethod } from '../config/TransformMethod';
import { ImputationMethod } from '../config/ImputationMethod';
import { Deviation } from '../utils/Deviation';

export interface PreprocessorConfig {
  shingleSize?: number;
  dimensions?: number;
  inputLength?: number;
  transformMethod?: TransformMethod;
  forestMode?: ForestMode;
  imputationMethod?: ImputationMethod;
  defaultFill?: number[];
  normalizeTime?: boolean;
  weightTime?: number;
  transformDecay?: number;
  startNormalization?: number;
  stopNormalization?: number;
  clipFactor?: number;
  useImputedFraction?: number;
  initialPoint?: number[];
  initialTimeStamps?: number[];
}

export class Preprocessor {
  public static readonly DEFAULT_SHINGLE_SIZE = 8;
  public static readonly DEFAULT_START_NORMALIZATION = 10;
  public static readonly DEFAULT_STOP_NORMALIZATION = Number.MAX_SAFE_INTEGER;
  public static readonly DEFAULT_CLIP_NORMALIZATION = 100;
  public static readonly DEFAULT_USE_IMPUTED_FRACTION = 0.5;
  public static readonly DEFAULT_NORMALIZATION_PRECISION = 1e-3;
  public static readonly NORMALIZATION_SCALING_FACTOR = 2.0;
  public static readonly MINIMUM_OBSERVATIONS_FOR_EXPECTED = 100;

  private shingleSize: number;
  private dimensions: number;
  private inputLength: number;
  private transformMethod: TransformMethod;
  private forestMode: ForestMode;
  private imputationMethod: ImputationMethod;
  private defaultFill: number[] | null;
  private normalizeTime: boolean;
  private weightTime: number;
  private transformDecay: number;
  private startNormalization: number;
  private stopNormalization: number;
  private clipFactor: number;
  private useImputedFraction: number;

  // State variables
  private internalTimeStamp: number = 0;
  private valuesSeen: number = 0;
  private numberOfImputed: number = 0;
  private lastShingledInput: number[] | null = null;
  private lastShingledPoint: Float32Array | null = null;
  private previousTimeStamps: number[] | null = null;
  private timeStampDeviations: Deviation[] | null = null;
  private dataQuality: Deviation[];
  private deviations: Deviation[][];
  private initialValues: number[][] | null = null;
  private initialTimeStamps: number[] | null = null;

  constructor(config: PreprocessorConfig = {}) {
    this.shingleSize = config.shingleSize || Preprocessor.DEFAULT_SHINGLE_SIZE;
    this.dimensions = config.dimensions || this.shingleSize;
    this.inputLength = config.inputLength || this.dimensions / this.shingleSize;
    this.transformMethod = config.transformMethod || TransformMethod.NONE;
    this.forestMode = config.forestMode || ForestMode.STANDARD;
    this.imputationMethod = config.imputationMethod || ImputationMethod.RCF;
    this.defaultFill = config.defaultFill || null;
    this.normalizeTime = config.normalizeTime || false;
    this.weightTime = config.weightTime || 0;
    this.transformDecay = config.transformDecay || 0.01;
    this.startNormalization = config.startNormalization || Preprocessor.DEFAULT_START_NORMALIZATION;
    this.stopNormalization = config.stopNormalization || Preprocessor.DEFAULT_STOP_NORMALIZATION;
    this.clipFactor = config.clipFactor || Preprocessor.DEFAULT_CLIP_NORMALIZATION;
    this.useImputedFraction = config.useImputedFraction || Preprocessor.DEFAULT_USE_IMPUTED_FRACTION;

    // Initialize state
    this.dataQuality = [new Deviation(0)];
    this.deviations = [];
    for (let i = 0; i < this.inputLength; i++) {
      this.deviations[i] = [];
      for (let j = 0; j < 2; j++) {
        this.deviations[i][j] = new Deviation(this.transformDecay);
      }
    }

    if (this.forestMode === ForestMode.TIME_AUGMENTED) {
      this.previousTimeStamps = new Array(this.shingleSize).fill(0);
      this.timeStampDeviations = [];
      for (let i = 0; i < this.shingleSize; i++) {
        this.timeStampDeviations[i] = new Deviation(this.transformDecay);
      }
    }

    if (config.initialPoint) {
      this.lastShingledInput = config.initialPoint;
      this.lastShingledPoint = new Float32Array(config.initialPoint);
    }

    if (config.initialTimeStamps) {
      this.initialTimeStamps = config.initialTimeStamps;
    }
  }

  public process(inputPoint: number[], timestamp?: number, missingValues?: number[]): {
    point: Float32Array;
    shingledInput: number[];
    imputedIndices: number[];
  } {
    const currentInput = this.handleMissingValues(inputPoint, missingValues);
    const shingledInput = this.shingle(currentInput);

    if (this.forestMode === ForestMode.TIME_AUGMENTED && timestamp !== undefined) {
      this.augmentWithTime(shingledInput, timestamp);
    }

    const transformedPoint = this.transform(shingledInput);
    this.updateStatistics(currentInput, shingledInput);

    this.internalTimeStamp++;
    this.valuesSeen++;
    this.lastShingledInput = shingledInput;
    this.lastShingledPoint = transformedPoint;

    return {
      point: transformedPoint,
      shingledInput: shingledInput,
      imputedIndices: missingValues || []
    };
  }

  private handleMissingValues(inputPoint: number[], missingValues?: number[]): number[] {
    if (!missingValues || missingValues.length === 0) {
      return inputPoint.slice();
    }

    const result = inputPoint.slice();
    for (const idx of missingValues) {
      if (idx >= 0 && idx < result.length) {
        result[idx] = this.impute(idx);
        this.numberOfImputed++;
      }
    }
    return result;
  }

  private impute(index: number): number {
    switch (this.imputationMethod) {
      case ImputationMethod.ZERO:
        return 0;
      case ImputationMethod.FIXED_VALUES:
        return this.defaultFill?.[index] || 0;
      case ImputationMethod.PREVIOUS:
        return this.lastShingledInput?.[index] || 0;
      case ImputationMethod.RCF:
        // In a full implementation, this would use RCF's expected value
        // For now, use previous value as fallback
        return this.lastShingledInput?.[index] || 0;
      default:
        return 0;
    }
  }

  private shingle(inputPoint: number[]): number[] {
    if (this.shingleSize === 1) {
      return inputPoint;
    }

    const result = new Array(this.dimensions);
    const offset = this.inputLength;

    // Shift previous values
    if (this.lastShingledInput) {
      for (let i = 0; i < this.dimensions - offset; i++) {
        result[i] = this.lastShingledInput[i + offset];
      }
    } else {
      // Initialize with zeros
      for (let i = 0; i < this.dimensions - offset; i++) {
        result[i] = 0;
      }
    }

    // Add new values
    for (let i = 0; i < offset; i++) {
      result[this.dimensions - offset + i] = inputPoint[i];
    }

    return result;
  }

  private augmentWithTime(shingledInput: number[], timestamp: number): void {
    if (!this.previousTimeStamps || !this.timeStampDeviations) return;

    const newTimeDiffs = new Array(this.shingleSize);
    newTimeDiffs[0] = timestamp - this.previousTimeStamps[this.shingleSize - 1];

    for (let i = 1; i < this.shingleSize; i++) {
      newTimeDiffs[i] = this.previousTimeStamps[i] - this.previousTimeStamps[i - 1];
    }

    // Update time stamp deviations
    for (let i = 0; i < this.shingleSize; i++) {
      this.timeStampDeviations[i].update(newTimeDiffs[i]);
    }

    // Augment shingled input with normalized time differences
    if (this.normalizeTime && this.valuesSeen >= this.startNormalization) {
      for (let i = 0; i < this.shingleSize; i++) {
        const mean = this.timeStampDeviations[i].getMean();
        const std = this.timeStampDeviations[i].getStandardDeviation();
        const normalized = std > 0 ? (newTimeDiffs[i] - mean) / std : 0;
        shingledInput.push(normalized * this.weightTime);
      }
    }

    // Update previous timestamps
    for (let i = 0; i < this.shingleSize - 1; i++) {
      this.previousTimeStamps[i] = this.previousTimeStamps[i + 1];
    }
    this.previousTimeStamps[this.shingleSize - 1] = timestamp;
  }

  private transform(shingledInput: number[]): Float32Array {
    const result = new Float32Array(shingledInput.length);

    if (this.transformMethod === TransformMethod.NONE ||
        this.valuesSeen < this.startNormalization ||
        this.valuesSeen >= this.stopNormalization) {
      for (let i = 0; i < shingledInput.length; i++) {
        result[i] = shingledInput[i];
      }
      return result;
    }

    // Apply transformation based on method
    switch (this.transformMethod) {
      case TransformMethod.NORMALIZE:
        return this.normalize(shingledInput);
      case TransformMethod.DIFFERENCE:
        return this.difference(shingledInput);
      case TransformMethod.NORMALIZE_DIFFERENCE:
        return this.normalizeDifference(shingledInput);
      default:
        for (let i = 0; i < shingledInput.length; i++) {
          result[i] = shingledInput[i];
        }
        return result;
    }
  }

  private normalize(shingledInput: number[]): Float32Array {
    const result = new Float32Array(shingledInput.length);

    for (let i = 0; i < this.inputLength; i++) {
      const mean = this.deviations[i][0].getMean();
      const std = this.deviations[i][0].getStandardDeviation();
      const denom = Math.max(Preprocessor.DEFAULT_NORMALIZATION_PRECISION, std);

      for (let j = 0; j < this.shingleSize; j++) {
        const idx = j * this.inputLength + i;
        const normalized = (shingledInput[idx] - mean) / denom;
        result[idx] = Math.max(-this.clipFactor, Math.min(this.clipFactor, normalized));
      }
    }

    return result;
  }

  private difference(shingledInput: number[]): Float32Array {
    const result = new Float32Array(shingledInput.length);

    for (let i = 0; i < this.inputLength; i++) {
      // First shingle position - no previous value to difference
      result[i] = 0;

      // Subsequent shingle positions
      for (let j = 1; j < this.shingleSize; j++) {
        const currentIdx = j * this.inputLength + i;
        const prevIdx = (j - 1) * this.inputLength + i;
        result[currentIdx] = shingledInput[currentIdx] - shingledInput[prevIdx];
      }
    }

    return result;
  }

  private normalizeDifference(shingledInput: number[]): Float32Array {
    const differenced = this.difference(shingledInput);
    return this.normalize(Array.from(differenced));
  }

  private updateStatistics(currentInput: number[], shingledInput: number[]): void {
    // Update data quality
    const missingRatio = this.numberOfImputed / currentInput.length;
    this.dataQuality[0].update(1 - missingRatio);

    // Update deviations for normalization
    for (let i = 0; i < this.inputLength; i++) {
      const value = currentInput[i];
      this.deviations[i][0].update(value);

      if (this.lastShingledInput) {
        const prevValue = this.lastShingledInput[this.dimensions - this.inputLength + i];
        const diff = value - prevValue;
        this.deviations[i][1].update(diff);
      }
    }
  }

  // Getters
  public getInternalTimeStamp(): number {
    return this.internalTimeStamp;
  }

  public getValuesSeen(): number {
    return this.valuesSeen;
  }

  public getInputLength(): number {
    return this.inputLength;
  }

  public getDimensions(): number {
    return this.dimensions;
  }

  public getShingleSize(): number {
    return this.shingleSize;
  }

  public getDataQuality(): Deviation[] {
    return this.dataQuality;
  }

  public getLastShingledInput(): number[] | null {
    return this.lastShingledInput;
  }

  public setValuesSeen(count: number): void {
    this.valuesSeen = count;
  }
}