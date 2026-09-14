# Research Notes — GitHub Profile README V4

Date: 2026-09-14
Target profile: `ihyaabrar`

## 1. What the public GitHub profile currently exposes

The public profile currently presents Ihya' Nashirudin Abrar as an Informatics Student / Developer focused on AI, Data, and Web Development. The public profile snapshot observed during research showed:

- 23 public repositories
- 3 followers
- 5 following
- Indonesia
- PT. Dimentorin Aja
- Website: `https://gerai-bkmt.vercel.app/`
- Pinned repositories:
  - MediCode — TypeScript
  - catetin-app — TypeScript
  - scannin-lah — TypeScript
  - SuperPDF — Python
  - Planer — JavaScript
  - Gerai_BKMT — TypeScript

These counts can change. The repository therefore treats them only as bootstrap data and refreshes live values through GitHub APIs.

Source: `https://github.com/ihyaabrar`

## 2. Native GitHub README capabilities worth using in 2026

GitHub profile READMEs are rendered with GitHub Flavored Markdown plus a supported subset of HTML. GitHub's own documentation specifically demonstrates using the HTML `<picture>` element with `prefers-color-scheme` so a README can serve different assets for dark and light themes.

Decision: every major visual card in V4 has both dark and light local SVG versions and is loaded with `<picture>`.

Source: `https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github`

## 3. GitHub API choices

### REST API

GitHub currently supports REST API version `2026-03-10`. V4 explicitly sends:

```text
X-GitHub-Api-Version: 2026-03-10
```

The generator uses public user and repository endpoints for:

- public repository count
- followers / following
- repository star and fork totals
- repository language bytes

Source: `https://docs.github.com/en/rest/about-the-rest-api/api-versions?apiVersion=2026-03-10`

### GraphQL API

GitHub GraphQL exposes `ContributionsCollection` and `contributionCalendar`, including contribution weeks/days and totals for commits, issues, pull requests, and reviews.

V4 uses those fields to render its own contribution calendar and streak statistics. If GraphQL access fails, the README still renders because the previously committed SVG assets stay in place.

Source: `https://docs.github.com/en/graphql/reference/users`

## 4. GitHub Actions platform changes relevant in 2026

GitHub Actions has moved current JavaScript actions to Node.js 24-generation runtimes. At the time of this rebuild:

- `actions/checkout` has a v7 line.
- `actions/setup-node` has a v7 line.
- `setup-node@v7` supports explicitly selecting Node.js 24.

V4 therefore uses:

```yaml
uses: actions/checkout@v7
uses: actions/setup-node@v7
node-version: "24"
```

The generator itself has no npm runtime dependencies; it uses Node's built-in `fetch`, `fs`, `path`, and standard JavaScript APIs. This minimizes supply-chain and breakage risk.

Sources:

- `https://github.com/actions/checkout/blob/main/CHANGELOG.md`
- `https://github.com/actions/setup-node`

## 5. Scheduled refreshes

GitHub Actions schedule syntax supports POSIX cron and can use an IANA timezone. V4 schedules a daily refresh at 07:17 Asia/Jakarta rather than exactly on the hour.

Source: `https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax`

## 6. GITHUB_TOKEN permissions

The generated SVGs are committed back to the profile repository, so the refresh workflow requests only:

```yaml
permissions:
  contents: write
```

GitHub documents that workflow `permissions` can be used to grant the minimum required scope, although repository or organization policy can still restrict write access.

Sources:

- `https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax`
- `https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository`

## 7. Third-party profile tooling reviewed

### lowlighter/metrics

Still active and highly capable. It supports many plugins and can generate rich SVG profile infographics. Its current release line remains active in 2026.

Source: `https://github.com/lowlighter/metrics`

### Platane/snk

Still active and supports generation of contribution-snake SVG/GIF assets via GitHub Actions, including dark/light variants.

Source: `https://github.com/Platane/snk`

### Why V4 does not make either a core dependency

Both are useful, but the earlier profile versions failed because important README visuals depended on assets or external services that were not guaranteed to exist at render time. V4 therefore uses a stricter rule:

> The primary profile must remain fully renderable using files already committed in this repository.

Third-party generators can be added later as optional enhancements, but they should never be required for the main profile layout.

## 8. Architecture selected for V4

V4 uses a hybrid static + self-generated architecture:

1. **Static local SVGs**
   - hero
   - tech stack
   - pinned projects
   - footer

2. **Generated local SVGs**
   - GitHub overview
   - language signal
   - contribution activity
   - developer signal

3. **Self-owned generator**
   - `scripts/generate-profile.mjs`
   - GitHub REST API `2026-03-10`
   - GitHub GraphQL API
   - no npm dependencies

4. **Automatic refresh**
   - `actions/checkout@v7`
   - `actions/setup-node@v7`
   - Node.js 24
   - daily schedule + manual dispatch

5. **Fail-safe bootstrapping**
   - generated SVGs are included in the ZIP before upload
   - if the first Action never runs, there are still no broken images
   - if an API refresh fails later, previous committed assets remain valid

## 9. Design direction

The visual language intentionally follows a modern developer-dashboard / bento style rather than the older collection-of-badges pattern:

- deep navy base
- indigo → violet gradient accent
- cyan/green secondary signals
- thin borders and large rounded cards
- strong information hierarchy
- no decorative badge wall
- responsive dark/light variants
- minimal text around visual panels

The goal is to feel like a compact personal product dashboard while still respecting GitHub README constraints.

## 10. Risk analysis

| Risk | V4 mitigation |
|---|---|
| Public stats service is paused | No public stats image provider is used |
| Action has not run yet | Bootstrap generated SVGs already exist |
| GraphQL contribution query fails | Existing contribution SVG remains renderable |
| Repository language endpoint fails for one repo | Generator skips that repo and continues |
| GitHub dark/light theme | `<picture>` serves separate local assets |
| GitHub token cannot push | README remains valid; only live refresh stops |
| Third-party SVG host changes | Core visuals have no remote image dependency |
| Dependency upgrade breaks npm package | Generator has no npm dependencies |

## 11. What “latest technology” means here

For a GitHub profile README, using the newest visual service is less important than using current GitHub-native primitives reliably. V4 therefore prioritizes:

- current GitHub REST API versioning
- GraphQL contribution data
- current GitHub Actions major versions
- Node.js 24 workflow runtime
- native `<picture>` theme switching
- self-generated, repository-owned SVG assets
- dependency-minimal automation

That is more maintainable than stacking many public badge/stat endpoints that can disappear independently.
