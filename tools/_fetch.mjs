// Fetch the npm manifests for the curated market entries and record the fields the
// index builder needs. Writes tools/_meta.json (UTF-8, no BOM).
import { writeFileSync } from 'node:fs'

const names = [
  'dsh-context',
  'dsh-cost-meter',
  '@michengai/dsh-archive-manager',
  'dsh-unlag',
  'dsh-claude-style',
  'dsh-whale-widget',
  'dsh-pet',
  'dsh-plugin-wallpaper-engine',
  'dsh-free-search',
  'dsh-image-gen',
  'dsh-mnemon',
  'meow-memory',
  'dsh-mcp-connector',
  '@tencent-connect/dsh-qqbot',
  'dsh-mobile',
  'dsh-remote',
  'dsh-builtin-browser',
  '@michengai/dsh-skills-manager',
]

const repoUrl = (value) => {
  const raw = typeof value === 'string' ? value : value?.url
  if (typeof raw !== 'string') return undefined
  const cleaned = raw
    .replace(/^git\+/, '')
    .replace(/\.git$/, '')
    .replace(/^git:\/\//, 'https://')
  return /^https?:\/\//.test(cleaned) ? cleaned : undefined
}

const out = []
for (const name of names) {
  const response = await fetch(`https://registry.npmjs.org/${name}`, {
    headers: { accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`)
  const document = await response.json()
  const version = document['dist-tags'].latest
  const manifest = document.versions[version]
  const author =
    typeof manifest.author === 'string'
      ? manifest.author
      : manifest.author?.name ?? manifest.publisher ?? undefined
  out.push({
    name,
    version,
    published: document.time[version],
    description: manifest.description ?? '',
    homepage: /^https?:\/\//.test(manifest.homepage ?? '') ? manifest.homepage : undefined,
    repository: repoUrl(manifest.repository),
    author,
    license: manifest.license,
    bundle: Boolean(manifest.dsh?.bundle),
    enginesDsh: manifest.engines?.dsh ?? undefined,
    peers: Object.fromEntries(
      Object.entries(manifest.peerDependencies ?? {}).filter(
        ([key]) => key === '@deepseek-ai/dsh' || key.startsWith('@deepseek-ai/dsh-'),
      ),
    ),
  })
  console.log('ok', name, version)
}

writeFileSync(
  new URL('./_meta.json', import.meta.url),
  `${JSON.stringify(out, null, 2)}\n`,
  'utf8',
)
console.log('wrote', out.length, 'entries')
