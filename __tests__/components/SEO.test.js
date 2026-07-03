import { generateStructuredData } from '@/components/SEO'

jest.mock('@/lib/config', () => ({
  siteConfig: (key, defaultVal = null, extendConfig = {}) => {
    if (extendConfig && Object.prototype.hasOwnProperty.call(extendConfig, key)) {
      return extendConfig[key]
    }
    return defaultVal
  }
}))

describe('generateStructuredData', () => {
  it('adds GEO topic entities to person, website, webpage, and blog posting schema', () => {
    const structuredData = generateStructuredData({
      meta: {
        type: 'Post',
        title: '采购谈判笔记',
        description: '关于采购与管理的文章摘要。',
        slug: 'purchase-note',
        category: '采购',
        tags: ['谈判', 'AI'],
        publishDate: '2026-07-01',
        lastEditedDate: '2026-07-02'
      },
      siteInfo: {
        title: '雲風Blog | 行道修心',
        description: '采购、财务、管理、AI与读书笔记的个人博客',
        link: 'https://www.kang.ink',
        icon: '/favicon.ico'
      },
      url: 'https://www.kang.ink/purchase-note',
      image: 'https://www.kang.ink/cover.jpg',
      author: '雲風',
      keywords: ['采购', '谈判', 'AI'],
      NOTION_CONFIG: {
        LINK: 'https://www.kang.ink',
        LANG: 'zh-CN',
        KEYWORDS: '采购, 财务, 管理, AI, 读书笔记'
      }
    })

    const graph = structuredData['@graph']
    const person = graph.find(item => item['@type'] === 'Person')
    const website = graph.find(item => item['@type'] === 'WebSite')
    const webpage = graph.find(item => item['@type'] === 'WebPage')
    const article = graph.find(item => item['@type'] === 'BlogPosting')

    expect(person.knowsAbout).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: '采购' })])
    )
    expect(website.about).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'AI' })])
    )
    expect(webpage.about).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: '谈判' })])
    )
    expect(article.abstract).toBe('关于采购与管理的文章摘要。')
    expect(article.about).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: '采购' })])
    )
  })
})
