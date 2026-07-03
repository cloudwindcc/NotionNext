# KANG.INK Yao GEO Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build deployable GEO assets for `kang.ink` using the `yaojingang/yao-geo-skills` approach.

**Architecture:** Keep the change in the static-generation layer. Existing NotionNext data feeds `llms.txt`, the new `ai-knowledge.json`, robots metadata, and Schema.org JSON-LD; no theme or article body changes are required.

**Tech Stack:** Next.js 14, NotionNext static export, Jest, Schema.org JSON-LD, Cloudflare Pages.

---

### Task 1: Tests First

**Files:**
- Create: `__tests__/lib/utils/llms.txt.test.js`
- Create: `__tests__/lib/utils/ai-knowledge.json.test.js`
- Create: `__tests__/components/SEO.test.js`

- [ ] **Step 1: Write failing tests for enhanced `llms.txt`**

Create sample posts and assert the generated file contains `Identity`, `Editorial Scope`, `Topic Clusters`, `Answerable Questions`, `Citation Policy`, `Freshness`, and a link to `/ai-knowledge.json`.

- [ ] **Step 2: Write failing tests for `/ai-knowledge.json`**

Assert the generator writes both `public/ai-knowledge.json` and `out/ai-knowledge.json`, and that the JSON contains canonical site identity, author identity, topics, source URLs, article inventory, answerable questions, and citation policy.

- [ ] **Step 3: Write failing tests for Schema.org enrichment**

Import the structured-data generator and assert `Person.knowsAbout`, `WebSite.about`, and `BlogPosting.about` are present and are built from existing site/post metadata.

- [ ] **Step 4: Run tests and confirm RED**

Run:

```powershell
yarn test __tests__/lib/utils/llms.txt.test.js __tests__/lib/utils/ai-knowledge.json.test.js __tests__/components/SEO.test.js --runInBand
```

Expected: failing tests because `ai-knowledge.json` and enriched JSON-LD are not implemented yet.

### Task 2: Generate GEO Assets

**Files:**
- Modify: `lib/utils/llms.txt.js`
- Create: `lib/utils/ai-knowledge.json.js`
- Modify: `lib/utils/robots.txt.js`
- Modify: `pages/index.js`

- [ ] **Step 1: Enhance `generateLlmsTxt`**

Add identity, editorial scope, topic cluster, answerable question, citation, freshness, and related machine-readable asset sections. Keep existing article list generation.

- [ ] **Step 2: Add `generateAiKnowledgeJson`**

Build a deterministic JSON document from `allPages`, `latestPosts`, `NOTION_CONFIG`, and `siteInfo`. Include only facts available from the site and metadata.

- [ ] **Step 3: Wire static generation**

Call `generateAiKnowledgeJson(props)` in `pages/index.js` beside `generateLlmsTxt(props)` and mention `/ai-knowledge.json` in `robots.txt`.

- [ ] **Step 4: Run focused tests and confirm GREEN for utility tests**

Run the same focused Jest command and fix any utility-level failures.

### Task 3: Enrich Structured Data

**Files:**
- Modify: `components/SEO.js`

- [ ] **Step 1: Export and enrich structured data helper**

Export `generateStructuredData`, derive topic entities from keywords, category, and post tags, and attach them to `Person`, `WebSite`, `WebPage`, and `BlogPosting` without adding unsupported claims.

- [ ] **Step 2: Add metadata link**

Add an alternate JSON link for `/ai-knowledge.json` in `<Head>`.

- [ ] **Step 3: Run focused tests and confirm GREEN**

Run:

```powershell
yarn test __tests__/lib/utils/llms.txt.test.js __tests__/lib/utils/ai-knowledge.json.test.js __tests__/components/SEO.test.js --runInBand
```

Expected: all focused tests pass.

### Task 4: Verify, Commit, Deploy

**Files:**
- All changed files.

- [ ] **Step 1: Lint touched files**

Run:

```powershell
yarn lint --file pages/index.js --file lib/utils/llms.txt.js --file lib/utils/ai-knowledge.json.js --file lib/utils/robots.txt.js --file components/SEO.js
```

- [ ] **Step 2: Static export**

Run:

```powershell
yarn export
```

- [ ] **Step 3: Inspect generated assets**

Run:

```powershell
Get-Content out\llms.txt -TotalCount 80
Get-Content out\ai-knowledge.json -TotalCount 80
```

- [ ] **Step 4: Commit and push**

Run:

```powershell
git status --short
git add docs/superpowers/specs/2026-07-03-kangink-yao-geo-design.md docs/superpowers/plans/2026-07-03-kangink-yao-geo.md __tests__/lib/utils/llms.txt.test.js __tests__/lib/utils/ai-knowledge.json.test.js __tests__/components/SEO.test.js lib/utils/llms.txt.js lib/utils/ai-knowledge.json.js lib/utils/robots.txt.js components/SEO.js pages/index.js
git commit -m "Enhance GEO assets for AI discovery"
git push cloudwindcc HEAD:main
```

- [ ] **Step 5: Verify production**

After Cloudflare Pages deploys, request:

```powershell
curl.exe -sL --max-time 30 https://www.kang.ink/llms.txt
curl.exe -sL --max-time 30 https://www.kang.ink/ai-knowledge.json
```
