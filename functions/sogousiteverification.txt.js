const SOGOU_SITE_VERIFICATION = 'MTIf7YYFo3'

export const onRequestGet = () =>
  new Response(SOGOU_SITE_VERIFICATION, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
