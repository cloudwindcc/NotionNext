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
Allow: /

# AI search and answer engines
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

# Host
Host: ${LINK}

# Sitemaps
Sitemap: ${LINK}/sitemap.xml

# AI-friendly overview
# llms.txt: ${LINK}/llms.txt
`

  try {
    fs.mkdirSync('./public', { recursive: true })
    fs.writeFileSync('./public/robots.txt', content)
  } catch (error) {
    // Build environments can write this file; read-only runtimes can ignore it.
  }
}

function stripTrailingSlash(value) {
  return `${value || ''}`.replace(/\/+$/, '')
}
