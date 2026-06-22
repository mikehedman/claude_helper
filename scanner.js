'use strict'

const fs = require('fs')
const path = require('path')

const DEFAULT_CLAUDE_DIR = path.join(process.env.HOME, '.claude')

function glob(dir, ext) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(ext))
    .map(f => path.join(dir, f))
}

// Claude encodes paths by replacing '/' with '-', which is lossy: a dash in an
// encoded name could be a path separator OR a literal dash in a directory name.
// We resolve the ambiguity by walking the real filesystem: accumulate dash-joined
// segments into a candidate component and recurse when a real directory is found.
// Falls back to naive decode when the path doesn't exist locally (other machines).
function resolveSegments(base, segs) {
  if (segs.length === 0) return base
  try { if (!fs.statSync(base).isDirectory()) return null } catch { return null }
  let current = ''
  for (let i = 0; i < segs.length; i++) {
    current = current ? current + '-' + segs[i] : segs[i]
    const candidate = path.join(base, current)
    let isDir = false
    try { isDir = fs.statSync(candidate).isDirectory() } catch { /* skip */ }
    if (isDir) {
      if (i === segs.length - 1) return candidate
      const result = resolveSegments(candidate, segs.slice(i + 1))
      if (result !== null) return result
    }
  }
  return null
}

function decodeProjDir(dirName) {
  const home = process.env.HOME
  const encodedHome = home.slice(1).replace(/\//g, '-')  // "/Users/tony.hoff" → "Users-tony.hoff"
  const prefix = '-' + encodedHome
  if (dirName === prefix) return home
  if (dirName.startsWith(prefix + '-')) {
    const segs = dirName.slice(prefix.length + 1).split('-')
    return resolveSegments(home, segs) || home + '/' + segs.join('/')
  }
  return dirName.replace(/^-/, '/').replace(/-/g, '/')
}

function scanAssets(claudeDir = DEFAULT_CLAUDE_DIR) {
  const assets = []

  // Skills — each skill is a subdirectory containing SKILL.md
  const skillsDir = path.join(claudeDir, 'skills')
  if (fs.existsSync(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir)) {
      const skillMd = path.join(skillsDir, entry, 'SKILL.md')
      if (fs.existsSync(skillMd)) {
        assets.push({ type: 'skill', name: entry, filePath: skillMd })
      }
    }
  }

  // Plans
  const plansDir = path.join(claudeDir, 'plans')
  for (const fp of glob(plansDir, '.md')) {
    assets.push({ type: 'plan', name: path.basename(fp, '.md'), filePath: fp })
  }

  // Settings
  for (const fname of ['settings.json', 'settings.local.json']) {
    const fp = path.join(claudeDir, fname)
    if (fs.existsSync(fp)) {
      assets.push({ type: 'settings', name: fname, filePath: fp })
    }
  }

  // Proje`ct memory files and CLAUDE.md
  const projectsDir = path.join(claudeDir, 'projects')
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
