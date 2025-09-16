/**
 * Simple usage examples for TRCF TypeScript
 */

import {
  AnomalyDetector,
  createTimeSeriesDetector,
  createMultiVariateDetector
} from '@beshu-tech/trcf-ts';

// Example 1: Basic time series anomaly detection
console.log('=== Example 1: Time Series Monitoring ===');
const cpuDetector = createTimeSeriesDetector({
  anomalyRate: 0.05, // Higher rate for demo
  windowSize: 50
});

// First, establish baseline with normal CPU usage
console.log('Training with normal CPU data...');
for (let i = 0; i < 30; i++) {
  const normalCpu = 45 + Math.random() * 10; // 45-55% range
  cpuDetector.detect([normalCpu]);
}

console.log('Now monitoring for anomalies:');
const cpuUsages = [48, 52, 47, 51, 89, 49, 50, 95]; // Spikes at 89 and 95
cpuUsages.forEach((cpu, i) => {
  const result = cpuDetector.detect([cpu]);
  console.log(`CPU ${cpu}%: Grade ${result.grade.toFixed(3)} ${result.isAnomaly ? '🚨' : '✅'}`);
});

// Example 2: Multi-dimensional system monitoring
console.log('\n=== Example 2: System Health Monitoring ===');
const systemDetector = createMultiVariateDetector({
  anomalyRate: 0.05, // Higher rate for demo
  numberOfTrees: 20,
  windowSize: 40
});

// Train with normal system metrics
console.log('Training with normal system metrics...');
for (let i = 0; i < 25; i++) {
  const normalMetrics = [
    45 + Math.random() * 10,  // CPU: 45-55%
    60 + Math.random() * 15,  // Memory: 60-75%
    150 + Math.random() * 50, // Response: 150-200ms
    200 + Math.random() * 30  // Users: 200-230
  ];
  systemDetector.detect(normalMetrics);
}

console.log('Now monitoring system health:');
const systemMetrics = [
  [48, 62, 160, 210],  // Normal
  [52, 65, 155, 205],  // Normal
  [89, 95, 2500, 50],  // Anomaly: High CPU, memory, slow response, low users
  [47, 61, 150, 215]   // Back to normal
];

systemMetrics.forEach((metrics, i) => {
  const [cpu, memory, responseTime, users] = metrics;
  const result = systemDetector.detect(metrics);

  if (result.isAnomaly) {
    console.log(`🔥 System anomaly detected at point ${i}:`, {
      cpu: `${cpu}%`,
      memory: `${memory}%`,
      responseTime: `${responseTime}ms`,
      users: users,
      grade: result.grade.toFixed(3),
      confidence: result.confidence.toFixed(3)
    });
  } else {
    console.log(`✅ Point ${i}: Normal system state`);
  }
});

// Example 3: Batch processing with filtering
console.log('\n=== Example 3: Batch Processing ===');
const batchDetector = new AnomalyDetector({
  windowSize: 50,
  anomalyRate: 0.02
});

// Generate test data with some anomalies
const testData: number[][] = [];
for (let i = 0; i < 20; i++) {
  const value = 100 + Math.sin(i * 0.3) * 20 + Math.random() * 10;
  // Inject anomalies
  if (i === 5 || i === 15) {
    testData.push([value + 200]); // Clear outliers
  } else {
    testData.push([value]);
  }
}

// Process all at once, only return anomalies
const anomalies = batchDetector.detectBatch(testData, undefined, true);
console.log(`Found ${anomalies.length} anomalies out of ${testData.length} points`);
anomalies.forEach((anomaly, i) => {
  console.log(`  Anomaly ${i + 1}: Grade ${anomaly.grade.toFixed(3)}, Score ${anomaly.score.toFixed(2)}`);
});

// Example 4: Real-time streaming simulation
console.log('\n=== Example 4: Real-time Stream ===');
const streamDetector = createTimeSeriesDetector({
  windowSize: 200,
  timeAware: true
});

console.log('Simulating 10-second stream...');
let pointCount = 0;
let anomalyCount = 0;

const simulateStream = setInterval(() => {
  // Generate realistic data with occasional spikes
  const baseValue = 50 + Math.sin(pointCount * 0.1) * 15;
  const noise = Math.random() * 5;
  const spike = Math.random() > 0.9 ? 100 : 0; // 10% chance of spike
  const value = baseValue + noise + spike;

  const result = streamDetector.detect([value], Date.now());

  if (result.isAnomaly) {
    console.log(`📈 t=${pointCount}: Anomaly detected! Value=${value.toFixed(1)}, Grade=${result.grade.toFixed(3)}`);
    anomalyCount++;
  }

  pointCount++;
}, 100);

// Stop after 10 seconds and show stats
setTimeout(() => {
  clearInterval(simulateStream);
  console.log(`\nStream completed: ${pointCount} points processed, ${anomalyCount} anomalies detected`);

  const stats = streamDetector.getStats();
  console.log('Final stats:', {
    totalUpdates: stats.totalUpdates,
    isReady: stats.isReady,
    dimensions: stats.dimensions
  });
}, 10000);