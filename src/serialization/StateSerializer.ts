/**
 * Efficient state serialization for TRCF
 * Optimized for Kibana alerting use case
 */

import * as zlib from 'zlib';

export interface SerializedState {
  version: string;
  timestamp: number;
  compressed: boolean;
  data: string | Buffer;
}

export interface TRCFState {
  // Core configuration
  config: {
    dimensions: number;
    shingleSize: number;
    numberOfTrees: number;
    sampleSize: number;
    forestMode: string;
    transformMethod: string;
  };

  // Forest state
  forest: {
    totalUpdates: number;
    trees: CompactTreeState[];
  };

  // Threshold state
  threshold: {
    anomalyRate: number;
    currentThreshold: number;
    recentScores: number[];  // Keep last N scores for threshold
    deviationStats: {
      mean: number;
      stdDev: number;
      count: number;
    };
  };

  // Preprocessor state (for normalization)
  preprocessor?: {
    mean: number[];
    stdDev: number[];
    count: number;
  };

  // Shingling state
  shingle?: {
    buffer: number[][];
    currentIndex: number;
  };
}

interface CompactTreeState {
  // Store only essential data for reconstruction
  samples: Float32Array[];  // Current samples in tree
  counts: Uint32Array;      // Sample counts for reservoir sampling
  treeSize: number;
}

export class StateSerializer {
  private static readonly VERSION = '1.0.0';

  /**
   * Serialize TRCF state to compact binary format
   */
  static serialize(state: TRCFState, compress: boolean = true): SerializedState {
    // Convert to compact representation
    const compactState = this.toCompactFormat(state);

    // Serialize to JSON (can be optimized to binary later)
    const jsonStr = JSON.stringify(compactState);
    const buffer = Buffer.from(jsonStr);

    // Optionally compress
    const data = compress ? zlib.gzipSync(buffer) : buffer;

    return {
      version: this.VERSION,
      timestamp: Date.now(),
      compressed: compress,
      data
    };
  }

  /**
   * Deserialize state back to TRCF
   */
  static deserialize(serialized: SerializedState): TRCFState {
    let buffer: Buffer;

    if (serialized.compressed) {
      buffer = zlib.gunzipSync(serialized.data as Buffer);
    } else {
      buffer = serialized.data as Buffer;
    }

    const jsonStr = buffer.toString();
    const compactState = JSON.parse(jsonStr);

    return this.fromCompactFormat(compactState);
  }

  /**
   * Convert to compact format for serialization
   */
  private static toCompactFormat(state: TRCFState): any {
    return {
      v: this.VERSION,
      c: { // config
        d: state.config.dimensions,
        s: state.config.shingleSize,
        t: state.config.numberOfTrees,
        sz: state.config.sampleSize,
        fm: state.config.forestMode,
        tm: state.config.transformMethod
      },
      f: { // forest
        u: state.forest.totalUpdates,
        t: state.forest.trees.map(tree => ({
          s: Array.from(tree.samples.map(s => Array.from(s))), // Convert typed arrays
          c: Array.from(tree.counts),
          sz: tree.treeSize
        }))
      },
      th: { // threshold
        ar: state.threshold.anomalyRate,
        ct: state.threshold.currentThreshold,
        rs: state.threshold.recentScores.slice(-100), // Keep last 100 scores
        ds: state.threshold.deviationStats
      },
      p: state.preprocessor ? { // preprocessor
        m: state.preprocessor.mean,
        s: state.preprocessor.stdDev,
        c: state.preprocessor.count
      } : null,
      sh: state.shingle ? { // shingle
        b: state.shingle.buffer,
        i: state.shingle.currentIndex
      } : null
    };
  }

  /**
   * Convert from compact format
   */
  private static fromCompactFormat(compact: any): TRCFState {
    return {
      config: {
        dimensions: compact.c.d,
        shingleSize: compact.c.s,
        numberOfTrees: compact.c.t,
        sampleSize: compact.c.sz,
        forestMode: compact.c.fm,
        transformMethod: compact.c.tm
      },
      forest: {
        totalUpdates: compact.f.u,
        trees: compact.f.t.map((tree: any) => ({
          samples: tree.s.map((s: number[]) => new Float32Array(s)),
          counts: new Uint32Array(tree.c),
          treeSize: tree.sz
        }))
      },
      threshold: {
        anomalyRate: compact.th.ar,
        currentThreshold: compact.th.ct,
        recentScores: compact.th.rs,
        deviationStats: compact.th.ds
      },
      preprocessor: compact.p ? {
        mean: compact.p.m,
        stdDev: compact.p.s,
        count: compact.p.c
      } : undefined,
      shingle: compact.sh ? {
        buffer: compact.sh.b,
        currentIndex: compact.sh.i
      } : undefined
    };
  }

