// Build index.json and icons/ from the fetched manifests plus the curated copy below.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const meta = JSON.parse(readFileSync(join(here, '_meta.json'), 'utf8'))
const byName = new Map(meta.map((entry) => [entry.name, entry]))

const categories = {
  productivity: { title: { en: 'Productivity', zh: '效率工具' } },
  appearance: { title: { en: 'Appearance', zh: '外观主题' } },
  model: { title: { en: 'Model capabilities', zh: '模型能力' } },
  memory: { title: { en: 'Memory and context', zh: '记忆与上下文' } },
  integration: { title: { en: 'Integrations', zh: '集成连接' } },
  devtools: { title: { en: 'Developer tools', zh: '开发与自动化' } },
}

const labels = {
  ui: { title: { en: 'Interface', zh: '界面插件' } },
  'needs-setup': { title: { en: 'Needs setup', zh: '需配置' } },
}

const picks = [
  {
    name: 'dsh-context',
    slug: 'dsh-context',
    glyph: 'CX',
    color: '#4C6FFF',
    category: 'productivity',
    labels: ['ui'],
    title: { en: 'Context inspector', zh: '上下文仪表盘' },
    description: {
      en: 'A dashboard and a /context command that show how the prompt is assembled and how it changes turn by turn.',
      zh: '仪表盘与 /context 命令，看清提示词由哪些内容组成，以及它如何逐轮演变。',
    },
  },
  {
    name: 'dsh-cost-meter',
    slug: 'dsh-cost-meter',
    glyph: 'CM',
    color: '#16A34A',
    category: 'productivity',
    labels: ['ui'],
    title: { en: 'Cost meter', zh: '会话费用统计' },
    description: {
      en: 'Per-session and per-day spend with a built-in price catalog for 170+ models and subscription quota lookups.',
      zh: '统计本会话与当日花费，内置 170+ 模型价格目录，并支持订阅额度查询。',
    },
  },
  {
    name: '@michengai/dsh-archive-manager',
    slug: 'dsh-archive-manager',
    glyph: 'AR',
    color: '#8B5CF6',
    category: 'productivity',
    labels: ['ui'],
    title: { en: 'Session archive', zh: '会话归档管理' },
    description: {
      en: 'Archive, restore, favourite and permanently delete sessions, and diagnose damaged session logs.',
      zh: '归档、恢复、收藏与永久删除会话，还能诊断损坏的会话日志。',
    },
  },
  {
    name: 'dsh-unlag',
    slug: 'dsh-unlag',
    glyph: 'UL',
    color: '#F59E0B',
    category: 'productivity',
    labels: ['ui'],
    title: { en: 'Reload button', zh: '一键刷新' },
    description: {
      en: 'Reload plugins and recover a slow interface without restarting the app, leaving running sessions untouched.',
      zh: '改完插件或界面变卡时一键重载，无需重启应用，正在进行的会话不受影响。',
    },
  },
  {
    name: 'dsh-claude-style',
    slug: 'dsh-claude-style',
    glyph: 'CS',
    color: '#D97706',
    category: 'appearance',
    labels: ['ui'],
    title: { en: 'Claude-style theme', zh: 'Claude 风格主题' },
    description: {
      en: 'A Claude Code Desktop flavoured theme and interaction overhaul for the web interface.',
      zh: '把 Web 界面换成 Claude Code 桌面版的配色、排版与交互风格。',
    },
  },
  {
    name: 'dsh-whale-widget',
    slug: 'dsh-whale-widget',
    glyph: 'WW',
    color: '#0EA5E9',
    category: 'appearance',
    labels: ['ui'],
    title: { en: 'Balance whale', zh: '余额小鲸鱼' },
    description: {
      en: 'A corner widget showing DeepSeek balance, usage today and peak/off-peak pricing, with custom lines and sounds.',
      zh: '右下角的小鲸鱼挂件：显示余额、今日已用与峰谷定价，气泡台词和音效都能自定义。',
    },
  },
  {
    name: 'dsh-pet',
    slug: 'dsh-pet',
    glyph: 'PT',
    color: '#38BDF8',
    category: 'appearance',
    labels: ['ui'],
    title: { en: 'Desktop fish', zh: '桌面宠物' },
    description: {
      en: 'A blue fish that wanders the interface, naps, reacts to your session and nudges you about your balance.',
      zh: '赖在界面里的蓝色大肥鱼：会溜达、会打盹，跟着会话忙前忙后。',
    },
  },
  {
    name: 'dsh-plugin-wallpaper-engine',
    slug: 'dsh-wallpaper-engine',
    glyph: 'WE',
    color: '#7C3AED',
    category: 'appearance',
    labels: ['ui'],
    title: { en: 'Wallpaper Engine', zh: '壁纸引擎背景' },
    description: {
      en: 'Render local Wallpaper Engine scenes and videos behind the chat, with adjustable liquid-glass blur.',
      zh: '把本机 Wallpaper Engine 的场景、网页和视频壁纸铺到聊天背景，模糊程度可调。',
    },
  },
  {
    name: 'dsh-free-search',
    slug: 'dsh-free-search',
    glyph: 'FS',
    color: '#059669',
    category: 'model',
    labels: ['needs-setup'],
    title: { en: 'Free web search', zh: '免费联网搜索' },
    description: {
      en: 'Web search across 27 engines — Bing, DuckDuckGo, SearXNG, Tavily, Exa and more — mostly without an API key.',
      zh: '接入 27 个搜索引擎的联网搜索（Bing、DuckDuckGo、SearXNG、Tavily、Exa 等），多数无需 API Key。',
    },
  },
  {
    name: 'dsh-image-gen',
    slug: 'dsh-image-gen',
    glyph: 'IG',
    color: '#DB2777',
    category: 'model',
    labels: ['ui', 'needs-setup'],
    title: { en: 'Image generation', zh: '图像生成' },
    description: {
      en: 'Generate images from the chat box through Gemini, OpenAI, Seedream, DashScope or a local ComfyUI.',
      zh: '在对话框里直接生成图片，支持 Gemini、OpenAI、Seedream、DashScope 与本地 ComfyUI。',
    },
  },
  {
    name: 'dsh-mnemon',
    slug: 'dsh-mnemon',
    glyph: 'MN',
    color: '#2563EB',
    category: 'memory',
    labels: [],
    title: { en: 'Composable context', zh: '可组合上下文' },
    description: {
      en: 'View-based context with pluggable sources and strategies, layered memory and self-evolving skills.',
      zh: '视图式上下文：可插拔的记忆来源与策略，分层记忆并自带可自演化的技能。',
    },
  },
  {
    name: 'meow-memory',
    slug: 'meow-memory',
    glyph: 'MM',
    color: '#F97316',
    category: 'memory',
    labels: [],
    title: { en: 'Project memory', zh: '项目记忆' },
    description: {
      en: 'Cross-session project memory on SQLite, with automatic reflection and idle-time consolidation.',
      zh: '基于 SQLite 的跨会话项目记忆，自动反思并在空闲时整理归纳。',
    },
  },
  {
    name: 'dsh-mcp-connector',
    slug: 'dsh-mcp-connector',
    glyph: 'MC',
    color: '#0891B2',
    category: 'integration',
    labels: ['ui'],
    title: { en: 'MCP connector', zh: 'MCP 连接器' },
    description: {
      en: 'Connect MCP servers over stdio or Streamable HTTP, search tools across connections and troubleshoot discovery.',
      zh: '连接 stdio 或 Streamable HTTP 的 MCP 服务器，跨连接搜索工具并排查发现失败。',
    },
  },
  {
    name: '@tencent-connect/dsh-qqbot',
    slug: 'dsh-qqbot',
    glyph: 'QQ',
    color: '#1E40AF',
    category: 'integration',
    labels: ['needs-setup'],
    title: { en: 'QQ bot', zh: 'QQ 机器人' },
    description: {
      en: 'Talk to DeepSeek Harness from QQ private chats and group chats.',
      zh: '在 QQ 私聊和群聊里直接对话 DeepSeek Harness。',
    },
  },
  {
    name: 'dsh-mobile',
    slug: 'dsh-mobile',
    glyph: 'MB',
    color: '#0D9488',
    category: 'integration',
    labels: ['ui', 'needs-setup'],
    title: { en: 'Mobile access', zh: '移动端访问' },
    description: {
      en: 'Phone and remote access for DSH over LAN, Tailscale, frp or a reverse proxy.',
      zh: '为手机和远程访问做适配：局域网、Tailscale、frp、反向代理都能连。',
    },
  },
  {
    name: 'dsh-remote',
    slug: 'dsh-remote',
    glyph: 'RM',
    color: '#475569',
    category: 'devtools',
    labels: ['ui', 'needs-setup'],
    title: { en: 'SSH remote work', zh: 'SSH 远程协作' },
    description: {
      en: 'Connect SSH hosts, pick a remote workspace and work there through 22 rw_* tools with mirrored sync.',
      zh: '连接 SSH 主机、选择远程工作区，用 22 个 rw_* 工具操作并双向同步修改。',
    },
  },
  {
    name: 'dsh-builtin-browser',
    slug: 'dsh-builtin-browser',
    glyph: 'BR',
    color: '#9333EA',
    category: 'devtools',
    labels: [],
    title: { en: 'Real browser', zh: '真实浏览器' },
    description: {
      en: 'A visible Chromium the agent drives over CDP, with human takeover and persistent cookies.',
      zh: '给 Agent 一个真实可见的 Chromium，通过 CDP 驱动，人可随时接管，Cookie 可持久化。',
    },
  },
  {
    name: '@michengai/dsh-skills-manager',
    slug: 'dsh-skills-manager',
    glyph: 'SM',
    color: '#65A30D',
    category: 'devtools',
    labels: ['ui'],
    title: { en: 'Skills manager', zh: '技能管理器' },
    description: {
      en: 'Load and safely manage the local Agent Skills of this machine from one place.',
      zh: '在一处统一加载并安全管理本机的 Agent 技能。',
    },
  },
]

