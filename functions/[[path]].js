// Cloudflare Pages Function：旧 UUID 文章地址 308 跳到当前 slug。
//
// 为什么跳转逻辑必须放这里：
// 本站是 Cloudflare Pages 静态托管，构建时只产出预渲染页面，请求时没有
// Next.js 服务在跑——middleware.ts 和 getStaticProps 里的跳转分支在
// 线上根本不会执行，这就是 PR #1 的跳转上线后实测仍 404 的根因
// （redirect.json 明明已生成、映射也在，3 条旧 UUID 地址仍全部 404）。
// Pages Function 是本站唯一在请求时执行的边缘逻辑，配合
// public/_routes.json 把文章路径纳入 Function 处理范围后，跳转才真正生效。
//
// 映射来源：构建时生成的 public/redirect.json（pages/index.js），
// 通过 ASSETS 读取，和 functions/index.js 读 llms.txt 的方式一致；
// 读一次后缓存在模块作用域里，不用每次请求都读。

const PLAIN_UUID_RE = /^[a-f0-9]{32}$/i
const DASHED_UUID_RE =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i

let redirectMap = null
let redirectMapPromise = null

// 32 位无横线 Notion ID 转成带横线的 UUID；已是 UUID 的统一小写返回
function toUuid(segment) {
  const lower = segment.toLowerCase()
  if (PLAIN_UUID_RE.test(lower)) {
    return `${lower.slice(0, 8)}-${lower.slice(8, 12)}-${lower.slice(12, 16)}-${lower.slice(16, 20)}-${lower.slice(20)}`
  }
  return lower
}

async function loadRedirectMap(context) {
  if (redirectMap) return redirectMap
  if (!redirectMapPromise) {
    redirectMapPromise = (async () => {
      const url = new URL('/redirect.json', context.request.url)
      const response = await context.env.ASSETS.fetch(
        new Request(url.toString(), context.request)
      )
      if (!response.ok) return {}
      const map = await response.json()
      redirectMap = map
      return map
    })().catch(() => ({}))
  }
  return redirectMapPromise
}

export const onRequest = async context => {
  try {
    const url = new URL(context.request.url)
    const parts = url.pathname.split('/').filter(Boolean)
    // 只处理 /<分类>/<id> 两段式文章地址，如 /book/<32位ID>
    if (parts.length === 2) {
      const last = parts[1]
      if (PLAIN_UUID_RE.test(last) || DASHED_UUID_RE.test(last)) {
        const map = await loadRedirectMap(context)
        const target = map[toUuid(last)]
        // 目标就是当前地址时不跳，避免 /book/<当前slug就是UUID> 自循环
        if (target && `/${target}` !== url.pathname) {
          return Response.redirect(`${url.origin}/${target}`, 308)
        }
      }
    }
  } catch (error) {
    // 跳转逻辑任何异常都不能拦住正常访问，交给下一层正常处理
    console.error('UUID redirect failed:', error)
  }
  return context.next()
}
