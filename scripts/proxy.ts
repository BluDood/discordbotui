const API_BASE = 'https://discord.com/api/v10'

export default {
  async fetch(req: Request) {
    const url = new URL(req.url)
    const targetUrl = new URL(API_BASE + url.pathname)
    targetUrl.search = url.search

    const headers = new Headers()

    const auth = req.headers.get('Authorization')
    if (auth) headers.set('Authorization', auth)

    const contentType = req.headers.get('Content-Type')
    if (contentType) headers.set('Content-Type', contentType)

    const canHaveBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      req.method.toUpperCase()
    )

    const body = canHaveBody ? await req.arrayBuffer() : undefined

    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body?.byteLength ? body : undefined
    })

    const resHeaders = new Headers(res.headers)
    resHeaders.set('Access-Control-Allow-Origin', '*')
    resHeaders.set('Access-Control-Allow-Headers', '*')

    return new Response(res.body, {
      status: res.status,
      headers: resHeaders
    })
  }
} satisfies Deno.ServeDefaultExport
