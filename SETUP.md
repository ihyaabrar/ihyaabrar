# Setup Guide — GitHub Profile V4

Target repository: **`ihyaabrar/ihyaabrar`**

## 1. Upload the complete package

Copy the contents of this folder to the root of the profile repository.

Required structure:

```text
README.md
SETUP.md
assets/
data/
scripts/
docs/
.github/workflows/
```

Do **not** upload only `README.md`. The README intentionally references local files under `assets/`.

## 2. Commit to `main`

The package includes already-renderable bootstrap SVGs, so the profile should display immediately after the commit even before any workflow finishes.

## 3. Run the first live refresh

Open:

```text
Repository → Actions → Profile Refresh → Run workflow
```

The refresh will:

1. read current GitHub public profile data,
2. fetch public repository metadata,
3. aggregate repository language bytes,
4. query the rolling contribution calendar through GraphQL,
5. regenerate dark/light SVG cards,
6. validate the README assets,
7. commit only the generated data/assets if anything changed.

## 4. Workflow permissions

The workflow declares:

```yaml
permissions:
  contents: write
```

If GitHub still blocks the commit, check:

```text
Repository → Settings → Actions → General → Workflow permissions
```

Repository or organization policy can override what the workflow requests.

## 5. Optional private-contribution visibility

The default `GITHUB_TOKEN` is used for normal public data.

If you want the contribution query to include data that requires additional user-level authorization, create a carefully scoped token and store it as:

```text
PROFILE_TOKEN
```

The script automatically prefers `PROFILE_TOKEN` when present and falls back to `GITHUB_TOKEN` otherwise.

Do not give the token more permissions than necessary.

## 6. Daily update

The package schedules the refresh at:

```text
07:17 Asia/Jakarta
```

It can also be run manually at any time.

## 7. Local validation

With Node.js installed:

```bash
node scripts/build-static.mjs
node scripts/build-extra-static.mjs
node scripts/generate-profile.mjs --offline
node scripts/validate.mjs
```

`--offline` uses `data/profile-seed.json` and never needs GitHub API access.

A live local refresh can be run with a token:

```bash
PROFILE_USERNAME=ihyaabrar GITHUB_TOKEN=... node scripts/generate-profile.mjs
```

## 8. Editing the profile

### Change biography / text

Edit `README.md`.

### Change colors / hero

Edit:

- `scripts/build-static.mjs`
- `scripts/build-extra-static.mjs`

Then regenerate the static assets.

### Change bootstrap data

Edit:

```text
data/profile-seed.json
```

Then run:

```bash
node scripts/generate-profile.mjs --offline
```

### Change automatic statistics

Edit:

```text
scripts/generate-profile.mjs
```

## 9. Why there is no third-party stats-card URL

This is deliberate. Earlier iterations showed blank or broken cards when an external image service or a not-yet-generated file was unavailable.

V4 keeps all core images inside the profile repository. GitHub APIs provide data; this repository itself renders the cards.
