import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'
import { generateLocaleDict } from '@/lib/utils/lang'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const SEO = props => {
  const { children, siteInfo, post, NOTION_CONFIG } = props
  const router = useRouter()
  const locale = generateLocaleDict(siteConfig('LANG', 'zh-CN', NOTION_CONFIG))
  const meta = getSEOMeta(props, router, locale)
  const baseUrl = getBaseUrl(siteInfo, NOTION_CONFIG)
  const url = joinUrl(baseUrl, meta?.slug || '')
  const image =
    toAbsoluteUrl(
      meta?.image || siteInfo?.pageCover || '/bg_image.jpg',
      baseUrl
    ) || joinUrl(baseUrl, 'bg_image.jpg')
  const webFontUrl = siteConfig('FONT_URL')

  useEffect(() => {
    if (!webFontUrl) return

    loadExternalResource(
      'https://cdnjs.cloudflare.com/ajax/libs/webfont/1.6.28/webfontloader.js',
      'js'
    ).then(() => {
      const WebFont = window?.WebFont
      if (WebFont) {
        WebFont.load({
          custom: {
            urls: webFontUrl
          }
        })
      }
    })
  }, [webFontUrl])

  const TITLE = siteConfig('TITLE')
  const AUTHOR = siteConfig('AUTHOR')
  const langCode = siteConfig('LANG', 'zh-CN', NOTION_CONFIG)
  const ogLocale = langCode.replace('-', '_')
  const title = meta?.title || TITLE
  const description = meta?.description || `${siteInfo?.description || ''}`
  const type = meta?.type === 'Post' ? 'article' : 'website'
  const favicon = siteConfig('BLOG_FAVICON', '/favicon.ico', NOTION_CONFIG)
  const keywords = normalizeKeywords(meta?.tags || siteConfig('KEYWORDS'))
  const category = meta?.category || siteConfig('KEYWORDS')
  const publishedAt = toISODate(meta?.publishDate || meta?.publishDay)
  const modifiedAt =
    toISODate(meta?.lastEditedDate || meta?.lastEditedDay) || publishedAt
  const feedTitle = `${siteInfo?.title || TITLE} Feed`
  const BACKGROUND_DARK = siteConfig('BACKGROUND_DARK', '', NOTION_CONFIG)

  const SEO_BAIDU_SITE_VERIFICATION = siteConfig(
    'SEO_BAIDU_SITE_VERIFICATION',
    null,
    NOTION_CONFIG
  )

  const SEO_GOOGLE_SITE_VERIFICATION = siteConfig(
    'SEO_GOOGLE_SITE_VERIFICATION',
    null,
    NOTION_CONFIG
  )

  const defaultByteDanceSiteVerification =
    getDefaultByteDanceSiteVerification(baseUrl)
  const SEO_BYTEDANCE_SITE_VERIFICATION =
    siteConfig(
      'SEO_BYTEDANCE_SITE_VERIFICATION',
      defaultByteDanceSiteVerification,
      NOTION_CONFIG
    ) || defaultByteDanceSiteVerification

  const SEO_SOGOU_SITE_VERIFICATION = siteConfig(
    'SEO_SOGOU_SITE_VERIFICATION',
    null,
    NOTION_CONFIG
  )

  const COMMENT_WEBMENTION_ENABLE = siteConfig(
    'COMMENT_WEBMENTION_ENABLE',
    null,
    NOTION_CONFIG
  )

  const COMMENT_WEBMENTION_HOSTNAME = siteConfig(
    'COMMENT_WEBMENTION_HOSTNAME',
    null,
    NOTION_CONFIG
  )
  const COMMENT_WEBMENTION_AUTH = siteConfig(
    'COMMENT_WEBMENTION_AUTH',
    null,
    NOTION_CONFIG
  )
  const ANALYTICS_BUSUANZI_ENABLE = siteConfig(
    'ANALYTICS_BUSUANZI_ENABLE',
    null,
    NOTION_CONFIG
  )

  const FACEBOOK_PAGE = siteConfig('FACEBOOK_PAGE', null, NOTION_CONFIG)
  const structuredData = generateStructuredData({
    meta,
    siteInfo,
    url,
    image,
    author: AUTHOR,
    keywords,
    NOTION_CONFIG
  })

  return (
    <Head>
      <title>{title}</title>
      <link rel='icon' href={favicon} />
      <link rel='canonical' href={url} />
      <link
        rel='alternate'
        type='application/rss+xml'
        title={feedTitle}
        href={joinUrl(baseUrl, 'rss/feed.xml')}
      />
      <link
        rel='alternate'
        type='application/atom+xml'
        title={`${feedTitle} Atom`}
        href={joinUrl(baseUrl, 'rss/atom.xml')}
      />
      <link
        rel='alternate'
        type='application/feed+json'
        title={`${feedTitle} JSON`}
        href={joinUrl(baseUrl, 'rss/feed.json')}
      />
      <link
        rel='alternate'
        type='text/plain'
        title={`${siteInfo?.title || TITLE} llms.txt`}
        href={joinUrl(baseUrl, 'llms.txt')}
      />
      <link
        rel='sitemap'
        type='application/xml'
        title='Sitemap'
        href={joinUrl(baseUrl, 'sitemap.xml')}
      />
      <meta name='theme-color' content={BACKGROUND_DARK} />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0'
      />
      <meta
        name='robots'
        content='follow, index, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
      />
      <meta charSet='UTF-8' />
      <meta name='format-detection' content='telephone=no' />
      <meta name='mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='default' />
      <meta name='apple-mobile-web-app-title' content={title} />

      {SEO_GOOGLE_SITE_VERIFICATION && (
        <meta
          name='google-site-verification'
          content={SEO_GOOGLE_SITE_VERIFICATION}
        />
      )}
      {SEO_BAIDU_SITE_VERIFICATION && (
        <meta
          name='baidu-site-verification'
          content={SEO_BAIDU_SITE_VERIFICATION}
        />
      )}
      {SEO_BYTEDANCE_SITE_VERIFICATION && (
        <meta
          name='bytedance-verification-code'
          content={SEO_BYTEDANCE_SITE_VERIFICATION}
        />
      )}
      {SEO_SOGOU_SITE_VERIFICATION && (
        <meta
          name='sogou_site_verification'
          content={SEO_SOGOU_SITE_VERIFICATION}
        />
      )}

      <meta name='keywords' content={keywords.join(', ')} />
      <meta name='description' content={description} />
      <meta name='author' content={AUTHOR} />
      <meta name='generator' content='NotionNext' />
      <meta httpEquiv='content-language' content={langCode} />
      <meta name='geo.region' content={siteConfig('GEO_REGION', 'CN')} />
      <meta name='geo.country' content={siteConfig('GEO_COUNTRY', 'CN')} />

      <meta property='og:locale' content={ogLocale} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={url} />
      <meta property='og:image' content={image} />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:alt' content={title} />
      <meta property='og:site_name' content={siteInfo?.title || TITLE} />
      <meta property='og:type' content={type} />

      <meta name='twitter:card' content='summary_large_image' />
      <meta
        name='twitter:site'
        content={siteConfig('TWITTER_SITE', '@NotionNext')}
      />
      <meta
        name='twitter:creator'
        content={siteConfig('TWITTER_CREATOR', '@NotionNext')}
      />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
      <meta name='twitter:image:alt' content={title} />

      {COMMENT_WEBMENTION_ENABLE && (
        <>
          <link
            rel='webmention'
            href={`https://webmention.io/${COMMENT_WEBMENTION_HOSTNAME}/webmention`}
          />
          <link
            rel='pingback'
            href={`https://webmention.io/${COMMENT_WEBMENTION_HOSTNAME}/xmlrpc`}
          />
          {COMMENT_WEBMENTION_AUTH && (
            <link href={COMMENT_WEBMENTION_AUTH} rel='me' />
          )}
        </>
      )}

      {ANALYTICS_BUSUANZI_ENABLE && (
        <meta name='referrer' content='no-referrer-when-downgrade' />
      )}

      {meta?.type === 'Post' && (
        <>
          {publishedAt && (
            <meta property='article:published_time' content={publishedAt} />
          )}
          {modifiedAt && (
            <meta property='article:modified_time' content={modifiedAt} />
          )}
          <meta property='article:author' content={AUTHOR} />
          <meta property='article:section' content={category} />
          {keywords.map(keyword => (
            <meta
              key={`article-tag-${keyword}`}
              property='article:tag'
              content={keyword}
            />
          ))}
          {FACEBOOK_PAGE && (
            <meta property='article:publisher' content={FACEBOOK_PAGE} />
          )}
        </>
      )}

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      <link rel='dns-prefetch' href='//fonts.googleapis.com' />
      <link rel='dns-prefetch' href='//www.google-analytics.com' />
      <link rel='dns-prefetch' href='//www.googletagmanager.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        crossOrigin='anonymous'
      />
      <link
        rel='preload'
        href='/fonts/inter-var.woff2'
        as='font'
        type='font/woff2'
        crossOrigin='anonymous'
      />

      {children}
    </Head>
  )
}

