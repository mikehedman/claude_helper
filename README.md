# Claude Helper

A static site generator that scans your `~/.claude` directory and produces an HTML browsable index of all your Claude Code assets.

## What it finds

| Type | Location |
|------|----------|
| CLAUDE.md files | Project directories linked from `~/.claude/projects/` |
| Skills | `~/.claude/skills/` |
| Memory | `~/.claude/projects/*/memory/` |
| Plans | `~/.claude/plans/` |
| Settings | `~/.claude/settings.json`, `~/.claude/settings.local.json` |

## Usage

```bash
npm install
npm start
```

Then open the printed path in your browser (File > Open):

```
/path/to/claude_helper/output/index.html
```

Re-run `npm start` any time to regenerate with the latest files.

## Output

The generator writes a static site to `output/`:

- `output/index.html` — all assets listed by type, each linking to a detail page
- `output/assets/*.html` — individual asset pages with rendered content (Markdown → HTML, JSON → formatted `<pre>`)
