'use strict'

const fs = require('fs')
const path = require('path')

const CLAUDE_DIR = path.join(process.env.HOME, '.claude')

function glob(dir, ext) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(ext))
    .map(f => path.join(dir, f))
}

function decodeProjDir(dirName) {
  // "-Users-mike-dev-foo" → "/Users/mike/dev/foo"
  return dirName.replace(/^-/, '/').replace(/-/g, '/')
}

function scanAssets() {
  const assets = []

  // Skills
  const skillsDir = path.join(CLAUDE_DIR, 'skills')
  for (const fp of glob(skillsDir, '.md')) {
    assets.push({ type: 'skill', name: path.basename(fp, '.md'), filePath: fp })
  }

  // Plans
  const plansDir = path.join(CLAUDE_DIR, 'plans')
  for (const fp of glob(plansDir, '.md')) {
    assets.push({ type: 'plan', name: path.basename(fp, '.md'), filePath: fp })
  }

  // Settings
  for (const fname of ['settings.json', 'settings.local.json']) {
    const fp = path.join(CLAUDE_DIR, fname)
    if (fs.existsSync(fp)) {
      assets.push({ type: 'settings', name: fname, filePath: fp })
    }
  }

  // Project memory files and CLAUDE.md
  const projectsDir = path.join(CLAUDE_DIR, 'projects')
  if (fs.existsSync(projectsDir)) {
    for (const dirName of fs.readdirSync(projectsDir)) {
      const projDir = path.join(projectsDir, dirName)
      if (!fs.statSync(projDir).isDirectory()) continue

      // Memory files — MEMORY.md becomes the clickable group header
      const memDir = path.join(projDir, 'memory')
      if (fs.existsSync(memDir)) {
        const projPath = decodeProjDir(dirName)
        for (const fp of glob(memDir, '.md')) {
          const isIndex = path.basename(fp) === 'MEMORY.md'
          assets.push({ type: 'memory', name: path.basename(fp, '.md'), filePath: fp, project: projPath, isIndex })
        }
      }

      // CLAUDE.md in the actual project directory
      const projPath = decodeProjDir(dirName)
      const claudeMd = path.join(projPath, 'CLAUDE.md')
      if (fs.existsSync(claudeMd)) {
        assets.push({ type: 'claude-md', name: projPath, filePath: claudeMd })
      }
    }
  }

  return assets
}

module.exports = { scanAssets }
