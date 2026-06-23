# Claude Helper

A single-file browser app for browsing your Claude Code assets — skills, memory, plans, settings, and CLAUDE.md files.

## What it finds

| Type | Location |
|------|----------|
| CLAUDE.md files | Project directories linked from `~/.claude/projects/` |
| Skills | `~/.claude/skills/` and `<project>/.claude/skills/` |
| Memory | `~/.claude/projects/*/memory/` |
| Plans | `~/.claude/plans/` |
| Settings | `~/.claude/settings.json`, `~/.claude/settings.local.json` |

## Usage

Open `claude_helper.html` in Chrome or Edge. No install required.

**First run:**

1. Click **Open ~/.claude folder** and navigate to your `~/.claude` directory.
   - On a Mac, press `Cmd+Shift+.` in the picker to show dot files.
2. The app scans your projects and computes the shared root of your project directories (e.g. `~/dev`). It will prompt you to open that folder so it can also find `CLAUDE.md` files and project-level skills.

**After setup**, a **Refresh** button re-scans everything with no further prompts. Folder access is stored in the browser and persists across sessions.

Use the **Reset access** button to clear stored handles and start over.

## Promoting project skills

Project-level skills (under `<project>/.claude/skills/`) can be promoted to global skills (`~/.claude/skills/`). Open any project skill and click **Promote to global** in the modal header.

> Requires Chrome or Edge (uses the File System Access API).
