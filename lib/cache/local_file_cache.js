import fs from 'fs'

const path = require('path')

// Keep the original long-lived file cache, but scope it to a build/deploy
// namespace so Cloudflare's persisted build cache cannot reuse stale Notion
// page blocks after a new commit-triggered deployment.
const cacheInvalidSeconds = 1000000000 * 1000
const jsonFile = path.resolve('./data.json')
const cacheNamespace =
  process.env.NOTION_CACHE_NAMESPACE ||
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  (process.env.BUILD_MODE ? 'local-build' : 'local')

function readCacheJson() {
  if (!fs.existsSync(jsonFile)) return {}

  const data = fs.readFileSync(jsonFile)
  if (!data) return {}

  try {
    const json = JSON.parse(data)

    if (json.__cache_namespace && json.__cache_namespace !== cacheNamespace) {
      return {}
    }

    if (!json.__cache_namespace && process.env.BUILD_MODE) {
      return {}
    }

    return json
  } catch (error) {
    console.error('Failed to read local cache JSON', error)
    return {}
  }
}

function writeCacheJson(json) {
  json.__cache_namespace = cacheNamespace
  fs.writeFileSync(jsonFile, JSON.stringify(json))
}

export function getCache(key) {
  const json = readCacheJson()
  const expireTime = parseInt(json[key + '_expire_time'])
  if (!expireTime) return null

  const cacheValidTime = new Date(expireTime + cacheInvalidSeconds)
  const currentTime = new Date()
  if (!cacheValidTime || cacheValidTime < currentTime) {
    return null
  }
  return json[key]
}

export function setCache(key, data) {
  const json = readCacheJson()
  json[key] = data
  json[key + '_expire_time'] = new Date().getTime()
  writeCacheJson(json)
}

export function delCache(key) {
  const json = readCacheJson()
  delete json[key]
  delete json[key + '_expire_time']
  writeCacheJson(json)
}

export function cleanCache() {
  writeCacheJson({})
}

const LocalFileCache = { getCache, setCache, delCache }

export default LocalFileCache
