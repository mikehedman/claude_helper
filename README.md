# Claude Helper

Browses your Claude Code assets — skills, memory, plans, settings, and CLAUDE.md files. Two options: a Node.js static site generator, or a self-contained browser app.

## What it finds

| Type | Location |
|------|----------|
| CLAUDE.md files | Project directories linked from `~/.claude/projects/` |
| Skills | `~/.claude/skills/` and `<project>/.claude/skills/` |
| Memory | `~/.claude/projects/*/memory/` |
| Plans | `~/.claude/plans/` |
| Settings | `~/.claude/settings.json`, `~/.claude/settings.local.json` |

---

## Option 1 — Browser app (`claude_helper.html`)

Open `claude_helper.html` directly in Chrome or Edge. No install required.

**First run:**

1. Click **Open ~/.claude folder** and navigate to your `~/.claude` directory.
   - On a Mac, press `Cmd+Shift+.` in the picker to show dot files.
2. The app scans your projects and computes the shared root of your project directories (e.g. `~/dev`). It will prompt you to open that folder so it can also find `CLAUDE.md` files and project-level skills.

**After setup**, a **Refresh** button re-scans everything with no further prompts. Folder access is stored in the browser and persists across sessions.

Use the **Reset access** button to clear stored handles and start over.

> Requires Chrome or Edge (uses the File System Access API).

---

## Option 2 — Node.js generator

Generates a static site you can open in any browser.

```bash
npm install
npm start
```

Then open the printed path in your browser (File > Open):

```
/path/to/claude_helper/output/index.html
```

Re-run `npm start` any time to regenerate with the latest files.

### Multiple Claude directories

If you have more than one `~/.claude*` directory (e.g. `~/.claude` and `~/.claude-work`), use the `select` script to pick which one to scan:

```bash
npm run select
```

You'll see a numbered prompt:

```
Found Claude directories:
  1) ~/.claude
  2) ~/.claude-work

Select [1-2] (default 1):
```

Press Enter to accept the default, or type a number and press Enter.

### Output

The generator writes a static site to `output/`:

- `output/index.html` — all assets listed by type, each linking to a detail page
- `output/assets/*.html` — individual asset pages with rendered content (Markdown → HTML, JSON → formatted `<pre>`)
