/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

import { RandomCutForest } from '../core/ThresholdedRandomCutForest';
import { JavaRandom } from '../utils/JavaRandom';

export interface RCFConfig {
  dimensions: number;
  shingleSize: number;
  numberOfTrees: number;
  sampleSize: number;
  timeDecay: number;
  randomSeed?: number;
}

interface TreeNode {
  point: Float64Array;
  count: number;
  depth: number;
}

class OptimizedTree {
  private readonly dimensions: number;
  private readonly maxSize: number;
  private nodes: TreeNode[];
  private size: number = 0;
  private random: JavaRandom;

  constructor(dimensions: number, sampleSize: number, randomSeed: number) {
    this.dimensions = dimensions;
    this.maxSize = sampleSize;
    this.nodes = [];
    this.random = new JavaRandom(randomSeed);
  }

  add(point: Float64Array): void {
    const node: TreeNode = {
      point: point,
      count: 1,
      depth: this.calculateDepth(point)
    };

    if (this.size < this.maxSize) {
      this.nodes.push(node);
      this.size++;
    } else {
      // Reservoir sampling
      const index = Math.floor(this.random.nextDouble() * this.size);
      if (index < this.maxSize) {
        this.nodes[index] = node;
      }
    }
  }

  private calculateDepth(point: Float64Array): number {
    if (this.nodes.length === 0) return 0;

    // Simplified depth calculation
    let depth = 0;
    const maxDepth = Math.min(10, this.nodes.length);

    for (let i = 0; i < maxDepth; i++) {
      const randomNode = this.nodes[Math.floor(this.random.nextDouble() * this.nodes.length)];
      const distance = this.euclideanDistanceSquared(point, randomNode.point);

      if (distance > this.random.nextDouble()) {
        depth++;
      }
    }

    return depth;
  }

  private euclideanDistanceSquared(a: Float64Array, b: Float64Array): number {
    let sum = 0;
    for (let i = 0; i < this.dimensions; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return sum;
  }

  getAnomalyScore(point: Float64Array): number {
    if (this.nodes.length === 0) return 0;

    let totalScore = 0;
    const samples = Math.min(10, this.nodes.length);

    for (let i = 0; i < samples; i++) {
      const node = this.nodes[Math.floor(this.random.nextDouble() * this.nodes.length)];
      const distance = Math.sqrt(this.euclideanDistanceSquared(point, node.point));
      totalScore += 1 / (1 + distance);
    }

    // Return normalized score between 0 and 1
    return 1 - (totalScore / samples);
  }
}

export class OptimizedRCF implements RandomCutForest {
  private readonly dimensions: number;
  private readonly numberOfTrees: number;
  private readonly sampleSize: number;
  private readonly trees: OptimizedTree[];
  private updateCount: number = 0;
  private random: JavaRandom;

  // Pre-allocated buffers for performance
  private tempBuffer: Float64Array;
  private scoreBuffer: Float64Array;

  constructor(config: RCFConfig) {
    this.dimensions = config.dimensions;
    this.numberOfTrees = config.numberOfTrees;
    this.sampleSize = config.sampleSize;

    // Initialize trees with different seeds for each tree
    const baseSeed = config.randomSeed || Date.now();
    this.random = new JavaRandom(baseSeed);
    this.trees = [];
    for (let i = 0; i < this.numberOfTrees; i++) {
      // Each tree gets a different seed derived from base seed
      const treeSeed = baseSeed + i * 1000;
      this.trees.push(new OptimizedTree(this.dimensions, this.sampleSize, treeSeed));
    }

    // Pre-allocate buffers
    this.tempBuffer = new Float64Array(this.dimensions);
    this.scoreBuffer = new Float64Array(this.numberOfTrees);
  }

  process(point: Float64Array): {
    score: number;
    expectedPoint?: number[];
    attribution?: number[];
  } {
    const score = this.getAnomalyScore(point);
    this.update(point);
    return { score };
  }

  update(point: Float64Array): void {
    // Update each tree
    for (let i = 0; i < this.numberOfTrees; i++) {
      this.trees[i].add(point);
    }
    this.updateCount++;
  }

  getAnomalyScore(point: Float64Array): number {
    if (this.updateCount < this.sampleSize * 0.1) {
      return 0; // Not enough data yet
    }

    // Calculate scores from all trees in parallel
    let totalScore = 0;
    for (let i = 0; i < this.numberOfTrees; i++) {
      this.scoreBuffer[i] = this.trees[i].getAnomalyScore(point);
      totalScore += this.scoreBuffer[i];
    }

    // Return average score from all trees
    return totalScore / this.numberOfTrees;
  }

  getAnomalyAttribution(point: Float64Array): number[] {
    // Simplified attribution - variance per dimension
    const attribution = new Array(this.dimensions).fill(0);

    for (let d = 0; d < this.dimensions; d++) {
      // Create modified point
      this.tempBuffer.set(point);
      this.tempBuffer[d] = 0; // Zero out dimension

      const originalScore = this.getAnomalyScore(point);
      const modifiedScore = this.getAnomalyScore(this.tempBuffer);

      attribution[d] = Math.abs(originalScore - modifiedScore);
    }

    // Normalize
    const sum = attribution.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        attribution[i] /= sum;
      }
    }

    return attribution;
  }

  imputeMissingValues(
    point: number[],
    missingIndices: number[]
  ): number[] {
    const result = [...point];

    // Simple imputation - use mean of nearby points
    for (const idx of missingIndices) {
      let sum = 0;
      let count = 0;

      // Sample some trees for estimates
      const samples = Math.min(5, this.trees.length);
      for (let i = 0; i < samples; i++) {
        const tree = this.trees[i];
        // Get a random sample from tree (simplified)
        if (tree['nodes'].length > 0) {
          const node = tree['nodes'][Math.floor(this.random.nextDouble() * tree['nodes'].length)];
          sum += node.point[idx];
          count++;
        }
      }

      result[idx] = count > 0 ? sum / count : 0;
    }

    return result;
  }

  getNearNeighbors(point: Float64Array, k: number): Array<{
    point: number[];
    distance: number;
    score: number;
  }> {
    const neighbors: Array<{ point: Float64Array; distance: number }> = [];

    // Collect samples from trees
    for (const tree of this.trees) {
      const nodes = tree['nodes'] as TreeNode[];
      for (const node of nodes) {
        const distance = Math.sqrt(this.euclideanDistanceSquared(point, node.point));
        neighbors.push({ point: node.point, distance });
      }
    }

    // Sort by distance and take top k
    neighbors.sort((a, b) => a.distance - b.distance);

    return neighbors.slice(0, k).map(n => ({
      point: Array.from(n.point),
      distance: n.distance,
      score: this.getAnomalyScore(n.point)
    }));
  }

  private euclideanDistanceSquared(a: Float64Array, b: Float64Array): number {
    let sum = 0;
    for (let i = 0; i < this.dimensions; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return sum;
  }

  getTotalUpdates(): number {
    return this.updateCount;
  }

  getSampleSize(): number {
    return this.sampleSize;
  }

  getDimensions(): number {
    return this.dimensions;
  }

  getNumberOfTrees(): number {
    return this.numberOfTrees;
  }

  getShingleSize(): number {
    return 1; // Not using shingling in this implementation
  }
}