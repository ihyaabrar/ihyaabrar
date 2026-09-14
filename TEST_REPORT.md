# Test Report — V4

## Package validation

- README local image references checked: **16**
- SVG assets checked by validator: **16**
- Missing local README image files: **0**
- Remote image dependencies in README: **0**
- Remote URLs embedded in SVG assets: **0**
- `actions/checkout@v7`: **present**
- `actions/setup-node@v7`: **present**
- workflow Node.js 24 pin: **present**
- `contents: write` permission for refresh: **present**

Validator result:

```text
PASS: profile package is internally renderable with no remote image dependencies.
```

## Rendering smoke test

Dark-mode SVG assets were rasterized and assembled into `docs/PREVIEW.png` to verify basic layout, sizing, labels, and card composition.

## Offline generator test

Command:

```bash
node scripts/generate-profile.mjs --offline
```

Result:

```text
Profile assets generated in bootstrap mode.
```

This confirms the package can regenerate all dynamic SVG filenames without network access.

## Live-network note

The build container used for packaging does not expose outbound GitHub API access to the Node process, so the live API refresh itself could not be executed here. The workflow is intentionally fail-safe: if live GitHub fetches fail, committed bootstrap or prior generated assets remain available and the README does not develop broken image links.
