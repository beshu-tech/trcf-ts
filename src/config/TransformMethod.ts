/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

export enum TransformMethod {
  NONE = "NONE",
  NORMALIZE = "NORMALIZE",
  DIFFERENCE = "DIFFERENCE",
  NORMALIZE_DIFFERENCE = "NORMALIZE_DIFFERENCE",
  SUBTRACT_MA = "SUBTRACT_MA",
  WEIGHTED = "WEIGHTED"
}