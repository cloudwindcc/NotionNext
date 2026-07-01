const AGENT_DISCOVERY_LINKS =
  '</llms.txt>; rel="alternate"; type="text/plain"; title="llms.txt", </sitemap.xml>; rel="sitemap"; type="application/xml", </rss/feed.xml>; rel="alternate"; type="application/rss+xml"; title="RSS"'
const SOGOU_SITE_VERIFICATION = 'MTIf7YYFo3'

const withAgentDiscoveryHeaders = response => {
  const nextResponse = new Response(response.body, response)
  nextResponse.headers.set('Link', AGENT_DISCOVERY_LINKS)
  return nextResponse
}

const wantsMarkdownOverview = request => {
  const accept = request.headers.get('accept')?.toLowerCase() || ''
  return accept.includes('text/markdown')
}

export const onRequestGet = async context => {
  const url = new URL(context.request.url)
  if (url.pathname === '/sogousiteverification.txt') {
    return new Response(SOGOU_SITE_VERIFICATION, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })
  }

  if (!wantsMarkdownOverview(context.request)) {
    return withAgentDiscoveryHeaders(await context.next())
  }

  const llmsUrl = new URL('/llms.txt', context.request.url)
  const response = await context.env.ASSETS.fetch(
    new Request(llmsUrl.toString(), context.request)
  )
  const markdownResponse = withAgentDiscoveryHeaders(response)
  markdownResponse.headers.set('Content-Type', 'text/plain; charset=utf-8')
  markdownResponse.headers.set('Vary', 'Accept')
  return markdownResponse
}