const generateStructuredData = ({
  meta,
  siteInfo,
  url,
  image,
  author,
  keywords,
  NOTION_CONFIG
}) => {
  const baseUrl = getBaseUrl(siteInfo, NOTION_CONFIG)
  const siteTitle = siteInfo?.title || siteConfig('TITLE', null, NOTION_CONFIG)
  const siteDescription =
    siteInfo?.description || siteConfig('DESCRIPTION', null, NOTION_CONFIG)
  const langCode = siteConfig('LANG', 'zh-CN', NOTION_CONFIG)
  const authorId = `${baseUrl}/#person`
  const publisherId = `${baseUrl}/#publisher`
  const websiteId = `${baseUrl}/#website`
  const webpageId = `${url}#webpage`
  const breadcrumbId = `${url}#breadcrumb`
  const logo =
    toAbsoluteUrl(siteInfo?.icon, baseUrl) ||
    toAbsoluteUrl(
      siteConfig('BLOG_FAVICON', '/favicon.ico', NOTION_CONFIG),
      baseUrl
    )
  const publishedAt = toISODate(meta?.publishDate || meta?.publishDay)
  const modifiedAt =
    toISODate(meta?.lastEditedDate || meta?.lastEditedDay) || publishedAt
  const sameAs = getSameAsLinks(NOTION_CONFIG)

  const graph = [
    {
      '@type': 'Person',
      '@id': authorId,
      name: author,
      url: baseUrl,
      sameAs
    },
    {
      '@type': 'Organization',
      '@id': publisherId,
      name: siteTitle,
      url: baseUrl,
      logo: logo
        ? {
            '@type': 'ImageObject',
            url: logo
          }
        : undefined,
      sameAs
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: baseUrl,
      name: siteTitle,
      description: siteDescription,
      inLanguage: langCode,
      publisher: {
        '@id': publisherId
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: joinUrl(baseUrl, 'search/{search_term_string}')
        },
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'WebPage',
      '@id': webpageId,
      url,
      name: meta?.title || siteTitle,
      description: meta?.description || siteDescription,
      isPartOf: {
        '@id': websiteId
      },
      inLanguage: langCode,
      primaryImageOfPage: image
        ? {
            '@type': 'ImageObject',
            url: image
          }
        : undefined,
      breadcrumb: {
        '@id': breadcrumbId
      },
      datePublished: publishedAt,
      dateModified: modifiedAt
    },
    createBreadcrumbData({
      breadcrumbId,
      baseUrl,
      url,
      title: meta?.title || siteTitle,
      category: meta?.category
    })
  ]

  if (meta?.type === 'Post') {
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      mainEntityOfPage: {
        '@id': webpageId
      },
      headline: meta.title,
      description: meta.description,
      image: image ? [image] : undefined,
      url,
      datePublished: publishedAt,
      dateModified: modifiedAt,
      author: {
        '@id': authorId
      },
      publisher: {
        '@id': publisherId
      },
      inLanguage: langCode,
      isAccessibleForFree: !meta.password,
      articleSection: meta.category,
      keywords
    })
  }

  return cleanStructuredData({
    '@context': 'https://schema.org',
    '@graph': graph
  })
}

