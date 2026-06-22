This project is a tool that helps developers to understand where all their Claude Code assets reside. For example, 
different projects can have different claude.md files, similarly, it looks for skills that are scattered.

The primary tool is a generator that looks at the ~/.claude directory, and uses it to determine where projects live.
The generator then builds a directory containing the source for a locally hosted web app that describes the 
various assets by type.  clicking on an asset in the listing opens a page with the file contents displayed in HTML.


