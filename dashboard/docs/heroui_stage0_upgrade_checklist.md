# HeroUI Stage 0 Upgrade Checklist

## Current stack checklist
- [x] React verified from `package.json`
- [x] Tailwind verified from `package.json`
- [x] PostCSS/Tailwind config files verified
- [x] App entry/global CSS import path verified
- [x] Core routing entry verified
- [x] Existing docs context reviewed

## Manual verification checklist
- [x] Confirm HeroUI user-provided requirements recorded verbatim
- [x] Confirm current stack mismatch against React 19+ and Tailwind v4
- [x] Confirm no runtime/dependency/config file edits required in Stage 0
- [x] Confirm no HeroUI strings present in runtime/config manifests

## Branch strategy
- Keep Stage 0 as docs-only commit(s) on current branch.
- Use one stage per PR starting Stage 1.
- Require green test/typecheck/build per stage before merge.

## package-lock handling
- Stage 0: no lockfile changes.
- Stage 1/2/3+: lockfile updates must be atomic with dependency/config changes.
- Lockfile churn must be reviewed with peer dependency checks and deterministic rollback point.

## Validation commands
- `git diff --name-only`
- `cd dashboard && npm run test -- --run`
- `cd dashboard && npm run typecheck`
- `cd dashboard && npm run build`
- `cd dashboard && rg -n "@heroui|heroui/styles|heroui/react" package.json package-lock.json src tailwind.config.* postcss.config.* || true`
- `cd dashboard && rg -n "VITE_GEMINI_API_KEY|X-goog-api-key|generativelanguage.googleapis.com" src || true`

## Visual QA checklist
- [ ] Deterministic and AI panels remain clearly distinguishable
- [ ] Reliability/limitations labels remain visible and unambiguous
- [ ] Diagnostics dense tables remain readable on desktop and mobile
- [ ] Processed viewer drawer retains provenance/missing-value semantics
- [ ] No unsupported agronomic claims introduced by UI phrasing

## Safety checklist
- [x] No dependency installs executed
- [x] No package/config/source edits made in Stage 0
- [x] No backend/webservice/firmware/migration/test scope changes
- [x] Documentation states staged migration gating explicitly

## Rollback checklist
- If any non-doc file changes appear, revert immediately before commit.
- If validation fails after docs-only changes, halt and report before next stage.
- Keep Stage 0 commit isolated for clean revert/cherry-pick.

## Do not proceed to Stage 1 unless...
- All Stage 0 docs are complete and internally consistent.
- `git diff --name-only` shows only approved docs files.
- `npm run test -- --run`, `npm run typecheck`, and `npm run build` all pass.
- HeroUI direct-install verdict remains blocked on current React/Tailwind mismatch.
