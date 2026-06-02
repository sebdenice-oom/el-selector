// lib/shopify.js
// Client Shopify Admin API — appels serveur uniquement

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

// Récupère toutes les raquettes avec leurs métachamps et données commerciales
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
            metafields(
              identifiers: [
                { namespace: "custom", key: "schema" }
                { namespace: "custom", key: "genre" }
                { namespace: "custom", key: "poids" }
                { namespace: "custom", key: "rotation" }
              ]
            ) {
              namespace
              key
              value
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

// Met à jour le métachamp rotation d'un produit
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

// Met à jour le profil selector d'un client
export async function updateCustomerProfile(customerId, profil) {
  const mutation = `
    mutation updateCustomerMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { key value }
        userErrors { field message }
      }
    }
  `
  await shopifyQuery(mutation, {
    metafields: [{
      ownerId: customerId,
      namespace: 'custom',
      key: 'profil_selector',
      value: JSON.stringify(profil),
      type: 'json',
    }]
  })
}

// Calcul des ventes sur 90 jours via ShopifyQL
export async function getVentesParProduit() {
  const query = `
    query {
      shopifyqlQuery(query: """
        FROM sales
        SELECT product_id, SUM(net_quantity) AS units_sold
        WHERE product_type = 'Raquette'
        SINCE -90d
        UNTIL today
        GROUP BY product_id
      """) {
        ... on TableResponse {
          tableData {
            rowData
            columns { name dataType }
          }
        }
      }
    }
  `
  const data = await shopifyQuery(query)
  const rows = data?.shopifyqlQuery?.tableData?.rowData || []
  const map = {}
  rows.forEach(row => {
    const [productId, unitsSold] = row
    map[productId] = parseInt(unitsSold) || 0
  })
  return map
}

// Normalise un produit Shopify pour l'algorithme
function normalizeProduct(product) {
  const variant = product.variants.edges[0]?.node || {}
  const image = product.images.edges[0]?.node || {}

  const metaMap = {}
  product.metafields.forEach(mf => {
    if (mf) metaMap[mf.key] = mf.value
  })

  let schema = {}
  try { schema = JSON.parse(metaMap.schema || '{}') } catch (e) {}

  const price = parseFloat(variant.price || 0)
  const cost = parseFloat(variant.inventoryItem?.unitCost?.amount || 0)
  const marge = cost > 0 ? ((price - cost) / price) * 100 : 0

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    url: `https://${DOMAIN}/products/${product.handle}`,
    image: image.url || '',
    imageAlt: image.altText || product.title,
    price,
    cost,
    marge,
    stock: variant.inventoryQuantity || 0,
    rotation: parseInt(metaMap.rotation || '0'),
    genre: metaMap.genre || 'Unisexe',
    poids: metaMap.poids || '',
    schema,
  }
}
