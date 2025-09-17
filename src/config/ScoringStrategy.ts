/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

export enum ScoringStrategy {
  EXPECTED_INVERSE_DEPTH = "EXPECTED_INVERSE_DEPTH",
  DISTANCE = "DISTANCE",
  MULTI_MODE = "MULTI_MODE"
}