import fs from 'fs'
import BLOG from '@/blog.config'
import { siteConfig } from '../config'

export function generateRobotsTxt(props) {
  const { NOTION_CONFIG, siteInfo } = props
  const LINK = stripTrailingSlash(
    siteConfig('LINK', siteInfo?.link || BLOG.LINK, NOTION_CONFIG)
  )
  const content = `# Search engines
User-agent: *
Content-Signal: search=yes, ai-input=yes
Allow: /

# ByteDance / Doubao ecosystem
User-agent: Bytespider
Allow: /

User-agent: TikTokSpider
Allow: /

# AI search and answer engines
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-CloudVertexBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: DuckAssistBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: PetalBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: CCBot
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: meta-externalfetcher
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: MistralAI-User
Allow: /

# Chinese search engines
User-agent: Baiduspider
Allow: /

User-agent: Sogou web spider
Allow: /

User-agent: 360Spider
Allow: /

User-agent: YisouSpider
Allow: /

# Host
Host: ${LINK}

# Sitemaps
Sitemap: ${LINK}/sitemap.xml

# AI-friendly overview
# llms.txt: ${LINK}/llms.txt
`

  try {
    writeGeneratedFile('robots.txt', content)
  } catch (error) {
    // Build environments can write this file; read-only runtimes can ignore it.
  }
}

function writeGeneratedFile(file, content) {
  for (const directory of ['./public', './out']) {
    fs.mkdirSync(directory, { recursive: true })
    fs.writeFileSync(`${directory}/${file}`, content)
  }
}

function stripTrailingSlash(value) {
  return `${value || ''}`.replace(/\/+$/, '')
}
