## v1.1.6 - 2025-11-03

### PR: #8 - chore(deps-dev): bump jest from 30.1.3 to 30.2.0

Bumps [jest](https://github.com/jestjs/jest/tree/HEAD/packages/jest) from 30.1.3 to 30.2.0.
<details>
<summary>Release notes</summary>
<p><em>Sourced from <a href="https://github.com/jestjs/jest/releases">jest's releases</a>.</em></p>
<blockquote>
<h2>30.2.0</h2>
<h3>Chore &amp; Maintenance</h3>
<ul>
<li><code>[*]</code> Update example repo for testing React Native projects (<a href="https://redirect.github.com/jestjs/jest/pull/15832">#15832</a>)</li>
<li><code>[*]</code> Update <code>jest-watch-typeahead</code> to v3 (<a href="https://redirect.github.com/jestjs/jest/pull/15830">#15830</a>)</li>
</ul>
<h2>Features</h2>
<ul>
<li><code>[jest-environment-jsdom-abstract]</code> Add support for JSDOM v27 (<a href="https://redirect.github.com/jestjs/jest/pull/15834">#15834</a>)</li>
</ul>
<h3>Fixes</h3>
<ul>
<li><code>[babel-jest]</code> Export the <code>TransformerConfig</code> interface (<a href="https://redirect.github.com/jestjs/jest/pull/15820">#15820</a>)</li>
<li><code>[jest-config]</code> Fix <code>jest.config.ts</code> with TS loader specified in docblock pragma (<a href="https://redirect.github.com/jestjs/jest/pull/15839">#15839</a>)</li>
</ul>
</blockquote>
</details>
<details>
<summary>Changelog</summary>
<p><em>Sourced from <a href="https://github.com/jestjs/jest/blob/main/CHANGELOG.md">jest's changelog</a>.</em></p>
<blockquote>
<h2>30.2.0</h2>
<h3>Chore &amp; Maintenance</h3>
<ul>
<li><code>[*]</code> Update example repo for testing React Native projects (<a href="https://redirect.github.com/jestjs/jest/pull/15832">#15832</a>)</li>
<li><code>[*]</code> Update <code>jest-watch-typeahead</code> to v3 (<a href="https://redirect.github.com/jestjs/jest/pull/15830">#15830</a>)</li>
</ul>
<h2>Features</h2>
<ul>
<li><code>[jest-environment-jsdom-abstract]</code> Add support for JSDOM v27 (<a href="https://redirect.github.com/jestjs/jest/pull/15834">#15834</a>)</li>
</ul>
<h3>Fixes</h3>
<ul>
<li><code>[babel-jest]</code> Export the <code>TransformerConfig</code> interface (<a href="https://redirect.github.com/jestjs/jest/pull/15820">#15820</a>)</li>
<li><code>[jest-config]</code> Fix <code>jest.config.ts</code> with TS loader specified in docblock pragma (<a href="https://redirect.github.com/jestjs/jest/pull/15839">#15839</a>)</li>
</ul>
</blockquote>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a href="https://github.com/jestjs/jest/commit/855864e3f9751366455246790be2bf912d4d0dac"><code>855864e</code></a> v30.2.0</li>
<li>See full diff in <a href="https://github.com/jestjs/jest/commits/v30.2.0/packages/jest">compare view</a></li>
</ul>
</details>
<br />


[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=jest&package-manager=npm_and_yarn&previous-version=30.1.3&new-version=30.2.0)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

Dependabot will resolve any conflicts with this PR as long as you don't alter it yourself. You can also trigger a rebase manually by commenting .

[//]: # (dependabot-automerge-start)
[//]: # (dependabot-automerge-end)

---

<details>
<summary>Dependabot commands and options</summary>
<br />

You can trigger Dependabot actions by commenting on this PR:
-  will rebase this PR
-  will recreate this PR, overwriting any edits that have been made to it
-  will merge this PR after your CI passes on it
-  will squash and merge this PR after your CI passes on it
-  will cancel a previously requested merge and block automerging
-  will reopen this PR if it is closed
-  will close this PR and stop Dependabot recreating it. You can achieve the same result by closing it manually
-  will show all of the ignore conditions of the specified dependency
-  will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)
-  will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)
-  will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)


</details>

**Merged by:** @sscarduzio

## v1.1.5 - 2025-09-17

### PR: #1 - chore(deps): bump codecov/codecov-action from 3 to 5

Bumps [codecov/codecov-action](https://github.com/codecov/codecov-action) from 3 to 5.
<details>
<summary>Release notes</summary>
<p><em>Sourced from <a href="https://github.com/codecov/codecov-action/releases">codecov/codecov-action's releases</a>.</em></p>
<blockquote>
<h2>v5.0.0</h2>
<h2>v5 Release</h2>
<p><code>v5</code> of the Codecov GitHub Action will use the <a href="https://github.com/codecov/wrapper">Codecov Wrapper</a> to encapsulate the <a href="https://github.com/codecov/codecov-cli">CLI</a>. This will help ensure that the Action gets updates quicker.</p>
<h3>Migration Guide</h3>
<p>The <code>v5</code> release also coincides with the opt-out feature for tokens for public repositories. In the <code>Global Upload Token</code> section of the settings page of an organization in codecov.io, you can set the ability for Codecov to receive a coverage reports from any source. This will allow contributors or other members of a repository to upload without needing access to the Codecov token. For more details see <a href="https://docs.codecov.com/docs/codecov-tokens#uploading-without-a-token">how to upload without a token</a>.</p>
<blockquote>
<p>[!WARNING]<br />
<strong>The following arguments have been changed</strong></p>
<ul>
<li><code>file</code> (this has been deprecated in favor of <code>files</code>)</li>
<li><code>plugin</code> (this has been deprecated in favor of <code>plugins</code>)</li>
</ul>
</blockquote>
<p>The following arguments have been added:</p>
<ul>
<li><code>binary</code></li>
<li><code>gcov_args</code></li>
<li><code>gcov_executable</code></li>
<li><code>gcov_ignore</code></li>
<li><code>gcov_include</code></li>
<li><code>report_type</code></li>
<li><code>skip_validation</code></li>
<li><code>swift_project</code></li>
</ul>
<p>You can see their usage in the <code>action.yml</code> <a href="https://github.com/codecov/codecov-action/blob/main/action.yml">file</a>.</p>
<h2>What's Changed</h2>
<ul>
<li>chore(deps): bump to eslint9+ and remove eslint-config-google by <a href="https://github.com/thomasrockhu-codecov"><code>@​thomasrockhu-codecov</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1591">codecov/codecov-action#1591</a></li>
<li>build(deps-dev): bump <code>@​octokit/webhooks-types</code> from 7.5.1 to 7.6.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1595">codecov/codecov-action#1595</a></li>
<li>build(deps-dev): bump typescript from 5.6.2 to 5.6.3 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1604">codecov/codecov-action#1604</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/parser</code> from 8.8.0 to 8.8.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1601">codecov/codecov-action#1601</a></li>
<li>build(deps): bump <code>@​actions/core</code> from 1.11.0 to 1.11.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1597">codecov/codecov-action#1597</a></li>
<li>build(deps): bump github/codeql-action from 3.26.9 to 3.26.11 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1596">codecov/codecov-action#1596</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.8.0 to 8.8.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1600">codecov/codecov-action#1600</a></li>
<li>build(deps-dev): bump eslint from 9.11.1 to 9.12.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1598">codecov/codecov-action#1598</a></li>
<li>build(deps): bump github/codeql-action from 3.26.11 to 3.26.12 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1609">codecov/codecov-action#1609</a></li>
<li>build(deps): bump actions/checkout from 4.2.0 to 4.2.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1608">codecov/codecov-action#1608</a></li>
<li>build(deps): bump actions/upload-artifact from 4.4.0 to 4.4.3 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1607">codecov/codecov-action#1607</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/parser</code> from 8.8.1 to 8.9.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1612">codecov/codecov-action#1612</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.8.1 to 8.9.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1611">codecov/codecov-action#1611</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.9.0 to 8.10.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1615">codecov/codecov-action#1615</a></li>
<li>build(deps-dev): bump eslint from 9.12.0 to 9.13.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1618">codecov/codecov-action#1618</a></li>
<li>build(deps): bump github/codeql-action from 3.26.12 to 3.26.13 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1617">codecov/codecov-action#1617</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/parser</code> from 8.9.0 to 8.10.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1614">codecov/codecov-action#1614</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.10.0 to 8.11.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1620">codecov/codecov-action#1620</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/parser</code> from 8.10.0 to 8.11.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1619">codecov/codecov-action#1619</a></li>
<li>build(deps-dev): bump <code>@​types/jest</code> from 29.5.13 to 29.5.14 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1622">codecov/codecov-action#1622</a></li>
<li>build(deps): bump actions/checkout from 4.2.1 to 4.2.2 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1625">codecov/codecov-action#1625</a></li>
<li>build(deps): bump github/codeql-action from 3.26.13 to 3.27.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1624">codecov/codecov-action#1624</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.11.0 to 8.12.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1626">codecov/codecov-action#1626</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.12.1 to 8.12.2 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1629">codecov/codecov-action#1629</a></li>
</ul>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Changelog</summary>
<p><em>Sourced from <a href="https://github.com/codecov/codecov-action/blob/main/CHANGELOG.md">codecov/codecov-action's changelog</a>.</em></p>
<blockquote>
<h3>v5 Release</h3>
<p><code>v5</code> of the Codecov GitHub Action will use the <a href="https://github.com/codecov/wrapper">Codecov Wrapper</a> to encapsulate the <a href="https://github.com/codecov/codecov-cli">CLI</a>. This will help ensure that the Action gets updates quicker.</p>
<h3>Migration Guide</h3>
<p>The <code>v5</code> release also coincides with the opt-out feature for tokens for public repositories. In the <code>Global Upload Token</code> section of the settings page of an organization in codecov.io, you can set the ability for Codecov to receive a coverage reports from any source. This will allow contributors or other members of a repository to upload without needing access to the Codecov token. For more details see <a href="https://docs.codecov.com/docs/codecov-tokens#uploading-without-a-token">how to upload without a token</a>.</p>
<blockquote>
<p>[!WARNING]
<strong>The following arguments have been changed</strong></p>
<ul>
<li><code>file</code> (this has been deprecated in favor of <code>files</code>)</li>
<li><code>plugin</code> (this has been deprecated in favor of <code>plugins</code>)</li>
</ul>
</blockquote>
<p>The following arguments have been added:</p>
<ul>
<li><code>binary</code></li>
<li><code>gcov_args</code></li>
<li><code>gcov_executable</code></li>
<li><code>gcov_ignore</code></li>
<li><code>gcov_include</code></li>
<li><code>report_type</code></li>
<li><code>skip_validation</code></li>
<li><code>swift_project</code></li>
</ul>
<p>You can see their usage in the <code>action.yml</code> <a href="https://github.com/codecov/codecov-action/blob/main/action.yml">file</a>.</p>
<h2>What's Changed</h2>
<ul>
<li>chore(deps): bump to eslint9+ and remove eslint-config-google by <a href="https://github.com/thomasrockhu-codecov"><code>@​thomasrockhu-codecov</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1591">codecov/codecov-action#1591</a></li>
<li>build(deps-dev): bump <code>@​octokit/webhooks-types</code> from 7.5.1 to 7.6.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1595">codecov/codecov-action#1595</a></li>
<li>build(deps-dev): bump typescript from 5.6.2 to 5.6.3 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1604">codecov/codecov-action#1604</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/parser</code> from 8.8.0 to 8.8.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1601">codecov/codecov-action#1601</a></li>
<li>build(deps): bump <code>@​actions/core</code> from 1.11.0 to 1.11.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1597">codecov/codecov-action#1597</a></li>
<li>build(deps): bump github/codeql-action from 3.26.9 to 3.26.11 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1596">codecov/codecov-action#1596</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.8.0 to 8.8.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1600">codecov/codecov-action#1600</a></li>
<li>build(deps-dev): bump eslint from 9.11.1 to 9.12.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1598">codecov/codecov-action#1598</a></li>
<li>build(deps): bump github/codeql-action from 3.26.11 to 3.26.12 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1609">codecov/codecov-action#1609</a></li>
<li>build(deps): bump actions/checkout from 4.2.0 to 4.2.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1608">codecov/codecov-action#1608</a></li>
<li>build(deps): bump actions/upload-artifact from 4.4.0 to 4.4.3 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1607">codecov/codecov-action#1607</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/parser</code> from 8.8.1 to 8.9.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1612">codecov/codecov-action#1612</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.8.1 to 8.9.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1611">codecov/codecov-action#1611</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.9.0 to 8.10.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1615">codecov/codecov-action#1615</a></li>
<li>build(deps-dev): bump eslint from 9.12.0 to 9.13.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1618">codecov/codecov-action#1618</a></li>
<li>build(deps): bump github/codeql-action from 3.26.12 to 3.26.13 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1617">codecov/codecov-action#1617</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/parser</code> from 8.9.0 to 8.10.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1614">codecov/codecov-action#1614</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.10.0 to 8.11.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1620">codecov/codecov-action#1620</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/parser</code> from 8.10.0 to 8.11.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1619">codecov/codecov-action#1619</a></li>
<li>build(deps-dev): bump <code>@​types/jest</code> from 29.5.13 to 29.5.14 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1622">codecov/codecov-action#1622</a></li>
<li>build(deps): bump actions/checkout from 4.2.1 to 4.2.2 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1625">codecov/codecov-action#1625</a></li>
<li>build(deps): bump github/codeql-action from 3.26.13 to 3.27.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1624">codecov/codecov-action#1624</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.11.0 to 8.12.1 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1626">codecov/codecov-action#1626</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/eslint-plugin</code> from 8.12.1 to 8.12.2 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1629">codecov/codecov-action#1629</a></li>
<li>build(deps-dev): bump <code>@​typescript-eslint/parser</code> from 8.11.0 to 8.12.2 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a> in <a href="https://redirect.github.com/codecov/codecov-action/pull/1628">codecov/codecov-action#1628</a></li>
</ul>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a href="https://github.com/codecov/codecov-action/commit/5a1091511ad55cbe89839c7260b706298ca349f7"><code>5a10915</code></a> chore(release): 5.5.1 (<a href="https://redirect.github.com/codecov/codecov-action/issues/1873">#1873</a>)</li>
<li><a href="https://github.com/codecov/codecov-action/commit/3e0ce21cac10ce733041970012642db7029d6bde"><code>3e0ce21</code></a> fix: overwrite pr number on fork (<a href="https://redirect.github.com/codecov/codecov-action/issues/1871">#1871</a>)</li>
<li><a href="https://github.com/codecov/codecov-action/commit/c4741c819783101819b507e39812c179d04d217a"><code>c4741c8</code></a> build(deps): bump actions/checkout from 4.2.2 to 5.0.0 (<a href="https://redirect.github.com/codecov/codecov-action/issues/1868">#1868</a>)</li>
<li><a href="https://github.com/codecov/codecov-action/commit/17370e8added1529d3650d8f4ed93e6854c2a93e"><code>17370e8</code></a> build(deps): bump github/codeql-action from 3.29.9 to 3.29.11 (<a href="https://redirect.github.com/codecov/codecov-action/issues/1867">#1867</a>)</li>
<li><a href="https://github.com/codecov/codecov-action/commit/18fdacf0ce3c929a03f3f6fe8e55d31dbf270cfe"><code>18fdacf</code></a> fix: update to use local app/ dir (<a href="https://redirect.github.com/codecov/codecov-action/issues/1872">#1872</a>)</li>
<li><a href="https://github.com/codecov/codecov-action/commit/206148c4b8a51281182730813eeed9f6d6f3fb35"><code>206148c</code></a> docs: fix typo in README (<a href="https://redirect.github.com/codecov/codecov-action/issues/1866">#1866</a>)</li>
<li><a href="https://github.com/codecov/codecov-action/commit/3cb13a12348ef4ffcf9783ac0f74954f92113e33"><code>3cb13a1</code></a> Document a <code>codecov-cli</code> version reference example (<a href="https://redirect.github.com/codecov/codecov-action/issues/1774">#1774</a>)</li>
<li><a href="https://github.com/codecov/codecov-action/commit/a4803c1f8dbe35cac65c28a290b50a809965b471"><code>a4803c1</code></a> build(deps): bump github/codeql-action from 3.28.18 to 3.29.9 (<a href="https://redirect.github.com/codecov/codecov-action/issues/1861">#1861</a>)</li>
<li><a href="https://github.com/codecov/codecov-action/commit/3139621497004e9dc1af906e47f2a634047e7bb3"><code>3139621</code></a> build(deps): bump ossf/scorecard-action from 2.4.1 to 2.4.2 (<a href="https://redirect.github.com/codecov/codecov-action/issues/1833">#1833</a>)</li>
<li><a href="https://github.com/codecov/codecov-action/commit/fdcc8476540edceab3de004e990f80d881c6cc00"><code>fdcc847</code></a> chore(release): 5.5.0 (<a href="https://redirect.github.com/codecov/codecov-action/issues/1865">#1865</a>)</li>
<li>Additional commits viewable in <a href="https://github.com/codecov/codecov-action/compare/v3...v5">compare view</a></li>
</ul>
</details>
<br />


[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=codecov/codecov-action&package-manager=github_actions&previous-version=3&new-version=5)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

Dependabot will resolve any conflicts with this PR as long as you don't alter it yourself. You can also trigger a rebase manually by commenting .

[//]: # (dependabot-automerge-start)
[//]: # (dependabot-automerge-end)

---

<details>
<summary>Dependabot commands and options</summary>
<br />

You can trigger Dependabot actions by commenting on this PR:
-  will rebase this PR
-  will recreate this PR, overwriting any edits that have been made to it
-  will merge this PR after your CI passes on it
-  will squash and merge this PR after your CI passes on it
-  will cancel a previously requested merge and block automerging
-  will reopen this PR if it is closed
-  will close this PR and stop Dependabot recreating it. You can achieve the same result by closing it manually
-  will show all of the ignore conditions of the specified dependency
-  will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)
-  will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)
-  will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)


</details>

**Merged by:** @sscarduzio

## v1.1.4 - 2025-09-17

### PR: #2 - chore(deps): bump actions/setup-node from 4 to 5

[//]: # (dependabot-start)
⚠️  **Dependabot is rebasing this PR** ⚠️ 

Rebasing might not happen immediately, so don't worry if this takes some time.

Note: if you make any changes to this PR yourself, they will take precedence over the rebase.

---

[//]: # (dependabot-end)

Bumps [actions/setup-node](https://github.com/actions/setup-node) from 4 to 5.
<details>
<summary>Release notes</summary>
<p><em>Sourced from <a href="https://github.com/actions/setup-node/releases">actions/setup-node's releases</a>.</em></p>
<blockquote>
<h2>v5.0.0</h2>
<h2>What's Changed</h2>
<h3>Breaking Changes</h3>
<ul>
<li>Enhance caching in setup-node with automatic package manager detection by <a href="https://github.com/priya-kinthali"><code>@​priya-kinthali</code></a> in <a href="https://redirect.github.com/actions/setup-node/pull/1348">actions/setup-node#1348</a></li>
</ul>
<p>This update, introduces automatic caching when a valid <code>packageManager</code> field is present in your <code>package.json</code>. This aims to improve workflow performance and make dependency management more seamless.
To disable this automatic caching, set <code>package-manager-cache: false</code></p>
<pre lang="yaml"><code>steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v5
  with:
    package-manager-cache: false
</code></pre>
<ul>
<li>Upgrade action to use node24 by <a href="https://github.com/salmanmkc"><code>@​salmanmkc</code></a> in <a href="https://redirect.github.com/actions/setup-node/pull/1325">actions/setup-node#1325</a></li>
</ul>
<p>Make sure your runner is on version v2.327.1 or later to ensure compatibility with this release. <a href="https://github.com/actions/runner/releases/tag/v2.327.1">See Release Notes</a></p>
<h3>Dependency Upgrades</h3>
<ul>
<li>Upgrade <code>@​octokit/request-error</code> and <code>@​actions/github</code> by <a href="https://github.com/dependabot"><code>@​dependabot</code></a>[bot] in <a href="https://redirect.github.com/actions/setup-node/pull/1227">actions/setup-node#1227</a></li>
<li>Upgrade uuid from 9.0.1 to 11.1.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a>[bot] in <a href="https://redirect.github.com/actions/setup-node/pull/1273">actions/setup-node#1273</a></li>
<li>Upgrade undici from 5.28.5 to 5.29.0 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a>[bot] in <a href="https://redirect.github.com/actions/setup-node/pull/1295">actions/setup-node#1295</a></li>
<li>Upgrade form-data to bring in fix for critical vulnerability by <a href="https://github.com/gowridurgad"><code>@​gowridurgad</code></a> in <a href="https://redirect.github.com/actions/setup-node/pull/1332">actions/setup-node#1332</a></li>
<li>Upgrade actions/checkout from 4 to 5 by <a href="https://github.com/dependabot"><code>@​dependabot</code></a>[bot] in <a href="https://redirect.github.com/actions/setup-node/pull/1345">actions/setup-node#1345</a></li>
</ul>
<h2>New Contributors</h2>
<ul>
<li><a href="https://github.com/priya-kinthali"><code>@​priya-kinthali</code></a> made their first contribution in <a href="https://redirect.github.com/actions/setup-node/pull/1348">actions/setup-node#1348</a></li>
<li><a href="https://github.com/salmanmkc"><code>@​salmanmkc</code></a> made their first contribution in <a href="https://redirect.github.com/actions/setup-node/pull/1325">actions/setup-node#1325</a></li>
</ul>
<p><strong>Full Changelog</strong>: <a href="https://github.com/actions/setup-node/compare/v4...v5.0.0">https://github.com/actions/setup-node/compare/v4...v5.0.0</a></p>
<h2>v4.4.0</h2>
<h2>What's Changed</h2>
<h3>Bug fixes:</h3>
<ul>
<li>Make eslint-compact matcher compatible with Stylelint by <a href="https://github.com/FloEdelmann"><code>@​FloEdelmann</code></a> in <a href="https://redirect.github.com/actions/setup-node/pull/98">actions/setup-node#98</a></li>
<li>Add support for indented eslint output by <a href="https://github.com/fregante"><code>@​fregante</code></a> in <a href="https://redirect.github.com/actions/setup-node/pull/1245">actions/setup-node#1245</a></li>
</ul>
<h3>Enhancement:</h3>
<ul>
<li>Support private mirrors by <a href="https://github.com/marco-ippolito"><code>@​marco-ippolito</code></a> in <a href="https://redirect.github.com/actions/setup-node/pull/1240">actions/setup-node#1240</a></li>
</ul>
<h3>Dependency update:</h3>
<ul>
<li>Upgrade <code>@​action/cache</code> from 4.0.2 to 4.0.3 by <a href="https://github.com/aparnajyothi-y"><code>@​aparnajyothi-y</code></a> in <a href="https://redirect.github.com/actions/setup-node/pull/1262">actions/setup-node#1262</a></li>
</ul>
<h2>New Contributors</h2>
<ul>
<li><a href="https://github.com/FloEdelmann"><code>@​FloEdelmann</code></a> made their first contribution in <a href="https://redirect.github.com/actions/setup-node/pull/98">actions/setup-node#98</a></li>
<li><a href="https://github.com/fregante"><code>@​fregante</code></a> made their first contribution in <a href="https://redirect.github.com/actions/setup-node/pull/1245">actions/setup-node#1245</a></li>
<li><a href="https://github.com/marco-ippolito"><code>@​marco-ippolito</code></a> made their first contribution in <a href="https://redirect.github.com/actions/setup-node/pull/1240">actions/setup-node#1240</a></li>
</ul>
<p><strong>Full Changelog</strong>: <a href="https://github.com/actions/setup-node/compare/v4...v4.4.0">https://github.com/actions/setup-node/compare/v4...v4.4.0</a></p>
<!-- raw HTML omitted -->
</blockquote>
<p>... (truncated)</p>
</details>
<details>
<summary>Commits</summary>
<ul>
<li><a href="https://github.com/actions/setup-node/commit/a0853c24544627f65ddf259abe73b1d18a591444"><code>a0853c2</code></a> Bump actions/checkout from 4 to 5 (<a href="https://redirect.github.com/actions/setup-node/issues/1345">#1345</a>)</li>
<li><a href="https://github.com/actions/setup-node/commit/b7234cc9fe124f0f4932554b4e5284543083ae7b"><code>b7234cc</code></a> Upgrade action to use node24 (<a href="https://redirect.github.com/actions/setup-node/issues/1325">#1325</a>)</li>
<li><a href="https://github.com/actions/setup-node/commit/d7a11313b581b306c961b506cfc8971208bb03f6"><code>d7a1131</code></a> Enhance caching in setup-node with automatic package manager detection (<a href="https://redirect.github.com/actions/setup-node/issues/1348">#1348</a>)</li>
<li><a href="https://github.com/actions/setup-node/commit/5e2628c959b9ade56971c0afcebbe5332d44b398"><code>5e2628c</code></a> Bumps form-data (<a href="https://redirect.github.com/actions/setup-node/issues/1332">#1332</a>)</li>
<li><a href="https://github.com/actions/setup-node/commit/65beceff8e91358525397bdce9103d999507ab03"><code>65becef</code></a> Bump undici from 5.28.5 to 5.29.0 (<a href="https://redirect.github.com/actions/setup-node/issues/1295">#1295</a>)</li>
<li><a href="https://github.com/actions/setup-node/commit/7e24a656e1c7a0d6f3eaef8d8e84ae379a5b035b"><code>7e24a65</code></a> Bump uuid from 9.0.1 to 11.1.0 (<a href="https://redirect.github.com/actions/setup-node/issues/1273">#1273</a>)</li>
<li><a href="https://github.com/actions/setup-node/commit/08f58d1471bff7f3a07d167b4ad7df25d5fcfcb6"><code>08f58d1</code></a> Bump <code>@​octokit/request-error</code> and <code>@​actions/github</code> (<a href="https://redirect.github.com/actions/setup-node/issues/1227">#1227</a>)</li>
<li>See full diff in <a href="https://github.com/actions/setup-node/compare/v4...v5">compare view</a></li>
</ul>
</details>
<br />


[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=actions/setup-node&package-manager=github_actions&previous-version=4&new-version=5)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

Dependabot will resolve any conflicts with this PR as long as you don't alter it yourself. You can also trigger a rebase manually by commenting .

[//]: # (dependabot-automerge-start)
[//]: # (dependabot-automerge-end)

---

<details>
<summary>Dependabot commands and options</summary>
<br />

You can trigger Dependabot actions by commenting on this PR:
-  will rebase this PR
-  will recreate this PR, overwriting any edits that have been made to it
-  will merge this PR after your CI passes on it
-  will squash and merge this PR after your CI passes on it
-  will cancel a previously requested merge and block automerging
-  will reopen this PR if it is closed
-  will close this PR and stop Dependabot recreating it. You can achieve the same result by closing it manually
-  will show all of the ignore conditions of the specified dependency
-  will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)
-  will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)
-  will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)


</details>

**Merged by:** @sscarduzio

## v1.1.3 - 2025-09-17

### PR: #5 - chore(deps-dev): bump @types/node from 24.5.0 to 24.5.1

Bumps [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/node) from 24.5.0 to 24.5.1.
<details>
<summary>Commits</summary>
<ul>
<li>See full diff in <a href="https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/node">compare view</a></li>
</ul>
</details>
<br />


[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=@types/node&package-manager=npm_and_yarn&previous-version=24.5.0&new-version=24.5.1)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

Dependabot will resolve any conflicts with this PR as long as you don't alter it yourself. You can also trigger a rebase manually by commenting .

[//]: # (dependabot-automerge-start)
[//]: # (dependabot-automerge-end)

---

<details>
<summary>Dependabot commands and options</summary>
<br />

You can trigger Dependabot actions by commenting on this PR:
-  will rebase this PR
-  will recreate this PR, overwriting any edits that have been made to it
-  will merge this PR after your CI passes on it
-  will squash and merge this PR after your CI passes on it
-  will cancel a previously requested merge and block automerging
-  will reopen this PR if it is closed
-  will close this PR and stop Dependabot recreating it. You can achieve the same result by closing it manually
-  will show all of the ignore conditions of the specified dependency
-  will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)
-  will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)
-  will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)


</details>

**Merged by:** @sscarduzio

