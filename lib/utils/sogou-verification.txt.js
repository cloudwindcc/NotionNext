import fs from 'fs'
import BLOG from '@/blog.config'

const DEFAULT_SOGOU_SITE_VERIFICATION = 'MTIf7YYFo3'

export function generateSogouVerificationTxt(props = {}) {
  const configuredVerification =
    props?.NOTION_CONFIG?.SEO_SOGOU_SITE_VERIFICATION ||
    BLOG.SEO_SOGOU_SITE_VERIFICATION ||
    process.env.NEXT_PUBLIC_SEO_SOGOU_SITE_VERIFICATION
  const verification = `${configuredVerification || DEFAULT_SOGOU_SITE_VERIFICATION}`.trim()

  if (!verification) return

  try {
    writeGeneratedFile('sogousiteverification.txt', verification)
  } catch (error) {
    // Build-time generation works on Cloudflare Pages and local export builds.
  }
}

function writeGeneratedFile(file, content) {
  for (const directory of ['./public', './out']) {
    fs.mkdirSync(directory, { recursive: true })
    fs.writeFileSync(`${directory}/${file}`, content)
  }
}
