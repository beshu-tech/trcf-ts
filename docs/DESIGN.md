# Random Cut Forest Components Analysis for TRCF

## Executive Summary

After analyzing the AWS Random Cut Forest repository and the TRCF implementation, this document identifies the essential RCF components needed for a complete TRCF TypeScript implementation.

## Key RCF Methods Used by TRCF

Based on the analysis of `ThresholdedRandomCutForest.java` and `PredictorCorrector.java`, TRCF uses the following core RCF methods:

### 1. Scoring Methods
- `getAnomalyScore(float[] point)` - Primary anomaly scoring
- `getAnomalyAttribution(float[] point)` - Dimension-wise contribution to anomaly
- `getSimpleDensity(float[] point)` - Distance-based density estimation

### 2. Neighbor Methods
- `getNearNeighborsInSample(float[] point)` - Find nearest neighbors in the sample
- `imputeMissingValues(float[] point, int numberOfMissing, int[] missingIndices)` - Impute missing values using RCF

### 3. Forest Properties
- `getDimensions()` - Get forest dimensionality
- `getShingleSize()` - Get shingle size
- `getNumberOfTrees()` - Get number of trees in forest
- `getTotalUpdates()` - Get total number of updates processed
- `getTimeDecay()` - Get time decay parameter
- `getOutputAfter()` - Get number of points before output
- `getBoundingBoxCacheFraction()` - Get cache fraction
- `isOutputReady()` - Check if forest is ready to output scores

### 4. Forest Updates
- `update(float[] point)` - Update forest with new point (implied from TRCF usage)
- `setBoundingBoxCacheFraction(double fraction)` - Set cache fraction for efficiency

## Core RCF Components Structure

### Essential Classes from `com.amazon.randomcutforest`:

```
randomcutforest/
├── RandomCutForest.java              # Main forest class
├── tree/
│   ├── RandomCutTree.java           # Individual tree implementation
│   ├── ITree.java                    # Tree interface
│   ├── BoundingBox.java             # Bounding box for tree nodes
│   ├── Cut.java                      # Cut representation
│   └── NodeView.java                 # Node representation
├── sampler/
│   ├── CompactSampler.java          # Streaming sampler
│   └── IStreamSampler.java          # Sampler interface
├── anomalydetection/
│   ├── AnomalyScoreVisitor.java     # Scoring visitor
│   ├── AnomalyAttributionVisitor.java # Attribution visitor
│   └── DynamicScoreVisitor.java     # Dynamic scoring
├── executor/
│   ├── SamplerPlusTree.java         # Tree-sampler combination
│   └── PointStoreCoordinator.java   # Point storage coordination
├── store/
│   ├── PointStore.java              # Point storage
│   └── IPointStore.java             # Storage interface
└── returntypes/
    ├── DiVector.java                 # Directional vector
    ├── Neighbor.java                 # Neighbor representation
    ├── DensityOutput.java            # Density results
    └── RangeVector.java              # Range vector

```

## Implementation Strategy for TypeScript

### Phase 1: Core Data Structures
1. **BoundingBox**: Track min/max values for each dimension
2. **Cut**: Represent cuts in the tree (dimension + value)
3. **Node**: Tree node structure with children, cuts, and points
4. **DiVector**: Directional vector for attributions
5. **Neighbor**: Structure for nearest neighbor results

### Phase 2: Tree Implementation
1. **RandomCutTree**: Binary tree with random cuts
   - Insert/delete operations
   - Path finding
   - Bounding box maintenance
2. **Tree traversal**: Visitor pattern for scoring

### Phase 3: Sampling
1. **CompactSampler**: Reservoir sampling with time decay
   - Accept/reject logic
   - Weight management
   - Eviction strategy

### Phase 4: Forest Orchestration
1. **RandomCutForest**: Main class managing multiple trees
   - Parallel tree updates
   - Score aggregation
   - Neighbor search coordination

