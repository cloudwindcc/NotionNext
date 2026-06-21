/**
 * Developer/runtime configuration.
 */
module.exports = {
  SUB_PATH: '', // leave this empty unless you want to deploy in a folder
  DEBUG: process.env.NEXT_PUBLIC_DEBUG || false,
  BACKGROUND_LIGHT: '#eeeeee',
  BACKGROUND_DARK: '#000000',

  // Redis cache URL. Recommended on Vercel for persistent cross-instance cache.
  REDIS_URL: process.env.REDIS_URL || '',

  // Keep runtime cache enabled by default to reduce repeated Notion fetches.
  ENABLE_CACHE: process.env.ENABLE_CACHE ?? true,
  isProd: process.env.VERCEL_ENV === 'production' || process.env.EXPORT,
  BUNDLE_ANALYZER: process.env.ANALYZE === 'true' || false,
  VERSION: (() => {
    try {
      return (
        process.env.NEXT_PUBLIC_VERSION || require('../package.json').version
      )
    } catch (error) {
      console.warn('Failed to load package.json version:', error)
      return '1.0.0'
    }
  })()
}
