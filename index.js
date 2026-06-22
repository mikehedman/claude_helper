'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { scanAssets } = require('./scanner')
const { generateSite } = require('./generator')

const outputDir = path.join(__dirname, 'output')

async function pickClaudeDir() {
  const home = process.env.HOME
  const dirs = fs.readdirSync(home)
    .filter(e => e.startsWith('.claude') && fs.statSync(path.join(home, e)).isDirectory())
    .sort()

  if (dirs.length === 0) {
    console.error('No ~/.claude* directories found.')
    process.exit(1)
  }

  if (dirs.length === 1) return path.join(home, dirs[0])

  console.log('\nFound Claude directories:')
  dirs.forEach((d, i) => console.log(`  ${i + 1}) ~/${d}`))

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(`\nSelect [1-${dirs.length}] (default 1): `, answer => {
      rl.close()
      const idx = parseInt(answer) - 1
      const chosen = dirs[(isNaN(idx) || idx < 0 || idx >= dirs.length) ? 0 : idx]
      resolve(path.join(home, chosen))
    })
  })
}

async function main() {
  const selectMode = process.argv.includes('--select')
  const claudeDir = selectMode
    ? await pickClaudeDir()
    : path.join(process.env.HOME, '.claude')

  const displayDir = claudeDir.replace(process.env.HOME, '~')
  console.log(`Scanning ${displayDir} for assets...`)
  const assets = scanAssets(claudeDir)
  console.log(`Found ${assets.length} assets. Generating site...`)

  generateSite(assets, outputDir, claudeDir)

  const indexPath = path.join(outputDir, 'index.html')
  console.log(`\nDone! Open in your browser:\n\n  ${indexPath}\n`)
}

main()