const createBreadcrumbData = ({
  breadcrumbId,
  baseUrl,
  url,
  title,
  category
}) => {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl
    }
  ]

  if (category) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: category,
      item: joinUrl(baseUrl, `category/${encodeURIComponent(category)}`)
    })
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: title,
    item: url
  })

  return {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: items
  }
}

const getSEOMeta = (props, router, locale = {}) => {
  const { post, siteInfo, tag, category, page } = props
  const keyword = router?.query?.s
  const title = siteInfo?.title || siteConfig('TITLE')
  const description = siteInfo?.description || siteConfig('DESCRIPTION')
  const pageCover = siteInfo?.pageCover
  const labels = {
    archive: locale?.NAV?.ARCHIVE || 'Archive',
    search: locale?.NAV?.SEARCH || 'Search',
    notFound: locale?.NAV?.PAGE_NOT_FOUND || 'Page Not Found',
    category: locale?.COMMON?.CATEGORY || 'Category',
    tags: locale?.COMMON?.TAGS || 'Tags'
  }

  switch (router.route) {
    case '/':
      return {
        title: `${title} | ${description}`,
        description,
        image: pageCover,
        slug: '',
        type: 'website'
      }
    case '/archive':
      return {
        title: `${labels.archive} | ${title}`,
        description,
        image: pageCover,
        slug: 'archive',
        type: 'website'
      }
    case '/page/[page]':
      return {
        title: `${page} | Page | ${title}`,
        description,
        image: pageCover,
        slug: `page/${page}`,
        type: 'website'
      }
    case '/category/[category]':
    case '/category/[category]/page/[page]':
      return {
        title: `${category} | ${labels.category} | ${title}`,
        description,
        slug: `category/${category}`,
        image: pageCover,
        type: 'website',
        category
      }
    case '/tag/[tag]':
    case '/tag/[tag]/page/[page]':
      return {
        title: `${tag} | ${labels.tags} | ${title}`,
        description,
        image: pageCover,
        slug: `tag/${tag}`,
        type: 'website',
        tags: [tag]
      }
    case '/search':
      return {
        title: `${keyword || ''}${keyword ? ' | ' : ''}${labels.search} | ${title}`,
        description,
        image: pageCover,
        slug: 'search',
        type: 'website'
      }
    case '/search/[keyword]':
    case '/search/[keyword]/page/[page]':
      return {
        title: `${keyword || ''}${keyword ? ' | ' : ''}${labels.search} | ${title}`,
        description,
        image: pageCover,
        slug: `search/${keyword || ''}`,
        type: 'website'
      }
    case '/404':
      return {
        title: `${title} | ${labels.notFound}`,
        description,
        image: pageCover,
        slug: '404',
        type: 'website'
      }
    case '/tag':
      return {
        title: `${labels.tags} | ${title}`,
        description,
        image: pageCover,
        slug: 'tag',
        type: 'website'
      }
    case '/category':
      return {
        title: `${labels.category} | ${title}`,
        description,
        image: pageCover,
        slug: 'category',
        type: 'website'
      }
    default:
      return {
        title: post ? `${post?.title} | ${title}` : `${title} | loading`,
        description: post?.summary || description,
        type: post?.type,
        slug: post?.slug,
        image: post?.pageCoverThumbnail || post?.pageCover || pageCover,
        category: normalizeCategory(post?.category),
        tags: post?.tags,
        publishDay: post?.publishDay,
        publishDate: post?.publishDate,
        lastEditedDay: post?.lastEditedDay,
        lastEditedDate: post?.lastEditedDate,
        password: post?.password
      }
  }
}

