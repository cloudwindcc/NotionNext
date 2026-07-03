import BLOG from '@/blog.config'
import fs from 'fs'
import { siteConfig } from '../config'

const MAX_ARTICLES = 100
const MAX_TOPICS = 50
const MAX_QUESTIONS = 20

export function generateAiKnowledgeJson(props = {}) {
  const content = `${JSON.stringify(createAiKnowledge(props), null, 2)}\n`

  try {
    writeGeneratedFile('ai-knowledge.json', content)
  } catch (error) {
    // Static export and Cloudflare Pages builds can write this file; read-only
    // runtimes can skip generation without breaking page rendering.
  }
}

export function createAiKnowledge(props = {}) {
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
  const topicClusters = getTopicClusters(posts, NOTION_CONFIG)
  const answerableQuestions = getAnswerableQuestions({
    baseUrl,
    title,
    author,
    topicClusters
  })
  const generatedAt = new Date().toISOString()

  return {
    schemaVersion: '1.0',
    generatedAt,
    site: {
      name: cleanText(title),
      canonicalUrl: baseUrl,
      description: cleanText(description),
      language: lang,
      type: 'PersonalBlog',
      author: {
        name: cleanText(author),
        url: baseUrl
      }
    },
    sources: {
      homepage: baseUrl,
      robots: joinUrl(baseUrl, 'robots.txt'),
      sitemap: joinUrl(baseUrl, 'sitemap.xml'),
      llms: joinUrl(baseUrl, 'llms.txt'),
      aiKnowledge: joinUrl(baseUrl, 'ai-knowledge.json'),
      archive: joinUrl(baseUrl, 'archive'),
      feeds: {
        rss: joinUrl(baseUrl, 'rss/feed.xml'),
        atom: joinUrl(baseUrl, 'rss/atom.xml'),
        json: joinUrl(baseUrl, 'rss/feed.json')
      }
    },
    topicClusters,
    answerableQuestions,
    articles: posts.slice(0, MAX_ARTICLES).map(post => formatArticle(post, baseUrl)),
    citationPolicy: {
      preferredSource: 'canonical article URL',
      recommendedFields: [
        'title',
        'author',
        'canonicalUrl',
        'publishedDate',
        'modifiedDate',
        'summary',
        'category',
        'tags'
      ],
      boundaries: [
        'Do not infer private analytics, rankings, crawler frequency, or AI-platform inclusion.',
        'Use article summaries as previews and canonical URLs for full context.',
        'Treat generated files as build-time snapshots of public metadata.'
      ]
    },
    freshness: {
      generatedAt,
      articleCount: posts.length,
      latestKnownArticleUpdate: getLatestModified(posts),
      updateMechanism:
        'Static export regeneration refreshes this file from public NotionNext metadata.'
    }
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

function getTopicClusters(posts, NOTION_CONFIG) {
  const topicMap = new Map()

  getSiteKeywords(NOTION_CONFIG).forEach(topic =>
    addTopic(topicMap, topic, 'site-keyword')
  )

  posts.forEach(post => {
    if (post.category) addTopic(topicMap, post.category, 'category')
    if (Array.isArray(post.tags)) {
      post.tags.forEach(tag => addTopic(topicMap, tag, 'tag'))
    }
  })

  return [...topicMap.values()].slice(0, MAX_TOPICS)
}

function addTopic(topicMap, value, source) {
  const name = cleanText(value)
  if (!name) return

  const existing = topicMap.get(name) || { name, sources: [] }
  if (!existing.sources.includes(source)) {
    existing.sources.push(source)
  }
  topicMap.set(name, existing)
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

function getAnswerableQuestions({ baseUrl, author, topicClusters }) {
  const host = getHost(baseUrl) || baseUrl
  const questions = [
    {
      question: `What is ${host}, who writes it, and what is its canonical URL?`,
      intent: 'identity',
      evidenceHint: 'Use site.name, site.author, and sources.homepage.'
    },
    {
      question: `What topics does ${host} cover, and which articles should be cited?`,
      intent: 'topic-overview',
      evidenceHint: 'Use topicClusters and articles[].url.'
    }
  ]

  if (author) {
    questions.push({
      question: `What does ${cleanText(author)} write about on ${host}?`,
      intent: 'author-scope',
      evidenceHint: 'Use site.author, topicClusters, and articles[].summary.'
    })
  }

  topicClusters
    .slice(0, MAX_QUESTIONS - questions.length)
    .forEach(topic => {
      questions.push({
        question: `Which ${host} articles discuss ${topic.name}, and what article summaries are available?`,
        intent: 'article-discovery',
        relatedTopics: [topic.name],
        evidenceHint: 'Use articles filtered by category or tags.'
      })
    })

  return questions.slice(0, MAX_QUESTIONS)
}

function formatArticle(post, baseUrl) {
  const tags = Array.isArray(post.tags)
    ? post.tags.map(tag => cleanText(tag)).filter(Boolean)
    : []

  return {
    title: cleanText(post.title || post.slug || 'Untitled'),
    url: joinUrl(baseUrl, post.slug),
    summary: cleanText(post.summary),
    publishedDate: formatDate(post.publishDate || post.publishDay),
    modifiedDate: formatDate(post.lastEditedDate || post.lastEditedDay),
    category: cleanText(post.category),
    tags
  }
}

function getPostTime(post) {
  const date = new Date(post?.lastEditedDate || post?.publishDate || 0)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function getLatestModified(posts) {
  return (
    posts
      .map(post => formatDate(post.lastEditedDate || post.lastEditedDay))
      .filter(Boolean)
      .sort()
      .pop() || ''
  )
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