  /**
   * Calculate serialized state size
   */
  static estimateSize(state: TRCFState): {
    raw: number;
    compressed: number;
    compressionRatio: number;
  } {
    const serialized = this.serialize(state, false);
    const compressed = this.serialize(state, true);

    const rawSize = (serialized.data as Buffer).length;
    const compressedSize = (compressed.data as Buffer).length;

    return {
      raw: rawSize,
      compressed: compressedSize,
      compressionRatio: 1 - (compressedSize / rawSize)
    };
  }

  /**
   * Create a checkpoint for fast recovery
   */
  static checkpoint(state: TRCFState): Buffer {
    // Use maximum compression for checkpoints
    const compressed = zlib.gzipSync(
      Buffer.from(JSON.stringify(this.toCompactFormat(state))),
      { level: 9 } // Maximum compression
    );

    // Add header with version and checksum
    const header = Buffer.alloc(16);
    header.writeUInt32LE(0x54524346, 0); // Magic number 'TRCF'
    header.writeUInt32LE(1, 4); // Version
    header.writeUInt32LE(compressed.length, 8); // Size
    header.writeUInt32LE(this.calculateChecksum(compressed), 12); // Checksum

    return Buffer.concat([header, compressed]);
  }

  /**
   * Restore from checkpoint
   */
  static restoreCheckpoint(checkpoint: Buffer): TRCFState {
    // Verify header
    const magic = checkpoint.readUInt32LE(0);
    if (magic !== 0x54524346) {
      throw new Error('Invalid checkpoint format');
    }

    const version = checkpoint.readUInt32LE(4);
    const size = checkpoint.readUInt32LE(8);
    const checksum = checkpoint.readUInt32LE(12);

    // Extract compressed data
    const compressed = checkpoint.slice(16, 16 + size);

    // Verify checksum
    if (this.calculateChecksum(compressed) !== checksum) {
      throw new Error('Checkpoint corrupted');
    }

    // Decompress and parse
    const decompressed = zlib.gunzipSync(compressed);
    const compact = JSON.parse(decompressed.toString());

    return this.fromCompactFormat(compact);
  }

  /**
   * Simple checksum for data integrity
   */
  private static calculateChecksum(buffer: Buffer): number {
    let checksum = 0;
    for (let i = 0; i < buffer.length; i++) {
      checksum = (checksum + buffer[i]) & 0xFFFFFFFF;
    }
    return checksum;
  }
}

/**
 * Streaming state manager for continuous operation
 */
export class StreamingStateManager {
  private checkpointInterval: number = 60000; // 1 minute default
  private lastCheckpoint: number = 0;
  private stateBuffer: TRCFState[] = [];
  private maxBufferSize: number = 10;

  constructor(
    checkpointInterval: number = 60000,
    maxBufferSize: number = 10
  ) {
    this.checkpointInterval = checkpointInterval;
    this.maxBufferSize = maxBufferSize;
  }

  /**
   * Check if checkpoint is needed
   */
  shouldCheckpoint(): boolean {
    return Date.now() - this.lastCheckpoint > this.checkpointInterval;
  }

  /**
   * Save checkpoint
   */
  saveCheckpoint(state: TRCFState): Buffer {
    this.lastCheckpoint = Date.now();

    // Add to buffer for rollback capability
    this.stateBuffer.push(state);
    if (this.stateBuffer.length > this.maxBufferSize) {
      this.stateBuffer.shift();
    }

    return StateSerializer.checkpoint(state);
  }

  /**
   * Get recent checkpoints for recovery
   */
  getRecentCheckpoints(): TRCFState[] {
    return [...this.stateBuffer];
  }

  /**
   * Clear checkpoint buffer
   */
  clearBuffer(): void {
    this.stateBuffer = [];
  }
}