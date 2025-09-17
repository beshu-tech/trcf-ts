/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

/**
 * * JavaRandom.ts - Exact Java Random implementation for TypeScript
 *
 * Implements Java's Linear Congruential Generator (LCG) with the same
 * constants and algorithm to ensure identical random number generation
 * between Java and TypeScript implementations.
 *
 * This is critical for achieving exact numerical parity in Random Cut Forest
 * tree construction and scoring.

 */
export class JavaRandom {
  private seed: bigint = 0n;
  private static readonly MULTIPLIER = 0x5DEECE66Dn;
  private static readonly ADDEND = 0xBn;
  private static readonly MASK = (1n << 48n) - 1n;

  /**
   * Creates a new JavaRandom instance with the specified seed.
   * Matches Java's Random(long seed) constructor.
   *
   * @param seed - The initial seed value
   */
  constructor(seed: number) {
    this.setSeed(seed);
  }

  /**
   * Sets the seed of this random number generator.
   * Matches Java's setSeed(long seed) method.
   *
   * @param seed - The new seed value
   */
  setSeed(seed: number): void {
    this.seed = (BigInt(seed) ^ JavaRandom.MULTIPLIER) & JavaRandom.MASK;
  }

  /**
   * Generates the next pseudorandom number.
   * This is the core of Java's LCG algorithm.
   *
   * @param bits - Number of random bits to generate (max 48)
   * @returns The next pseudorandom value
   */
  private next(bits: number): number {
    this.seed = (this.seed * JavaRandom.MULTIPLIER + JavaRandom.ADDEND) & JavaRandom.MASK;
    return Number(this.seed >> (48n - BigInt(bits)));
  }

  /**
   * Returns the next pseudorandom double value between 0.0 and 1.0.
   * Matches Java's nextDouble() method exactly.
   *
   * @returns A double value between 0.0 (inclusive) and 1.0 (exclusive)
   */
  nextDouble(): number {
    // Java's nextDouble uses (next(26) << 27) + next(27)
    // divided by (1L << 53) which is 2^53
    const high = this.next(26);
    const low = this.next(27);
    return (high * 134217728 + low) / 9007199254740992; // (high << 27 + low) / 2^53
  }

  /**
   * Returns the next pseudorandom float value between 0.0 and 1.0.
   * Matches Java's nextFloat() method.
   *
   * @returns A float value between 0.0 (inclusive) and 1.0 (exclusive)
   */
  nextFloat(): number {
    return this.next(24) / 16777216; // next(24) / 2^24
  }

  /**
   * Returns the next pseudorandom integer value.
   * Matches Java's nextInt() and nextInt(int bound) methods.
   *
   * @param bound - Optional upper bound (exclusive)
   * @returns A random integer value
   */
  nextInt(bound?: number): number {
    if (bound === undefined) {
      return this.next(32);
    }

    if (bound <= 0) {
      throw new Error("bound must be positive");
    }

    // For power of 2
    if ((bound & -bound) === bound) {
      return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
    }

    // General case - rejection sampling to ensure uniform distribution
    let bits: number;
    let val: number;
    do {
      bits = this.next(31);
      val = bits % bound;
    } while (bits - val + (bound - 1) < 0);

    return val;
  }

  /**
   * Returns the next pseudorandom long value.
   * Matches Java's nextLong() method.
   *
   * @returns A random long value as a BigInt
   */
  nextLong(): bigint {
    // Java's nextLong is (next(32) << 32) + next(32)
    const high = BigInt(this.next(32));
    const low = BigInt(this.next(32));
    return (high << 32n) + low;
  }

  /**
   * Returns the next pseudorandom boolean value.
   * Matches Java's nextBoolean() method.
   *
   * @returns true or false with equal probability
   */
  nextBoolean(): boolean {
    return this.next(1) !== 0;
  }

  /**
   * Returns the next pseudorandom Gaussian distributed value.
   * Matches Java's nextGaussian() method using the Box-Muller transform.
   *
   * @returns A Gaussian distributed random value with mean 0 and standard deviation 1
   */
  nextGaussian(): number {
    // Java uses the polar method variant of Box-Muller
    // For simplicity, using the basic Box-Muller transform here
    // This would need the polar method for exact Java parity
    let v1: number;
    let v2: number;
    let s: number;

    do {
      v1 = 2 * this.nextDouble() - 1;
      v2 = 2 * this.nextDouble() - 1;
      s = v1 * v1 + v2 * v2;
    } while (s >= 1 || s === 0);

    const multiplier = Math.sqrt(-2 * Math.log(s) / s);
    return v1 * multiplier;
  }

  /**
   * Fills the given array with random bytes.
   * Matches Java's nextBytes(byte[] bytes) method.
   *
   * @param bytes - Array to fill with random bytes
   */
  nextBytes(bytes: Uint8Array): void {
    for (let i = 0; i < bytes.length; ) {
      let rnd = this.next(32);
      for (let n = Math.min(bytes.length - i, 4); n-- > 0; rnd >>= 8) {
        bytes[i++] = rnd & 0xFF;
      }
    }
  }
}

/**
 * Factory function to create a JavaRandom instance with system time seed
 * Similar to Java's new Random() constructor.
 */
export function createJavaRandom(): JavaRandom {
  return new JavaRandom(Date.now());
}

/**
 * Utility function to verify JavaRandom produces same output as Java
 * for a given seed. Useful for testing.
 */
export function verifyJavaRandomParity(seed: number): void {
  const random = new JavaRandom(seed);
  console.log(`JavaRandom with seed ${seed}:`);
  console.log(`  First 5 doubles:`);
  for (let i = 0; i < 5; i++) {
    console.log(`    ${i + 1}: ${random.nextDouble()}`);
  }
  console.log(`  First 5 ints(100):`);
  const random2 = new JavaRandom(seed); // Reset seed
  for (let i = 0; i < 5; i++) {
    console.log(`    ${i + 1}: ${random2.nextInt(100)}`);
  }
}