const shade = (hex, factor) => {
  const value = Number.parseInt(hex.slice(1), 16)
  const channel = (shift) => Math.round(((value >> shift) & 0xff) * factor)
  return `#${[channel(16), channel(8), channel(0)]
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('')}`
}

const icon = ({ glyph, color, title }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${title.en}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}"/>
      <stop offset="1" stop-color="${shade(color, 0.7)}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g)"/>
  <circle cx="50" cy="13" r="11" fill="#ffffff" opacity="0.12"/>
  <circle cx="14" cy="52" r="8" fill="#000000" opacity="0.08"/>
  <text x="32" y="41" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="24" font-weight="700" letter-spacing="0.5" fill="#ffffff">${glyph}</text>
</svg>
`

mkdirSync(join(root, 'icons'), { recursive: true })

const plugins = picks.map((pick) => {
  const entry = byName.get(pick.name)
  if (!entry) throw new Error(`missing metadata for ${pick.name}`)
  if (!entry.bundle) throw new Error(`${pick.name} does not declare dsh.bundle`)
  writeFileSync(join(root, 'icons', `${pick.slug}.svg`), icon(pick), 'utf8')

  const version = {
    version: entry.version,
    publishTimestamp: Math.floor(Date.parse(entry.published) / 1000),
    source: { type: 'npm' },
  }
  if (entry.enginesDsh) version.engines = { dsh: entry.enginesDsh }

  const plugin = {
    name: entry.name,
    title: pick.title,
    description: pick.description,
    icon: `icons/${pick.slug}.svg`,
    versions: [version],
    metadata: { category: pick.category, labels: pick.labels },
  }
  if (entry.author) plugin.author = entry.author
  if (entry.homepage) plugin.homepage = entry.homepage
  if (entry.repository) plugin.repository = { url: entry.repository }
  return plugin
})

const index = {
  format: 1,
  title: { en: 'DSH Community Picks', zh: 'DSH 社区精选' },
  description: {
    en: 'Eighteen community bundles checked as installable on dsh 0.2.1-rc.5. Third-party packages: review the source before installing.',
    zh: '18 个已核对可在 dsh 0.2.1-rc.5 上安装的社区组合包。第三方包，安装前请先核对来源。',
  },
  metadata: { categories, labels },
  plugins,
}

writeFileSync(join(root, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8')
console.log(`wrote index.json with ${plugins.length} plugins and ${plugins.length} icons`)
