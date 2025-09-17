/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

export enum ImputationMethod {
  ZERO = "ZERO",
  FIXED_VALUES = "FIXED_VALUES",
  PREVIOUS = "PREVIOUS",
  LINEAR = "LINEAR",
  NEXT = "NEXT",
  RCF = "RCF"
}