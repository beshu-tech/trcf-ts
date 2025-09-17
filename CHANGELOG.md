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

