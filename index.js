'use strict'

const path = require('path')
const { scanAssets } = require('./scanner')
const { generateSite } = require('./generator')

const outputDir = path.join(__dirname, 'output')

console.log('Scanning ~/.claude for assets...')
const assets = scanAssets()
console.log(`Found ${assets.length} assets. Generating site...`)

generateSite(assets, outputDir)

const indexPath = path.join(outputDir, 'index.html')
console.log(`\nDone! Open in your browser:\n\n  ${indexPath}\n`)
