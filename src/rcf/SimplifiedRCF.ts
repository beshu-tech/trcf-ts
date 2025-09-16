/**
 * Simplified Random Cut Forest implementation for TRCF
 * This is a minimal implementation focusing on the essential methods needed by TRCF
 */

import { RandomCutForest } from '../core/ThresholdedRandomCutForest';

// Data structures
export interface RCFConfig {
  dimensions: number;
  shingleSize: number;
  numberOfTrees: number;
  sampleSize: number;
  timeDecay: number;
  randomSeed?: number;
}

export interface Neighbor {
  point: number[];
  distance: number;
  count: number;
}

export interface DiVector {
  high: number[];
  low: number[];

  getHighLowSum(): number;
}

export interface DensityOutput {
  distances: DiVector;
  density: number;
}

class SimpleDiVector implements DiVector {
  constructor(public high: number[], public low: number[]) {}

  getHighLowSum(): number {
    let sum = 0;
    for (let i = 0; i < this.high.length; i++) {
      sum += this.high[i] + this.low[i];
    }
    return sum;
  }
}

// Simple tree node
interface TreeNode {
  isLeaf: boolean;
  point?: Float32Array;
  pointIndex?: number;
  cutDimension?: number;
  cutValue?: number;
  left?: TreeNode;
  right?: TreeNode;
  boundingBox: BoundingBox;
  mass: number; // Number of points in subtree
}

class BoundingBox {
  min: Float32Array;
  max: Float32Array;

  constructor(dimensions: number) {
    this.min = new Float32Array(dimensions).fill(Number.POSITIVE_INFINITY);
    this.max = new Float32Array(dimensions).fill(Number.NEGATIVE_INFINITY);
  }

  update(point: Float32Array): void {
    for (let i = 0; i < point.length; i++) {
      this.min[i] = Math.min(this.min[i], point[i]);
      this.max[i] = Math.max(this.max[i], point[i]);
    }
  }

  contains(point: Float32Array): boolean {
    for (let i = 0; i < point.length; i++) {
      if (point[i] < this.min[i] || point[i] > this.max[i]) {
        return false;
      }
    }
    return true;
  }

  getRange(dimension: number): number {
    return this.max[dimension] - this.min[dimension];
  }
}

// Simple Random Cut Tree
class RandomCutTree {
  private root: TreeNode | null = null;
  private dimensions: number;
  private sampleSize: number;
  private points: Float32Array[] = [];
  private random: () => number;

