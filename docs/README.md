# Documentation Index

## 📚 Documentation Structure

### Development
- [**Design Overview**](development/DESIGN.md) - Architecture and design decisions
- [**CI/CD Pipeline**](development/CI_CD.md) - GitHub Actions workflows and deployment
- [**Development Guide**](development/CLAUDE.md) - Build commands and architecture details

### Performance
- [**Kibana Performance Metrics**](performance/KIBANA_USE_CASE_PERF_METRICS.md) - Detailed performance analysis for Kibana use case
- [**Java vs TypeScript Comparison**](../benchmarks/java-typescript-comparison.ts) - Benchmark comparing implementations

### Archive
- [**Java Alignment Notes**](archive/ALIGN_TO_JAVA.md) - Historical notes on achieving Java parity
- [**Setup Summary**](archive/SETUP_SUMMARY.md) - CI/CD setup completion notes

## 🚀 Quick Links

### For Users
- [**README**](../README.md) - Getting started and API reference
- [**Contributing**](../CONTRIBUTING.md) - How to contribute

### For Developers
- [**CI/CD Guide**](development/CI_CD.md) - Setting up automated deployments
- [**Architecture**](development/CLAUDE.md#architecture--key-components) - System design

### Benchmarks
Run performance benchmarks:
```bash
npm run build
npx ts-node benchmarks/java-typescript-comparison.ts
npx ts-node benchmarks/kibana-alerting-benchmark.ts
```

## 📊 Key Metrics

| Metric | Value | vs Java |
|--------|-------|---------|
| **Throughput** | 96,509 pts/sec | 25-58x faster |
| **Latency P99** | 0.017ms | - |
| **Score Accuracy** | - | 91-96% match |
| **Memory (1M pts)** | 1.17 GB | - |

## 🔧 Development Setup

1. **Install**: `npm install`
2. **Build**: `npm run build`
3. **Test**: `npm test`
4. **Benchmark**: See benchmarks above

For detailed setup instructions, see the [Development Guide](development/CLAUDE.md).