const getBaseUrl = (siteInfo, NOTION_CONFIG) => {
  const link =
    siteConfig('LINK', siteInfo?.link, NOTION_CONFIG) ||
    siteInfo?.link ||
    'https://example.com'
  const subPath = siteConfig('SUB_PATH', '', NOTION_CONFIG)
  return joinUrl(link, subPath || '')
}

const joinUrl = (base, path = '') => {
  const normalizedBase = stripTrailingSlash(`${base || ''}`)
  const normalizedPath = `${path || ''}`.replace(/^\/+/, '')
  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase
}

const stripTrailingSlash = value => `${value || ''}`.replace(/\/+$/, '')

const BYTEDANCE_SITE_VERIFICATION_CODES = {
  'kang.ink': 'azOdpkb8fSTLVojRRule',
  'www.kang.ink': 'azOdpkb8fSTLVojRRule',
  'huawei.meme': 'rjsW6WJIxR0ry1Qy6yAi',
  'www.huawei.meme': 'rjsW6WJIxR0ry1Qy6yAi'
}

const getDefaultByteDanceSiteVerification = baseUrl => {
  const host = getUrlHost(baseUrl)
  return (
    BYTEDANCE_SITE_VERIFICATION_CODES[host] ||
    BYTEDANCE_SITE_VERIFICATION_CODES['www.kang.ink']
  )
}

const getUrlHost = value => {
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return `${value || ''}`
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      .toLowerCase()
  }
}

const toAbsoluteUrl = (value, baseUrl) => {
  if (!value || typeof value !== 'string') return undefined
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('/')) return joinUrl(baseUrl, value)
  if (value.includes('/') || value.includes('.')) return joinUrl(baseUrl, value)
  return undefined
}

const toISODate = value => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

const normalizeKeywords = value => {
  if (Array.isArray(value)) {
    return value.map(item => `${item}`.trim()).filter(Boolean)
  }
  return `${value || ''}`
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

const normalizeCategory = category => {
  if (Array.isArray(category)) return category[0]
  return category || undefined
}

const getSameAsLinks = NOTION_CONFIG => {
  const keys = [
    'CONTACT_GITHUB',
    'CONTACT_TWITTER',
    'CONTACT_LINKEDIN',
    'CONTACT_INSTAGRAM',
    'CONTACT_BILIBILI',
    'CONTACT_YOUTUBE',
    'CONTACT_XIAOHONGSHU'
  ]
  return keys
    .map(key => siteConfig(key, '', NOTION_CONFIG))
    .filter(value => typeof value === 'string' && /^https?:\/\//i.test(value))
}

const cleanStructuredData = value => {
  if (Array.isArray(value)) {
    const array = value
      .map(item => cleanStructuredData(item))
      .filter(item => item !== undefined)
    return array.length > 0 ? array : undefined
  }

  if (value && typeof value === 'object') {
    const object = Object.entries(value).reduce((result, [key, item]) => {
      const cleaned = cleanStructuredData(item)
      if (cleaned !== undefined) {
        result[key] = cleaned
      }
      return result
    }, {})
    return Object.keys(object).length > 0 ? object : undefined
  }

  if (value === undefined || value === null || value === '') {
    return undefined
  }

  return value
}

export default SEO
