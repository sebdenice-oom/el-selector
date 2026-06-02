export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  if (!code) return Response.json({ error: 'Code manquant' }, { status: 400 })

  const res = await fetch(
    `https://esprit-padel-shop.myshopify.com/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    }
  )
  const data = await res.json()
  const token = data.access_token

  return new Response(`
    <h2>Token obtenu ✅</h2>
    <p>Copiez ce token dans Vercel → Environment Variables → SHOPIFY_ADMIN_API_TOKEN</p>
    <code style="font-size:14px;word-break:break-all">${token}</code>
  `, { headers: { 'Content-Type': 'text/html' } })
}
