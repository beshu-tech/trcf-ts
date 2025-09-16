import { ScoringStrategy } from '../config/ScoringStrategy';

export class AnomalyDescriptor {
  public inputData: number[];
  public timestamp: number;
  public anomalyScore: number = 0;
  public anomalyGrade: number = 0;
  public expectedRCFPoint: number[] | null = null;
  public missingValues: number[] | null = null;
  public scoringStrategy: ScoringStrategy = ScoringStrategy.EXPECTED_INVERSE_DEPTH;
  public threshold: number = 0;
  public confidence: number = 0;
  public attribution: number[] | null = null;
  public likelihood: number = 0;
  public forecastedAnomalyGrade: number = 0;
  public pastValues: number[] | null = null;
  public totalUpdates: number = 0;

  constructor(inputPoint: number[], timestamp: number) {
    this.inputData = inputPoint;
    this.timestamp = timestamp;
  }

  public setScoringStrategy(strategy: ScoringStrategy): void {
    this.scoringStrategy = strategy;
  }

  public copyOf(): AnomalyDescriptor {
    const copy = new AnomalyDescriptor(this.inputData.slice(), this.timestamp);
    copy.anomalyScore = this.anomalyScore;
    copy.anomalyGrade = this.anomalyGrade;
    copy.expectedRCFPoint = this.expectedRCFPoint?.slice() || null;
    copy.missingValues = this.missingValues?.slice() || null;
    copy.scoringStrategy = this.scoringStrategy;
    copy.threshold = this.threshold;
    copy.confidence = this.confidence;
    copy.attribution = this.attribution?.slice() || null;
    copy.likelihood = this.likelihood;
    copy.forecastedAnomalyGrade = this.forecastedAnomalyGrade;
    copy.pastValues = this.pastValues?.slice() || null;
    copy.totalUpdates = this.totalUpdates;
    return copy;
  }
}