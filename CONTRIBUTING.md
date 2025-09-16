# Contributing to TRCF TypeScript

Thank you for your interest in contributing to the TRCF TypeScript implementation! We appreciate all contributions that help improve this anomaly detection library.

## How to Contribute

### Reporting Issues

Before creating an issue, please:
1. Check if a similar issue already exists
2. Include a clear description of the problem
3. Provide steps to reproduce the issue
4. Include relevant system information (Node.js version, OS, etc.)
5. Share code examples or test cases when applicable

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes following our coding standards
4. Add or update tests as needed
5. Ensure all tests pass: `npm test`
6. Update documentation if required
7. Submit a pull request with a clear description

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-fork/trcf-typescript.git
cd trcf-typescript

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run benchmarks
npm run build && npx ts-node benchmarks/quick-perf.ts
```

### Coding Standards

- Use TypeScript with strict type checking
- Follow existing code style and patterns
- Use Float32Arrays for numerical computations
- Include JSDoc comments for public APIs
- Write meaningful test cases
- Keep performance in mind (this is a performance-critical library)

### Testing Guidelines

- Write unit tests for new features
- Include performance regression tests for optimizations
- Test edge cases and error conditions
- Ensure compatibility tests pass
- Maintain or improve code coverage

### Performance Considerations

This library is optimized for high-performance anomaly detection:
- Use typed arrays (Float32Array) for numerical data
- Avoid memory allocations in hot paths
- Pre-allocate buffers when possible
- Profile performance changes with benchmarks
- Consider impact on Kibana alerting use case

## Contribution License Agreement

By contributing to this project, you agree that:

### Definitions

- **"You"** means the individual or legal entity making a contribution
- **"Contribution"** means any work of authorship submitted by You for inclusion in the project
- **"Project"** means the TRCF TypeScript implementation and related materials

### License Grant

You hereby grant to the project maintainers and users a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable license under all intellectual property rights to:
- Use, copy, modify, and distribute Your Contributions
- Sublicense and permit others to use Your Contributions
- Incorporate Your Contributions into derivative works

### Representations

By submitting a Contribution, You represent that:
1. The Contribution is Your original work or You have the right to submit it
2. You have the authority to grant the rights described above
3. The Contribution does not infringe on any third-party rights
4. You are not aware of any claims or legal issues related to the Contribution

### Patent License

If Your Contribution includes any patents, You grant a patent license to users of the project for those patents that are necessarily infringed by Your Contribution or the combination of Your Contribution with the project.

### No Additional Obligations

This agreement does not create any obligation for the project maintainers to:
- Include Your Contribution in any release
- Provide support or maintenance for Your Contribution
- Attribute Your Contribution in any particular way

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for all contributors. Please:

- Be respectful and professional in all interactions
- Focus on technical merit and project goals
- Provide constructive feedback
- Help others learn and contribute
- Follow applicable laws and ethical guidelines

## Recognition

Contributors who make significant improvements will be:
- Acknowledged in release notes
- Listed in project contributors
- Invited to participate in project decisions (for major contributors)

## Legal Notice

This project is based on the AWS Random Cut Forest library and follows the same Apache 2.0 license terms. All contributions must be compatible with this license.

By contributing, you confirm that:
- Your contributions are original or properly licensed
- You have the right to submit the contributions under Apache 2.0
- You understand the terms of the Apache 2.0 license

## Questions?

If you have questions about contributing, please:
- Open a GitHub issue for technical questions
- Contact the maintainers for licensing or legal questions
- Review existing issues and documentation first

Thank you for helping make TRCF TypeScript better!