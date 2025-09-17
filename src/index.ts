/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

// ====== SIMPLE API (Recommended for most users) ======

// Easy-to-use anomaly detector
export {
  AnomalyDetector,
  AnomalyDetectorConfig,
  AnomalyResult,
  createTimeSeriesDetector,
  createMultiVariateDetector
} from './AnomalyDetector';

// ====== ADVANCED API (For fine-grained control) ======

// Core classes
export { ThresholdedRandomCutForest, TRCFConfig, RandomCutForest } from './core/ThresholdedRandomCutForest';
export { PredictorCorrector } from './core/PredictorCorrector';

// RCF Implementation
export { OptimizedRCF, RCFConfig } from './rcf/OptimizedRCF';

// Preprocessor
export { Preprocessor, PreprocessorConfig } from './preprocessor/Preprocessor';

// Threshold
export { BasicThresholder } from './threshold/BasicThresholder';

// Configuration enums
export { ForestMode } from './config/ForestMode';
export { TransformMethod } from './config/TransformMethod';
export { ImputationMethod } from './config/ImputationMethod';
export { ScoringStrategy } from './config/ScoringStrategy';
export { CorrectionMode } from './config/CorrectionMode';

// Types
export { AnomalyDescriptor } from './types/AnomalyDescriptor';

// Serialization
export { StateSerializer, TRCFState, SerializedState } from './serialization/StateSerializer';

// Utils
export { Deviation } from './utils/Deviation';