import BLOG from '@/blog.config'
import fs from 'fs'
import { siteConfig } from '../config'

export function generateSitemapXml({ allPages, NOTION_CONFIG, siteInfo }) {
  const link = stripTrailingSlash(
    siteConfig('LINK', siteInfo?.link || BLOG.LINK, NOTION_CONFIG)
  )
  const dateNow = new Date().toISOString().split('T')[0]
  const urls = [
    {
      loc: link,
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${link}/archive`,
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      loc: `${link}/category`,
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      loc: `${link}/tag`,
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      loc: `${link}/search`,
      lastmod: dateNow,
      changefreq: 'weekly',
      priority: '0.6'
    }
  ]

  allPages
    ?.filter(
      page =>
        page?.status === 'Published' && ['Post', 'Page'].includes(page?.type)
    )
    ?.forEach(post => {
      const slugWithoutLeadingSlash = `${post?.slug || ''}`.startsWith('/')
        ? post.slug.slice(1)
        : post.slug

      urls.push({
        loc: `${link}/${slugWithoutLeadingSlash}`,
        lastmod: getLastmod(post),
        changefreq: post?.type === 'Post' ? 'weekly' : 'monthly',
        priority: post?.type === 'Post' ? '0.8' : '0.6'
      })
    })

  const xml = createSitemapXml(urls)
  try {
    fs.writeFileSync('sitemap.xml', xml)
    fs.writeFileSync('./public/sitemap.xml', xml)
  } catch (error) {
    console.warn('Unable to write sitemap.xml', error)
  }
}

function createSitemapXml(urls) {
  const urlsXml = urls
    .map(
      u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`
}

function getLastmod(post) {
  const value =
    post?.lastEditedDate ||
    post?.publishDate ||
    post?.lastEditedDay ||
    post?.publishDay ||
    Date.now()
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0]
  }
  return date.toISOString().split('T')[0]
}

function escapeXml(value) {
  return `${value || ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripTrailingSlash(value) {
  return `${value || ''}`.replace(/\/+$/, '')
}
