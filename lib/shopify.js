const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN
const VERSION = process.env.SHOPIFY_API_VERSION || '2026-04'
const ENDPOINT = `https://${DOMAIN}/admin/api/${VERSION}/graphql.json`

async function shopifyQuery(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  return json.data
}

export async function getRaquettes() {
  const query = `
    query getRaquettes($cursor: String) {
      products(first: 250, after: $cursor, query: "product_type:Raquette") {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id
            title
            handle
            images(first: 1) {
              edges { node { url altText } }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                  inventoryQuantity
                  inventoryItem {
                    unitCost { amount }
                  }
                }
              }
            }
            metafields(namespace: "custom", first: 10) {
              edges {
                node {
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  `

  let allRaquettes = []
  let cursor = null
  let hasNextPage = true

  while (hasNextPage) {
    const data = await shopifyQuery(query, { cursor })
    const { edges, pageInfo } = data.products
    allRaquettes = allRaquettes.concat(edges.map(e => e.node))
    hasNextPage = pageInfo.hasNextPage
    cursor = pageInfo.endCursor
  }

  return allRaquettes.map(normalizeProduct)
}

export async function updateRotation(productId, unitsVendues) {
  const mutation = `
    mutation updateMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { key value }
        userErrors { field message }
      }
    }
  `
  await shopifyQuery(mutation, {
    metafields: [{
      ownerId: productId,
      namespace: 'custom',
      key: 'rotation',
      value: String(unitsVendues),
      type: 'number_integer',
    }]
  })
}

export async function updateCustomerProfile(customerId, profil) {
  const mutation = `
    mutation updateCustomerMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { key value }
        userErrors { field message }
