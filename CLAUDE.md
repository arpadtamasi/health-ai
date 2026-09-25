# health-ai

## Tooling

This repo has three AI workflow toolkits committed under `.claude/`.

### OpenSpec (spec-driven changes)

- Specs live in `openspec/specs/`, in-flight changes in `openspec/changes/`.
- Workflow: `/opsx:propose` → `/opsx:apply` → `/opsx:archive` (also `/opsx:explore`, `/opsx:update`, `/opsx:sync`).
- CLI: `npm install -g @fission-ai/openspec` (optional; the skills work without it for most steps).

### Impeccable (frontend design)

- Skill: `.claude/skills/impeccable/`, agents in `.claude/agents/impeccable-*.md`.
- Hooks in `.claude/settings.json` run the design detector after Edit/Write and on Stop.
- Start with `/impeccable init` (writes `PRODUCT.md`), then `/impeccable <command> <target>`.

### gstack (vendored)

gstack is vendored at `.claude/skills/gstack/`; each skill is exposed via a relative
symlink in `.claude/skills/` (e.g. `.claude/skills/review -> gstack/review`).
Use `.claude/skills/gstack/...` for gstack file paths.

Skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/plan-devex-review, /autoplan, /design-consultation, /design-shotgun, /design-html,
/design-review, /review, /investigate, /ship, /land-and-deploy, /canary, /benchmark,
/qa, /qa-only, /browse, /scrape, /cso, /retro, /document-release, /document-generate,
/careful, /freeze, /guard, /unfreeze, /learn, and more.

Browser-based skills (/browse, /qa, /design-review, /make-pdf, ...) need the compiled
browser, which is not committed. Build it once per machine with
`cd .claude/skills/gstack && ./setup` (requires Bun).

Never use `mcp__claude-in-chrome__*` tools; use /browse for web browsing.

To update gstack: replace `.claude/skills/gstack/` with a fresh copy of
https://github.com/garrytan/gstack (without `.git`, `test/`, `.github/`) and re-create
the symlinks for any new skill directories.
