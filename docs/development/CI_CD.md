# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment to npm. The pipeline automatically tests, versions, and publishes the package.

## Workflows

### 1. Continuous Integration (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Actions:**
- Tests on Node.js 16.x, 18.x, and 20.x
- Runs linting (ESLint)
- Builds the project
- Runs all tests
- Generates coverage reports (Node 20.x only)
- Uploads coverage to Codecov
- Runs performance benchmarks
- Checks bundle size
- Security audit

### 2. PR Merge and Auto-Version (`pr-merge.yml`)

**Triggers:**
- When a PR is merged to `main`

**Version Bumping Logic:**
- `breaking-change` label → Major version (1.0.0 → 2.0.0)
- `feature` label → Minor version (1.0.0 → 1.1.0)
- `bug` or `fix` label → Patch version (1.0.0 → 1.0.1)
- No label → Patch version (default)

**Actions:**
1. Determines version bump based on PR labels
2. Updates package.json version
3. Updates CHANGELOG.md
4. Creates git tag
5. Publishes to npm
6. Creates GitHub release
7. Comments on PR with release info

### 3. Manual Publish (`publish.yml`)

**Triggers:**
- Push to `main` (automated)
- Manual workflow dispatch with version choice

**Actions:**
- Runs full test suite
- Builds the project
- Bumps version (patch/minor/major)
- Publishes to npm
- Creates GitHub release

## Setup Requirements

### 1. GitHub Secrets

Add these secrets to your repository:

```bash
# Required for npm publishing
NPM_TOKEN: Your npm authentication token

# Optional (uses default GITHUB_TOKEN if not set)
GITHUB_TOKEN: GitHub personal access token with repo permissions
```

### 2. npm Configuration

Ensure your package.json has:

```json
{
  "name": "@beshu-tech/trcf-ts",
  "publishConfig": {
    "access": "public"
  }
}
```

### 3. PR Labels

Create these labels in your repository:

- `breaking-change` (red) - For breaking API changes
- `feature` (green) - For new features
- `bug` or `fix` (orange) - For bug fixes
- `dependencies` (blue) - For dependency updates
- `documentation` (light blue) - For docs only

## Version Strategy

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking API changes
- **MINOR** (0.X.0): New features, backwards compatible
- **PATCH** (0.0.X): Bug fixes, backwards compatible

### Commit Message Convention

For automatic version detection from commits:

```bash
# Major version bump
git commit -m "feat!: Breaking change description"
git commit -m "BREAKING CHANGE: Description"

# Minor version bump
git commit -m "feat: New feature description"

# Patch version bump (default)
git commit -m "fix: Bug fix description"
git commit -m "chore: Maintenance task"
```

## Dependabot

Automated dependency updates are configured:

- **npm packages**: Weekly on Mondays at 4 AM
- **GitHub Actions**: Monthly
- Maximum 5 open PRs at a time

## Local Testing

Test the workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

# Test CI workflow
act push

# Test PR merge workflow
act pull_request -e event.json

# Test with specific Node version
act push -P ubuntu-latest=node:20
```

## Troubleshooting

### npm Publish Fails

1. Check NPM_TOKEN is valid:
```bash
npm whoami --registry https://registry.npmjs.org/
```

2. Ensure package name is available:
```bash
npm view @beshu-tech/trcf-ts
```

### Version Already Exists

If a version already exists, manually bump in package.json:
```bash
npm version patch --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: manual version bump"
git push
```

### GitHub Release Creation Fails

Ensure the GITHUB_TOKEN has these permissions:
- `contents: write`
- `pull-requests: write`

## Best Practices

1. **Always use PR labels** to control version bumping
2. **Write descriptive PR descriptions** - they become release notes
3. **Run tests locally** before pushing: `npm test`
4. **Check bundle size** before major changes: `npm pack --dry-run`
5. **Update CHANGELOG.md** for significant changes
6. **Use conventional commits** for better automation

## Monitoring

- **Build Status**: Check Actions tab in GitHub
- **Coverage**: View on Codecov dashboard
- **npm Package**: https://www.npmjs.com/package/@beshu-tech/trcf-ts
- **Bundle Size**: Check in CI logs or run `npm pack --dry-run`

## Security

- npm audit runs on every CI build
- Dependabot monitors for vulnerabilities
- Only high-severity issues fail the build
- Review security alerts in GitHub Security tab