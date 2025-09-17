/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

export enum ForestMode {
  STANDARD = "STANDARD",
  TIME_AUGMENTED = "TIME_AUGMENTED",
  STREAMING_IMPUTE = "STREAMING_IMPUTE"
}