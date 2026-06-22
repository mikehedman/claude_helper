'use strict'

const fs = require('fs')
const path = require('path')
const { marked } = require('marked')

const TYPE_LABELS = {
  'skill': 'Skills',
  'plan': 'Plans',
  'settings': 'Settings',
  'memory': 'Memory',
  'claude-md': 'CLAUDE.md Files',
}

const TYPE_ORDER = ['claude-md', 'skill', 'memory', 'plan', 'settings']

function slugify(filePath) {
  return filePath.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderContent(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const raw = fs.readFileSync(filePath, 'utf8')
  if (ext === '.md') {
    let html = marked(raw)
    // Rewrite relative .md links to their generated detail page slugs
    const dir = path.dirname(filePath)
    html = html.replace(/href="([^"#?]+\.md)"/g, (match, href) => {
      if (/^https?:\/\//.test(href)) return match
      const abs = path.resolve(dir, href)
      return `href="${slugify(abs)}.html"`
    })
    return html
  }
  if (ext === '.json') {
    try {
      return `<pre>${escapeHtml(JSON.stringify(JSON.parse(raw), null, 2))}</pre>`
    } catch {
      return `<pre>${escapeHtml(raw)}</pre>`
    }
  }
  return `<pre>${escapeHtml(raw)}</pre>`
}

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; color: #222; }
  a { color: #0066cc; text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Index page */
  .index-wrap { max-width: 900px; margin: 40px auto; padding: 0 20px; }
  h1 { font-size: 1.8rem; margin-bottom: 8px; }
  .subtitle { color: #666; margin-bottom: 32px; }
  .section { margin-bottom: 32px; }
  .section h2 { font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em;
    color: #888; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px; }
  .asset-list { list-style: none; }
  .asset-list li { padding: 6px 0; border-bottom: 1px solid #eee; }
  .asset-list li:last-child { border-bottom: none; }
  .asset-name { font-weight: 500; }
  .asset-path { font-size: 0.8rem; color: #999; margin-left: 8px; font-family: monospace; }
  .empty { color: #aaa; font-style: italic; font-size: 0.9rem; }
  .project-group { margin-bottom: 14px; }
  .project-header { font-size: 0.82rem; font-family: monospace; color: #555; padding: 4px 0;
    border-bottom: 1px solid #e0e0e0; margin-bottom: 4px; }
  .memory-list { list-style: none; padding-left: 16px; }
  .memory-list li { padding: 4px 0; border-bottom: 1px solid #f0f0f0; }
  .memory-list li:last-child { border-bottom: none; }

  /* Detail page */
  .detail-wrap { max-width: 900px; margin: 40px auto; padding: 0 20px; }
  .back { margin-bottom: 20px; font-size: 0.9rem; }
  .meta { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px; }
  .meta .type-badge { display: inline-block; background: #e8f0fe; color: #1a56db; border-radius: 4px;
    padding: 2px 8px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
  .meta .asset-title { font-size: 1.2rem; font-weight: 600; word-break: break-all; }
  .meta .asset-filepath { font-size: 0.8rem; color: #888; margin-top: 4px; font-family: monospace; }
  .content { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 24px 28px; }
  .content pre { background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 4px;
    padding: 14px; overflow-x: auto; font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; word-break: break-all; }
  .content h1,.content h2,.content h3 { margin: 1em 0 .4em; }
  .content p { margin: .6em 0; line-height: 1.6; }
  .content ul,.content ol { margin: .6em 0 .6em 1.5em; }
  .content li { margin: .2em 0; }
  .content code { background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: .9em; }
  .content table { border-collapse: collapse; width: 100%; margin: .8em 0; }
  .content th,.content td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
  .content th { background: #f5f5f5; }
  .content blockquote { border-left: 3px solid #ccc; margin: .8em 0; padding: .4em 1em; color: #555; }
`

function memoryItems(list) {
  if (list.length === 0) return `<p class="empty">None found</p>`
  const byProject = {}
  const order = []
  for (const a of list) {
    const proj = a.project || '(unknown)'
    if (!byProject[proj]) { byProject[proj] = []; order.push(proj) }
    byProject[proj].push(a)
  }
  return order.map(proj => {
    const all = byProject[proj]
    const index = all.find(a => a.isIndex)
    const children = all.filter(a => !a.isIndex).map(a => {
      const slug = slugify(a.filePath)
      return `<li><a href="assets/${slug}.html">${escapeHtml(a.name)}</a></li>`
    }).join('\n')
    const header = index
      ? `<a href="assets/${slugify(index.filePath)}.html">${escapeHtml(index.filePath)}</a>`
      : escapeHtml(proj)
    return `<div class="project-group">
      <div class="project-header">${header}</div>
      <ul class="memory-list">${children}</ul>
    </div>`
  }).join('\n')
}

function indexHtml(assets, claudeDir) {
  const byType = {}
  for (const a of assets) {
    if (!byType[a.type]) byType[a.type] = []
    byType[a.type].push(a)
  }

  const sections = TYPE_ORDER.map(type => {
    const label = TYPE_LABELS[type] || type
    const list = byType[type] || []
    let items
    if (type === 'memory') {
      items = memoryItems(list)
    } else {
      items = list.length === 0
        ? `<p class="empty">None found</p>`
        : `<ul class="asset-list">${list.map(a => {
            const slug = slugify(a.filePath)
            return `<li><a class="asset-name" href="assets/${slug}.html">${escapeHtml(a.name)}</a><span class="asset-path">${escapeHtml(a.filePath)}</span></li>`
          }).join('\n')}</ul>`
    }
    return `<div class="section"><h2>${label}</h2>${items}</div>`
  }).join('\n')

  const total = assets.length
  const displayDir = claudeDir.replace(process.env.HOME, '~')
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Claude Helper</title>
<style>${CSS}</style>
</head>
<body>
<div class="index-wrap">
  <h1>Claude Helper</h1>
  <p class="subtitle">${total} asset${total !== 1 ? 's' : ''} found in <code>${escapeHtml(displayDir)}</code></p>
  ${sections}
</div>
</body>
</html>`
}

function detailHtml(asset) {
  const slug = slugify(asset.filePath)
  const typeLabel = TYPE_LABELS[asset.type] || asset.type
  let content
  try {
    content = renderContent(asset.filePath)
  } catch (err) {
    content = `<p style="color:red">Could not read file: ${escapeHtml(err.message)}</p>`
  }
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(asset.name)} — Claude Helper</title>
<style>${CSS}</style>
</head>
<body>
<div class="detail-wrap">
  <div class="back"><a href="../index.html">← Back to index</a></div>
  <div class="meta">
    <div class="type-badge">${escapeHtml(typeLabel)}</div>
    <div class="asset-title">${escapeHtml(asset.name)}</div>
    <div class="asset-filepath">${escapeHtml(asset.filePath)}</div>
  </div>
  <div class="content">${content}</div>
</div>
</body>
</html>`
}

function generateSite(assets, outputDir, claudeDir) {
  const assetsDir = path.join(outputDir, 'assets')

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true })
  }
  fs.mkdirSync(assetsDir, { recursive: true })

  fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml(assets, claudeDir), 'utf8')

  for (const asset of assets) {
    const slug = slugify(asset.filePath)
    fs.writeFileSync(path.join(assetsDir, `${slug}.html`), detailHtml(asset), 'utf8')
  }
}

module.exports = { generateSite }
