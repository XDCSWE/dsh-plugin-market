// Validate the built index with the same format-1 validator the Host uses.
import { readFileSync } from 'node:fs'

const moduleUrl =
  'file:///C:/Users/admin/.dsh/profiles/desktop/node_modules/@deepseek-ai/dsh-plugin-market-index/lib/index.js'
const { parseMarketIndex, marketInstallTarget } = await import(moduleUrl)

const indexUrl = process.argv[2] ?? 'http://127.0.0.1:8788/index.json'
const document = JSON.parse(readFileSync('E:/GONGZUO/dsh-plugin-market/index.json', 'utf8'))
const parsed = parseMarketIndex(document, indexUrl)

console.log('title:', parsed.title.en, '/', parsed.title.zh)
console.log('categories:', Object.keys(parsed.metadata.categories).join(', '))
console.log('labels:', Object.keys(parsed.metadata.labels).join(', '))
console.log('plugins:', parsed.plugins.length)
for (const plugin of parsed.plugins) {
  const version = plugin.versions[0]
  const target = marketInstallTarget(plugin.name, version)
  console.log(
    [
      plugin.name.padEnd(34),
      version.version.padEnd(9),
      plugin.metadata.category.padEnd(14),
      target.spec,
    ].join(' '),
  )
}
console.log('validated OK')
