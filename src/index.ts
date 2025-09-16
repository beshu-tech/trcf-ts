/**
 * TRCF TypeScript - High-performance anomaly detection for streaming data
 *
 * Copyright 2024 Beshu Limited and Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
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

// RCF Implementations
export { SimplifiedRCF, RCFConfig } from './rcf/SimplifiedRCF';
export { OptimizedRCF } from './rcf/OptimizedRCF';

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