  constructor(dimensions: number, sampleSize: number, randomSeed: number = Date.now()) {
    this.dimensions = dimensions;
    this.sampleSize = sampleSize;
    // Simple seeded random
    let seed = randomSeed;
    this.random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  insert(point: Float32Array): void {
    if (this.points.length >= this.sampleSize) {
      // Reservoir sampling - randomly replace a point
      const idx = Math.floor(this.random() * this.points.length);
      this.deletePoint(idx);
    }

    const pointIndex = this.points.length;
    this.points.push(point);

    if (!this.root) {
      this.root = this.createLeaf(point, pointIndex);
    } else {
      this.root = this.insertNode(this.root, point, pointIndex);
    }
  }

  private createLeaf(point: Float32Array, pointIndex: number): TreeNode {
    const box = new BoundingBox(this.dimensions);
    box.update(point);
    return {
      isLeaf: true,
      point,
      pointIndex,
      boundingBox: box,
      mass: 1
    };
  }

  private insertNode(node: TreeNode, point: Float32Array, pointIndex: number): TreeNode {
    if (node.isLeaf) {
      // Create internal node with random cut
      const box = new BoundingBox(this.dimensions);
      box.update(node.point!);
      box.update(point);

      // Choose random cut dimension weighted by range
      const dimension = this.chooseCutDimension(box);
      const cutValue = box.min[dimension] +
                      this.random() * (box.max[dimension] - box.min[dimension]);

      const newNode: TreeNode = {
        isLeaf: false,
        cutDimension: dimension,
        cutValue,
        boundingBox: box,
        mass: 2
      };

      // Assign points to children
      if (node.point![dimension] <= cutValue) {
        newNode.left = node;
        newNode.right = this.createLeaf(point, pointIndex);
      } else {
        newNode.left = this.createLeaf(point, pointIndex);
        newNode.right = node;
      }

      return newNode;
    } else {
      // Traverse tree and insert
      node.boundingBox.update(point);
      node.mass++;

      if (point[node.cutDimension!] <= node.cutValue!) {
        node.left = this.insertNode(node.left!, point, pointIndex);
      } else {
        node.right = this.insertNode(node.right!, point, pointIndex);
      }

      return node;
    }
  }

  private chooseCutDimension(box: BoundingBox): number {
    // Weight dimensions by their range
    const ranges: number[] = [];
    let totalRange = 0;

    for (let i = 0; i < this.dimensions; i++) {
      const range = box.getRange(i);
      ranges.push(range);
      totalRange += range;
    }

    if (totalRange === 0) {
      return Math.floor(this.random() * this.dimensions);
    }

    // Random weighted selection
    let r = this.random() * totalRange;
    for (let i = 0; i < this.dimensions; i++) {
      r -= ranges[i];
      if (r <= 0) {
        return i;
      }
    }

    return this.dimensions - 1;
  }

  private deletePoint(index: number): void {
    // Simple deletion - rebuild tree without the point
    const remainingPoints = this.points.filter((_, i) => i !== index);
    this.points = [];
    this.root = null;

    for (const point of remainingPoints) {
      this.insert(point);
    }
  }

  getAnomalyScore(point: Float32Array): number {
    if (!this.root || this.points.length === 0) {
      return 0;
    }

    // Simplified scoring based on isolation depth
    const depth = this.getIsolationDepth(this.root, point, 0);
    const expectedDepth = 2 * Math.log(this.points.length);

    // Higher score for shallower isolation
    return Math.max(0, 1 - depth / expectedDepth);
  }

  private getIsolationDepth(node: TreeNode | null, point: Float32Array, currentDepth: number): number {
    if (!node || node.isLeaf) {
      return currentDepth;
    }

    if (point[node.cutDimension!] <= node.cutValue!) {
      return this.getIsolationDepth(node.left || null, point, currentDepth + 1);
    } else {
      return this.getIsolationDepth(node.right || null, point, currentDepth + 1);
    }
  }

  getNearestNeighbors(point: Float32Array, k: number = 10): Neighbor[] {
    const neighbors: Neighbor[] = [];

    for (let i = 0; i < this.points.length; i++) {
      const distance = this.euclideanDistance(point, this.points[i]);
      neighbors.push({
        point: Array.from(this.points[i]),
        distance,
        count: 1
      });
    }

    // Sort by distance and return top k
    neighbors.sort((a, b) => a.distance - b.distance);
    return neighbors.slice(0, k);
  }

  private euclideanDistance(a: Float32Array, b: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  getAttribution(point: Float32Array): DiVector {
    // Simplified attribution - deviation from median in each dimension
    const high = new Array(this.dimensions).fill(0);
    const low = new Array(this.dimensions).fill(0);

    if (this.points.length === 0) {
      return new SimpleDiVector(high, low);
    }

    // Calculate median for each dimension
    for (let d = 0; d < this.dimensions; d++) {
      const values = this.points.map(p => p[d]).sort((a, b) => a - b);
      const median = values[Math.floor(values.length / 2)];

      const deviation = Math.abs(point[d] - median);
      if (point[d] > median) {
        high[d] = deviation;
      } else {
        low[d] = deviation;
      }
    }

    return new SimpleDiVector(high, low);
  }
}

/**
 * Simplified Random Cut Forest
 * Implements the minimal RCF interface needed by TRCF
 */
export class SimplifiedRCF implements RandomCutForest {
  private trees: RandomCutTree[] = [];
  private config: RCFConfig;
  private totalUpdates: number = 0;
  private timeDecay: number;

  constructor(config: RCFConfig) {
    this.config = config;
    this.timeDecay = config.timeDecay || 0.0001;

    // Create trees with different random seeds
    for (let i = 0; i < config.numberOfTrees; i++) {
      const seed = (config.randomSeed || Date.now()) + i * 1000;
      this.trees.push(new RandomCutTree(config.dimensions, config.sampleSize, seed));
    }
  }

  process(point: Float32Array): {
    score: number;
    expectedPoint?: number[];
    attribution?: number[];
  } {
    // Update all trees
    for (const tree of this.trees) {
      tree.insert(point);
    }
    this.totalUpdates++;

    // Calculate average score across trees
    let totalScore = 0;
    const attributions: DiVector[] = [];

    for (const tree of this.trees) {
      totalScore += tree.getAnomalyScore(point);
      attributions.push(tree.getAttribution(point));
    }

    const score = totalScore / this.trees.length;

    // Calculate expected point (simplified - use median of neighbors)
    const expectedPoint = this.calculateExpectedPoint(point);

    // Aggregate attributions
    const attribution = this.aggregateAttributions(attributions);

    return {
      score,
      expectedPoint,
      attribution
    };
  }

  private calculateExpectedPoint(point: Float32Array): number[] {
    // Collect all nearest neighbors from all trees
    const allNeighbors: number[][] = [];

    for (const tree of this.trees) {
      const neighbors = tree.getNearestNeighbors(point, 5);
      neighbors.forEach(n => allNeighbors.push(n.point));
    }

    if (allNeighbors.length === 0) {
      return Array.from(point);
    }

    // Calculate median for each dimension
    const expected = new Array(this.config.dimensions);
    for (let d = 0; d < this.config.dimensions; d++) {
      const values = allNeighbors.map(p => p[d]).sort((a, b) => a - b);
      expected[d] = values[Math.floor(values.length / 2)];
    }

    return expected;
  }

  private aggregateAttributions(attributions: DiVector[]): number[] {
    if (attributions.length === 0) {
      return new Array(this.config.dimensions).fill(0);
    }

    const result = new Array(this.config.dimensions).fill(0);

    for (let d = 0; d < this.config.dimensions; d++) {
      let totalHigh = 0;
      let totalLow = 0;

      for (const attr of attributions) {
        totalHigh += attr.high[d];
        totalLow += attr.low[d];
      }

      // Simple aggregation - average of high and low deviations
      result[d] = (totalHigh + totalLow) / (2 * attributions.length);
    }

    return result;
  }

  getTotalUpdates(): number {
    return this.totalUpdates;
  }

  getShingleSize(): number {
    return this.config.shingleSize;
  }

  getDimensions(): number {
    return this.config.dimensions;
  }

  // Additional methods for TRCF compatibility
  getNumberOfTrees(): number {
    return this.config.numberOfTrees;
  }

  getTimeDecay(): number {
    return this.timeDecay;
  }

  getAnomalyScore(point: Float32Array): number {
    let totalScore = 0;
    for (const tree of this.trees) {
      totalScore += tree.getAnomalyScore(point);
    }
    return totalScore / this.trees.length;
  }

  getAnomalyAttribution(point: Float32Array): DiVector {
    const attributions: DiVector[] = [];
    for (const tree of this.trees) {
      attributions.push(tree.getAttribution(point));
    }

    // Aggregate attributions
    const high = new Array(this.config.dimensions).fill(0);
    const low = new Array(this.config.dimensions).fill(0);

    for (let d = 0; d < this.config.dimensions; d++) {
      for (const attr of attributions) {
        high[d] += attr.high[d];
        low[d] += attr.low[d];
      }
      high[d] /= attributions.length;
      low[d] /= attributions.length;
    }

    return new SimpleDiVector(high, low);
  }

  getSimpleDensity(point: Float32Array): DensityOutput {
    // Simplified density based on average distance to neighbors
    let totalDistance = 0;
    let count = 0;

    for (const tree of this.trees) {
      const neighbors = tree.getNearestNeighbors(point, 10);
      for (const neighbor of neighbors) {
        totalDistance += neighbor.distance;
        count++;
      }
    }

    const avgDistance = count > 0 ? totalDistance / count : 0;
    const density = avgDistance > 0 ? 1 / avgDistance : 0;

    // Create distance DiVector
    const distances = new SimpleDiVector(
      new Array(this.config.dimensions).fill(avgDistance / 2),
      new Array(this.config.dimensions).fill(avgDistance / 2)
    );

    return {
      distances,
      density
    };
  }

  getNearNeighborsInSample(point: Float32Array): Neighbor[] {
    const allNeighbors = new Map<string, Neighbor>();

    // Collect neighbors from all trees
    for (const tree of this.trees) {
      const neighbors = tree.getNearestNeighbors(point, 20);
      for (const neighbor of neighbors) {
        const key = neighbor.point.join(',');
        if (allNeighbors.has(key)) {
          const existing = allNeighbors.get(key)!;
          existing.count++;
          existing.distance = Math.min(existing.distance, neighbor.distance);
        } else {
          allNeighbors.set(key, { ...neighbor });
        }
      }
    }

    // Convert to array and sort by distance
    const result = Array.from(allNeighbors.values());
    result.sort((a, b) => a.distance - b.distance);

    return result.slice(0, 50); // Return top 50 neighbors
  }

  imputeMissingValues(point: Float32Array, numberOfMissing: number, missingIndices: number[]): number[] {
    // Use expected values from nearest neighbors
    const expected = this.calculateExpectedPoint(point);
    const result = Array.from(point);

    for (const idx of missingIndices) {
      if (idx >= 0 && idx < result.length) {
        result[idx] = expected[idx];
      }
    }

    return result;
  }

  isOutputReady(): boolean {
    // Ready after minimum number of updates
    return this.totalUpdates >= this.config.sampleSize * 0.1;
  }

  getBoundingBoxCacheFraction(): number {
    return 1.0; // Always use caching in simplified version
  }

  setBoundingBoxCacheFraction(fraction: number): void {
    // No-op in simplified version
  }

  getOutputAfter(): number {
    return Math.floor(this.config.sampleSize * 0.1);
  }
}