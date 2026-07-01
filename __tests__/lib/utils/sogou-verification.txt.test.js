import fs from 'fs'
import os from 'os'
import path from 'path'
import { generateSogouVerificationTxt } from '@/lib/utils/sogou-verification.txt'

describe('generateSogouVerificationTxt', () => {
  let originalCwd
  let tempDir

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sogou-verification-'))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('writes the Sogou verification file to static export directories', () => {
    generateSogouVerificationTxt({ NOTION_CONFIG: {} })

    expect(
      fs.readFileSync(
        path.join(tempDir, 'public', 'sogousiteverification.txt'),
        'utf8'
      )
    ).toBe('MTIf7YYFo3')
    expect(
      fs.readFileSync(
        path.join(tempDir, 'out', 'sogousiteverification.txt'),
        'utf8'
      )
    ).toBe('MTIf7YYFo3')
  })

  it('prefers configured verification text when available', () => {
    generateSogouVerificationTxt({
      NOTION_CONFIG: { SEO_SOGOU_SITE_VERIFICATION: 'custom-code' }
    })

    expect(
      fs.readFileSync(
        path.join(tempDir, 'out', 'sogousiteverification.txt'),
        'utf8'
      )
    ).toBe('custom-code')
  })
})