### Phase 5: Scoring Algorithms
1. **AnomalyScoreVisitor**: Depth-based scoring
2. **AttributionVisitor**: Per-dimension contributions
3. **DensityVisitor**: Distance-based density

## Simplified Implementation Options

For an MVP TypeScript implementation, consider:

### Option 1: Isolation Forest Adaptation
- Use Isolation Forest as a simpler alternative to RCF
- Available npm package: `isolation-forest`
- Modify scoring to match RCF-style output

### Option 2: WebAssembly Bridge
- Compile Java RCF to WebAssembly using TeaVM or CheerpJ
- Create TypeScript bindings
- Best performance but complex setup

### Option 3: Minimal RCF Implementation
- Implement only essential tree operations
- Single tree instead of forest for simplicity
- Basic scoring without full visitor pattern

### Option 4: External Service
- Use AWS Kinesis Analytics or SageMaker
- RCF available as managed service
- TypeScript client for API calls

## Dependencies from Core RCF

### Utility Classes Needed
- `CommonUtils`: Array operations, validation
- `Precision`: Float/double precision handling
- `Config`: Configuration management
- `ShingleBuilder`: Shingling utilities

### Statistical Components
- `Deviation`: Mean/variance tracking with decay
- Time decay calculations
- Weighted sampling

## Recommended Approach

For a production-ready TypeScript TRCF:

1. **Start with simplified RCF**:
   - Single tree implementation
   - Basic anomaly scoring
   - Simple nearest neighbor search

2. **Add essential features**:
   - Multiple trees (start with 10-20)
   - Parallel processing using Web Workers
   - Compact sampling with time decay

3. **Optimize performance**:
   - Use typed arrays (Float32Array)
   - Implement bounding box caching
   - Add tree rebalancing

4. **Integrate with TRCF**:
   - Implement RCF interface from our TypeScript TRCF
   - Add missing value imputation
   - Complete scoring strategies

## Files to Port (Priority Order)

### High Priority (Core Functionality)
1. `RandomCutTree.java` - Core tree structure
2. `CompactSampler.java` - Sampling logic
3. `AnomalyScoreVisitor.java` - Scoring algorithm
4. `BoundingBox.java` - Spatial bounds
5. `DiVector.java` - Attribution vectors

### Medium Priority (Full Features)
6. `RandomCutForest.java` - Forest orchestration
7. `AnomalyAttributionVisitor.java` - Attribution
8. `PointStore.java` - Efficient point storage
9. `Neighbor.java` - Nearest neighbors
10. `DensityOutput.java` - Density estimation

### Low Priority (Optimizations)
11. Tree size variants (Small/Medium/Large)
12. Parallel executors
13. Advanced visitors (Dynamic, Transductive)
14. Interpolation and forecasting

## External Libraries to Consider

### JavaScript/TypeScript Libraries
- **ml-random-forest**: Random forest implementation (different algorithm)
- **isolation-forest**: Anomaly detection alternative
- **simple-statistics**: Statistical utilities
- **mathjs**: Mathematical operations

### Potential Integrations
- **TensorFlow.js**: For neural network-based anomaly detection
- **WebAssembly**: For performance-critical sections
- **Comlink**: Web Worker communication
- **Apache Arrow JS**: Efficient data structures

## Next Steps

1. **Decide on implementation strategy** (pure TS vs WebAssembly vs external service)
2. **Create RCF core module** with essential classes
3. **Implement basic tree and scoring**
4. **Add sampling and multi-tree support**
5. **Integrate with existing TRCF TypeScript code**
6. **Optimize and add advanced features**
7. **Benchmark against Java implementation**

## Conclusion

The TRCF primarily uses RCF for:
- Anomaly scoring and attribution
- Nearest neighbor search
- Missing value imputation
- Forest management (dimensions, updates, properties)

A minimal but functional TypeScript implementation would need:
- Basic random cut tree structure
- Simple scoring visitor
- Reservoir sampling with time decay
- Multi-tree aggregation

This can be achieved in approximately 2000-3000 lines of TypeScript code for core functionality.