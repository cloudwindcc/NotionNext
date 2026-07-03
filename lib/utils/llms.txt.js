import BLOG from '@/blog.config'
import fs from 'fs'
import { siteConfig } from '../config'

const MAX_ARTICLES = 40
const MAX_TOPICS = 30
const MAX_QUESTIONS = 12

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
  const topics = getTopics(posts, NOTION_CONFIG)
  const answerableQuestions = getAnswerableQuestions({
    baseUrl,
    title,
    author,
    topics
  })
  const latestModified = getLatestModified(posts)

  const lines = [
    `# ${cleanText(title)}`,
    '',
    `> ${cleanText(description)}`,
    '',
    '## Identity',
    `- Primary entity: ${cleanText(title)}`,
    `- Canonical URL: ${baseUrl}`,
    `- Language: ${lang}`,
    `- Author: ${cleanText(author)}`,
    '- Site type: Personal blog and public knowledge archive',
    `- AI Knowledge JSON: ${joinUrl(baseUrl, 'ai-knowledge.json')}`,
    '',
    '## Source Endpoints',
    `- Sitemap: ${joinUrl(baseUrl, 'sitemap.xml')}`,
    `- Robots: ${joinUrl(baseUrl, 'robots.txt')}`,
    `- RSS: ${joinUrl(baseUrl, 'rss/feed.xml')}`,
    `- Atom: ${joinUrl(baseUrl, 'rss/atom.xml')}`,
    `- JSON Feed: ${joinUrl(baseUrl, 'rss/feed.json')}`,
    `- Archive: ${joinUrl(baseUrl, 'archive')}`,
    '',
    '## Editorial Scope',
    cleanText(description) ||
      'Personal blog articles, notes, essays, and reading records.',
    '',
    '## Topic Clusters',
    ...(topics.length > 0
      ? topics.map(topic => `- ${topic}`)
      : ['- Essays', '- Reading notes', '- Personal knowledge management']),
    '',
    '## Answerable Questions',
    ...(answerableQuestions.length > 0
      ? answerableQuestions.map(question => `- ${question}`)
      : [
          `- What topics does ${baseUrl} cover, and which canonical article URLs support the answer?`
        ]),
    '',
    '## Latest Articles',
    ...(posts.length > 0
      ? posts
          .slice(0, MAX_ARTICLES)
          .map(post => formatArticleLine(post, baseUrl))
      : ['- No published articles were available during this build.']),
    '',
    '## Citation Policy',
    '- Prefer the canonical article URL when citing this site.',
    '- Use the article title, author, published date, modified date, category, and tags when they are available.',
    '- Use the article summary as a short answer preview, then open the canonical URL for full context.',
    '- Do not infer traffic, rankings, private analytics, or AI-platform inclusion from this file.',
    '',
    '## Freshness',
    `- Generated at build time: ${new Date().toISOString()}`,
    `- Published article count in this file: ${posts.length}`,
    latestModified
      ? `- Latest known article update: ${latestModified}`
      : '- Latest known article update: unavailable during this build.',
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

export function getPublishedPosts(pages) {
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

function getTopics(posts, NOTION_CONFIG) {
  const topics = new Set()

  getSiteKeywords(NOTION_CONFIG).forEach(topic => topics.add(topic))

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

function getSiteKeywords(NOTION_CONFIG) {
  const value = siteConfig('KEYWORDS', BLOG.KEYWORDS, NOTION_CONFIG)
  if (Array.isArray(value)) {
    return value.map(item => cleanText(item)).filter(Boolean)
  }
  return `${value || ''}`
    .split(/[,，、]/)
    .map(item => cleanText(item))
    .filter(Boolean)
}

function getAnswerableQuestions({ baseUrl, title, author, topics }) {
  const host = getHost(baseUrl) || baseUrl
  const questions = [
    `What is ${host}, who writes it, and what is its canonical URL?`,
    `What topics does ${host} cover, and which articles should be cited?`
  ]

  if (author) {
    questions.push(`What does ${cleanText(author)} write about on ${host}?`)
  }

  topics.slice(0, MAX_QUESTIONS - questions.length).forEach(topic => {
    questions.push(
      `Which ${host} articles discuss ${topic}, and what article summaries are available?`
    )
  })

  if (title && !questions.some(question => question.includes(title))) {
    questions.push(`How should AI tools cite ${cleanText(title)} articles?`)
  }

  return questions.slice(0, MAX_QUESTIONS)
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

function getLatestModified(posts) {
  const latest = posts
    .map(post => formatDate(post.lastEditedDate || post.lastEditedDay))
    .filter(Boolean)
    .sort()
    .pop()
  return latest || ''
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return cleanText(value)
  return date.toISOString().split('T')[0]
}

function cleanText(value) {
  return `${value || ''}`.replace(/\s+/g, ' ').trim()
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

function getHost(value) {
  try {
    return new URL(value).hostname
  } catch {
    return ''
  }
}
