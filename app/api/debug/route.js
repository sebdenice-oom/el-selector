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
      body: JSON.stringify({ query: `{
        actifs: products(first: 5, query: "product_type:Raquettes status:active") {
          edges {
            node {
              id
              title
              status
              variants(first: 1) {
                edges {
                  node {
                    availableForSale
                    inventoryQuantity
                  }
                }
              }
              metafields(first: 20) {
                edges {
                  node {
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
        total_actifs: productsCount(query: "product_type:Raquettes status:active") { count }
        total_tous: productsCount(query: "product_type:Raquettes") { count }
      }` }),
    }
  )
  const json = await res.json()
  return Response.json(json)
}
