/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

export class Deviation {
  private count: number = 0;
  private sum: number = 0;
  private sumSquared: number = 0;
  private discount: number;
  private weight: number = 0;

  constructor(discount: number = 0) {
    this.discount = Math.max(0, Math.min(1, discount));
  }

  public update(value: number, weight: number = 1): void {
    if (this.discount === 0) {
      this.count++;
      this.weight += weight;
      this.sum += value * weight;
      this.sumSquared += value * value * weight;
    } else {
      const factor = 1 - this.discount;
      this.count = factor * this.count + 1;
      this.weight = factor * this.weight + weight;
      this.sum = factor * this.sum + value * weight;
      this.sumSquared = factor * this.sumSquared + value * value * weight;
    }
  }

  public getMean(): number {
    return this.weight > 0 ? this.sum / this.weight : 0;
  }

  public getVariance(): number {
    if (this.weight <= 0) return 0;
    const mean = this.getMean();
    return Math.max(0, this.sumSquared / this.weight - mean * mean);
  }

  public getStandardDeviation(): number {
    return Math.sqrt(this.getVariance());
  }

  public getCount(): number {
    return this.count;
  }

  public getWeight(): number {
    return this.weight;
  }

  public getDiscount(): number {
    return this.discount;
  }

  public setDiscount(discount: number): void {
    this.discount = Math.max(0, Math.min(1, discount));
  }

  public reset(): void {
    this.count = 0;
    this.sum = 0;
    this.sumSquared = 0;
    this.weight = 0;
  }
}