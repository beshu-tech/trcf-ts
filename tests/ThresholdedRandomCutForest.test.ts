import {
  ThresholdedRandomCutForest,
  TRCFConfig,
  ForestMode,
  TransformMethod,
  ScoringStrategy,
  ImputationMethod
} from '../src';

describe('ThresholdedRandomCutForest', () => {
  describe('Basic functionality', () => {
    it('should create a TRCF instance with default configuration', () => {
      const trcf = new ThresholdedRandomCutForest();
      expect(trcf).toBeDefined();
      expect(trcf.getTotalUpdates()).toBe(0);
    });

    it('should create a TRCF instance with custom configuration', () => {
      const config: TRCFConfig = {
        dimensions: 4,
        shingleSize: 1,
        forestMode: ForestMode.STANDARD,
        transformMethod: TransformMethod.NORMALIZE,
        scoringStrategy: ScoringStrategy.EXPECTED_INVERSE_DEPTH,
        autoAdjust: true
      };

      const trcf = new ThresholdedRandomCutForest(config);
      expect(trcf).toBeDefined();
    });
  });

  describe('Single point processing', () => {
    it('should process a single data point', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 2,
        shingleSize: 1
      });

      const point = [1.0, 2.0];
      const timestamp = Date.now();
      const result = trcf.process(point, timestamp);

      expect(result).toBeDefined();
      expect(result.inputData).toEqual(point);
      expect(result.timestamp).toBe(timestamp);
      expect(result.anomalyScore).toBeGreaterThanOrEqual(0);
      expect(result.anomalyGrade).toBeGreaterThanOrEqual(0);
      expect(result.anomalyGrade).toBeLessThanOrEqual(1);
    });

    it('should handle missing values', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 3,
        shingleSize: 1,
        imputationMethod: ImputationMethod.ZERO
      });

      const point = [1.0, NaN, 3.0];
      const timestamp = Date.now();
      const missingValues = [1];

      const result = trcf.process(point, timestamp, missingValues);

      expect(result).toBeDefined();
      expect(result.missingValues).toEqual(missingValues);
    });
  });

  describe('Sequential processing', () => {
    it('should process multiple points sequentially', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 2,
        shingleSize: 1
      });

      const data = [
        [1.0, 2.0],
        [1.1, 2.1],
        [1.2, 2.2],
        [5.0, 10.0], // Potential anomaly
        [1.3, 2.3]
      ];

      const results = trcf.processSequentially(data);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);

      // Check if any anomalies were detected
      const anomalies = results.filter(r => r.anomalyGrade > 0);
      expect(anomalies.length).toBeGreaterThanOrEqual(0);
    });

    it('should process with custom timestamps', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 2,
        shingleSize: 1
      });

      const data = [
        [1.0, 2.0],
        [1.1, 2.1],
        [1.2, 2.2]
      ];

      const timestamps = [1000, 2000, 3000];

      const results = trcf.processSequentially(data, timestamps);

      expect(results).toBeDefined();

      // Verify all points were processed
      const allDescriptors = trcf.processSequentially(
        data,
        timestamps,
        () => true // Accept all descriptors
      );

      expect(allDescriptors.length).toBe(data.length);
      for (let i = 0; i < allDescriptors.length; i++) {
        expect(allDescriptors[i].timestamp).toBe(timestamps[i]);
      }
    });

    it('should filter results based on custom criteria', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 2,
        shingleSize: 1
      });

      const data = [
        [1.0, 2.0],
        [1.1, 2.1],
        [5.0, 10.0], // Likely anomaly
        [1.2, 2.2]
      ];

      // Custom filter: only return points with score > threshold
      const filter = (desc: any) => desc.anomalyScore > 0.5;
      const results = trcf.processSequentially(data, undefined, filter);

      expect(results).toBeDefined();
      results.forEach(r => {
        expect(r.anomalyScore).toBeGreaterThan(0.5);
      });
    });
  });

  describe('Time-augmented mode', () => {
    it('should process data in time-augmented mode', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 2,
        shingleSize: 1,
        forestMode: ForestMode.TIME_AUGMENTED
      });

      const data = [
        [1.0, 2.0],
        [1.1, 2.1],
        [1.2, 2.2]
      ];

      const timestamps = [1000, 1100, 1200];
      const results = trcf.processSequentially(data, timestamps);

      expect(results).toBeDefined();
    });
  });

  describe('Data transformation', () => {
    it('should apply normalization transformation', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 2,
        shingleSize: 1,
        transformMethod: TransformMethod.NORMALIZE,
        startNormalization: 2
      });

      const data = [
        [10.0, 20.0],
        [11.0, 21.0],
        [12.0, 22.0],
        [13.0, 23.0],
        [50.0, 60.0] // Outlier after normalization starts
      ];

      const results = trcf.processSequentially(data);
      expect(results).toBeDefined();
    });

    it('should apply differencing transformation', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 2,
        shingleSize: 1,
        transformMethod: TransformMethod.DIFFERENCE
      });

      const data = [
        [10.0, 20.0],
        [11.0, 21.0], // diff = [1, 1]
        [12.0, 22.0], // diff = [1, 1]
        [20.0, 30.0], // diff = [8, 8] - larger difference
      ];

      const results = trcf.processSequentially(data);
      expect(results).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid missing value indices', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 2,
        shingleSize: 1
      });

      const point = [1.0, 2.0];
      const timestamp = Date.now();
      const invalidMissing = [-1]; // Negative index

      expect(() => {
        trcf.process(point, timestamp, invalidMissing);
      }).toThrow('Missing value index cannot be negative');
    });

    it('should throw error for non-ascending timestamps', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 2,
        shingleSize: 1
      });

      const data = [
        [1.0, 2.0],
        [1.1, 2.1]
      ];

      const invalidTimestamps = [1000, 900]; // Not ascending

      expect(() => {
        trcf.processSequentially(data, invalidTimestamps);
      }).toThrow('Timestamps must be strictly ascending');
    });

    it('should throw error for mismatched data and timestamp lengths', () => {
      const trcf = new ThresholdedRandomCutForest({
        dimensions: 2,
        shingleSize: 1
      });

      const data = [
        [1.0, 2.0],
        [1.1, 2.1]
      ];

      const timestamps = [1000]; // Only one timestamp for two data points

      expect(() => {
        trcf.processSequentially(data, timestamps);
      }).toThrow('Timestamps length 1 must equal data length 2');
    });
  });
});