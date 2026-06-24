import BLOG from '@/blog.config'
import fs from 'fs'
import { siteConfig } from '../config'

const MAX_ARTICLES = 40
const MAX_TOPICS = 30

export function generateLlmsTxt(props) {
  const { allPages = [], latestPosts = [], NOTION_CONFIG, siteInfo } = props
  const baseUrl = stripTrailingSlash(
    siteConfig('LINK', siteInfo?.link || BLOG.LINK, NOTION_CONFIG)
  )
  const title =
    siteInfo?.title || siteConfig('TITLE', BLOG.TITLE, NOTION_CONFIG) || 'Blog'
  const description =
    siteInfo?.description ||
    siteConfig('DESCRIPTION', BLOG.DESCRIPTION, NOTION_CONFIG) ||
    ''
  const author = siteConfig('AUTHOR', BLOG.AUTHOR, NOTION_CONFIG)
  const lang = siteConfig('LANG', BLOG.LANG, NOTION_CONFIG)
  const posts = getPublishedPosts(allPages.length > 0 ? allPages : latestPosts)
  const topics = getTopics(posts)

  const lines = [
    `# ${cleanText(title)}`,
    '',
    `> ${cleanText(description)}`,
    '',
    '## Site',
    `- Canonical URL: ${baseUrl}`,
    `- Language: ${lang}`,
    `- Author: ${cleanText(author)}`,
    `- Sitemap: ${joinUrl(baseUrl, 'sitemap.xml')}`,
    `- RSS: ${joinUrl(baseUrl, 'rss/feed.xml')}`,
    `- Atom: ${joinUrl(baseUrl, 'rss/atom.xml')}`,
    `- JSON Feed: ${joinUrl(baseUrl, 'rss/feed.json')}`,
    `- Archive: ${joinUrl(baseUrl, 'archive')}`,
    '',
    '## Content Scope',
    cleanText(description) ||
      'Personal blog articles, notes, essays, and reading records.',
    '',
    '## Key Topics',
    ...(topics.length > 0
      ? topics.map(topic => `- ${topic}`)
      : ['- Essays', '- Reading notes', '- Personal knowledge management']),
    '',
    '## Latest Articles',
    ...(posts.length > 0
      ? posts
          .slice(0, MAX_ARTICLES)
          .map(post => formatArticleLine(post, baseUrl))
      : ['- No published articles were available during this build.']),
    '',
    '## Citation Guidance',
    '- Prefer the canonical article URL when citing this site.',
    '- Use the article title, author, published date, modified date, category, and tags when they are available.',
    '- Use the article summary as a short answer preview, then open the canonical URL for full context.',
    ''
  ]

  const content = lines.join('\n')

  try {
    writeGeneratedFile('llms.txt', content)
  } catch (error) {
    // Some runtimes expose a read-only filesystem. Build-time generation still
    // works on Cloudflare Pages and local export builds.
  }
}

function getPublishedPosts(pages) {
  return [...(pages || [])]
    .filter(
      post =>
        post?.type === 'Post' &&
        post?.status === 'Published' &&
        post?.slug &&
        !post?.password
    )
    .sort((a, b) => {
      const dateA = getPostTime(a)
      const dateB = getPostTime(b)
      return dateB - dateA
    })
}

function getTopics(posts) {
  const topics = new Set()

  posts.forEach(post => {
    if (post.category) topics.add(cleanText(post.category))
    if (Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        const cleanTag = cleanText(tag)
        if (cleanTag) topics.add(cleanTag)
      })
    }
  })

  return [...topics].filter(Boolean).slice(0, MAX_TOPICS)
}

function formatArticleLine(post, baseUrl) {
  const url = joinUrl(baseUrl, post.slug)
  const parts = []
  const title = cleanText(post.title || post.slug || 'Untitled')
  const summary = cleanText(post.summary)
  const date = formatDate(post.publishDate || post.publishDay)
  const modified = formatDate(post.lastEditedDate || post.lastEditedDay)
  const category = cleanText(post.category)
  const tags = Array.isArray(post.tags)
    ? post.tags.map(tag => cleanText(tag)).filter(Boolean)
    : []

  if (summary) parts.push(summary)
  if (date) parts.push(`Published: ${date}`)
  if (modified && modified !== date) parts.push(`Updated: ${modified}`)
  if (category) parts.push(`Category: ${category}`)
  if (tags.length > 0) parts.push(`Tags: ${tags.join(', ')}`)

  return `- [${escapeMarkdownLinkText(title)}](${url})${parts.length > 0 ? `: ${parts.join('; ')}` : ''}`
}

function getPostTime(post) {
  const date = new Date(post?.lastEditedDate || post?.publishDate || 0)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return cleanText(value)
  return date.toISOString().split('T')[0]
}

function cleanText(value) {
  return `${value || ''}`.replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim()
}

function escapeMarkdownLinkText(value) {
  return cleanText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
}

function joinUrl(base, path = '') {
  const normalizedBase = stripTrailingSlash(base)
  const normalizedPath = `${path || ''}`.replace(/^\/+/, '')
  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase
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
