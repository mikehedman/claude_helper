# Claude Helper — Implementation Plan

## Context

The project (`/Users/mike/dev/node/claude_helper`) is a skeleton Node.js app with only a `package.json` and `project.md`. The goal is to build a CLI generator that:
1. Scans `~/.claude` and project directories for Claude Code assets (CLAUDE.md files, skills, memory, plans, settings)
2. Writes a static HTML site to an `output/` directory
3. User opens `output/index.html` directly in their browser via File > Open — no server needed

---

## Architecture

```
claude_helper/
├── index.js          # CLI entry point — runs scanner, generates site, prints output path
├── scanner.js        # Discovers all Claude assets from ~/.claude and project dirs
├── generator.js      # Writes index.html + one detail page per asset into output/
└── output/           # Generated (gitignored) — open index.html here
```

No build step, no server, no dependencies except `marked` for Markdown→HTML. Plain CommonJS.

---

## Dependencies

```
npm install marked
```

---

## Asset Types

| Type | Location |
|------|----------|
| `skill` | `~/.claude/skills/*.md` |
| `memory` | `~/.claude/projects/*/memory/*.md` |
| `plan` | `~/.claude/plans/*.md` |
| `claude-md` | Decoded project paths from `~/.claude/projects/<encoded>/` → look for `CLAUDE.md` |
| `settings` | `~/.claude/settings.json`, `~/.claude/settings.local.json` |

Path decoding: `-Users-mike-dev-foo` → `/Users/mike/dev/foo`

---

## Output

- `output/index.html` — assets grouped by type, each links to a detail page
- `output/assets/<slug>.html` — file contents rendered (Markdown→HTML, JSON→`<pre>`, text→`<pre>`)
- CSS embedded inline, no external files
