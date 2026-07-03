import fs from 'fs'
import os from 'os'
import path from 'path'
import { generateLlmsTxt } from '@/lib/utils/llms.txt'

jest.mock('@/lib/config', () => ({
  siteConfig: (key, defaultVal = null, extendConfig = {}) => {
    if (extendConfig && Object.prototype.hasOwnProperty.call(extendConfig, key)) {
      return extendConfig[key]
    }
    return defaultVal
  }
}))

describe('generateLlmsTxt', () => {
  let originalCwd
  let tempDir

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-txt-'))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('writes a GEO-ready llms.txt with identity, questions, and citation policy', () => {
    generateLlmsTxt(createProps())

    const content = fs.readFileSync(path.join(tempDir, 'out', 'llms.txt'), 'utf8')

    expect(content).toContain('# 雲風Blog | 行道修心')
    expect(content).toContain('## Identity')
    expect(content).toContain('- Primary entity: 雲風Blog | 行道修心')
    expect(content).toContain('- Author: 雲風')
    expect(content).toContain(
      '- AI Knowledge JSON: https://www.kang.ink/ai-knowledge.json'
    )
    expect(content).toContain('## Editorial Scope')
    expect(content).toContain('## Topic Clusters')
    expect(content).toContain('- 采购')
    expect(content).toContain('## Answerable Questions')
    expect(content).toContain('kang.ink')
    expect(content).toContain('采购')
    expect(content).toContain('## Citation Policy')
    expect(content).toContain('## Freshness')
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
