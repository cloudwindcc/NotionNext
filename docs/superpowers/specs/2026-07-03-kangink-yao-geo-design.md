# KANG.INK Yao GEO Optimization Design

## Goal

Improve `kang.ink` for Generative Engine Optimization using the `yaojingang/yao-geo-skills` method: make the blog easier for search-driven AI systems to discover, parse, cite, and summarize without changing the visual theme or rewriting article content.

## Scope

- Strengthen `llms.txt` with site identity, editorial scope, topic clusters, answerable questions, citation guidance, and freshness notes.
- Generate `/ai-knowledge.json` as a machine-readable knowledge base with site facts, author facts, topic clusters, article inventory, feeds, sitemap, and citation policy.
- Add a public link to `/ai-knowledge.json` in page metadata and mention it in `robots.txt`.
- Enrich Schema.org JSON-LD for the site and posts with `knowsAbout`, `about`, `abstract`, and topic entities derived from existing configuration and post metadata.
- Add focused tests for generated GEO assets and structured data.

## Yao GEO Skill Mapping

- `yao-geo-page-audit`: crawlability, canonical URLs, sitemap, robots, initial HTML metadata, and AI extractability.
- `yao-geo-brand-graph`: author/site entity disambiguation and relationship graph through JSON-LD and sameAs links.
- `yao-geo-knowledge-base-builder`: reusable fact cards, source index, article inventory, citation policy, and freshness boundary.
- `yao-geo-intent-miner`: answerable question seeds for domestic AI tools such as Doubao, DeepSeek, Kimi, Qianwen, and Yuanbao.

## Data Boundaries

The implementation only uses public site facts, existing NotionNext metadata, article metadata, feed URLs, sitemap URLs, and configured author/contact links. It does not invent rankings, citations, crawler frequency, AI-platform inclusion status, traffic claims, or external endorsements.

## Verification

Run focused Jest tests, lint touched files, static export, and live checks after Cloudflare Pages deployment:

- `yarn test __tests__/lib/utils/llms.txt.test.js __tests__/lib/utils/ai-knowledge.json.test.js __tests__/components/SEO.test.js --runInBand`
- `yarn lint --file pages/index.js --file lib/utils/llms.txt.js --file lib/utils/ai-knowledge.json.js --file lib/utils/robots.txt.js --file components/SEO.js`
- `yarn export`
- `curl.exe -sL https://www.kang.ink/llms.txt`
- `curl.exe -sL https://www.kang.ink/ai-knowledge.json`
