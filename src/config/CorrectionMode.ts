/**
 * Copyright Beshu Limited 2025
 * Licensed under the Apache License, Version 2.0
 * Based on AWS Random Cut Forest (https://github.com/aws/random-cut-forest-by-aws)
 */

export enum CorrectionMode {
  NONE = "NONE",
  ALERT_ONCE = "ALERT_ONCE",
  CONDITIONAL_FORECAST = "CONDITIONAL_FORECAST",
  DATA_DRIFT = "DATA_DRIFT"
}