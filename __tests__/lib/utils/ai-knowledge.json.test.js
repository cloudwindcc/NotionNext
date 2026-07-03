import fs from 'fs'
import os from 'os'
import path from 'path'
import { generateAiKnowledgeJson } from '@/lib/utils/ai-knowledge.json'

jest.mock('@/lib/config', () => ({
  siteConfig: (key, defaultVal = null, extendConfig = {}) => {
    if (extendConfig && Object.prototype.hasOwnProperty.call(extendConfig, key)) {
      return extendConfig[key]
    }
    return defaultVal
  }
}))

describe('generateAiKnowledgeJson', () => {
  let originalCwd
  let tempDir

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-knowledge-'))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('writes a machine-readable GEO knowledge base for AI crawlers', () => {
    generateAiKnowledgeJson(createProps())

    const publicFile = path.join(tempDir, 'public', 'ai-knowledge.json')
    const outFile = path.join(tempDir, 'out', 'ai-knowledge.json')
    const data = JSON.parse(fs.readFileSync(outFile, 'utf8'))

    expect(fs.existsSync(publicFile)).toBe(true)
    expect(data.schemaVersion).toBe('1.0')
    expect(data.site.canonicalUrl).toBe('https://www.kang.ink')
    expect(data.site.name).toBe('雲風Blog | 行道修心')
    expect(data.site.author.name).toBe('雲風')
    expect(data.sources.llms).toBe('https://www.kang.ink/llms.txt')
    expect(data.sources.sitemap).toBe('https://www.kang.ink/sitemap.xml')
    expect(data.topicClusters).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: '采购' })])
    )
    expect(data.answerableQuestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          question: expect.stringContaining('kang.ink')
        })
      ])
    )
    expect(data.articles[0]).toEqual(
      expect.objectContaining({
        title: '采购谈判笔记',
        url: 'https://www.kang.ink/purchase-note',
        category: '采购'
      })
    )
    expect(data.citationPolicy.preferredSource).toBe('canonical article URL')
  })
})

function createProps() {
  return {
    siteInfo: {
      title: '雲風Blog | 行道修心',
      description: '采购、财务、管理、AI与读书笔记的个人博客',
      link: 'https://www.kang.ink'
    },
    NOTION_CONFIG: {
      LINK: 'https://www.kang.ink',
      AUTHOR: '雲風',
      LANG: 'zh-CN',
      KEYWORDS: '采购, 财务, 管理, AI, 读书笔记'
    },
    allPages: [
      {
        type: 'Post',
        status: 'Published',
        slug: 'purchase-note',
        title: '采购谈判笔记',
        summary: '记录采购、谈判与成本管理的实践观察。',
        category: '采购',
        tags: ['谈判', '成本'],
        publishDate: '2026-07-01',
        lastEditedDate: '2026-07-02'
      },
      {
        type: 'Post',
        status: 'Published',
        slug: 'ai-reading',
        title: 'AI 读书笔记',
        summary: '围绕 AI 工具与阅读方法的个人笔记。',
        category: '读书笔记',
        tags: ['AI', '阅读'],
        publishDate: '2026-06-20',
        lastEditedDate: '2026-06-21'
      }
    ]
  }
}
