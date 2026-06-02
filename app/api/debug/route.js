const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN
const VERSION = process.env.SHOPIFY_API_VERSION || '2026-04'

export async function GET() {
  const res = await fetch(
    `https://${DOMAIN}/admin/api/${VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': TOKEN,
      },
      body: JSON.stringify({
        query: '{ products(first: 5) { edges { node { id title productType } } } }'
      }),
    }
  )
  const json = await res.json()
  return Response.json(json)
}
