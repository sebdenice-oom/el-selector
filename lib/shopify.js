const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN
const VERSION = process.env.SHOPIFY_API_VERSION || '2026-04'
const ENDPOINT = `https://${DOMAIN}/admin/api/${VERSION}/graphql.json`

const MUTATION_UPDATE_METAFIELD = 'mutation M($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { key value } userErrors { field message } } }'

async function shopifyQuery(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error('Shopify API error: ' + res.status)
  const json = await res.json()
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  return json.data
}

export async function getRaquettes() {
  const query = 'query getRaquettes($cursor: String) { products(first: 250, after: $cursor, query: "product_type:Raquettes") { pageInfo { hasNextPage endCursor } edges { node { id title handle images(first: 1) { edges { node { url altText } } } variants(first: 1) { edges { node { id price inventoryQuantity inventoryItem { unitCost { amount } } } } } metafields(namespace: "custom", first: 10) { edges { node { key value } } } } } } }'

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
  await shopifyQuery(MUTATION_UPDATE_METAFIELD, {
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
  await shopifyQuery(MUTATION_UPDATE_METAFIELD, {
    metafields: [{
      ownerId: customerId,
      namespace: 'custom',
      key: 'profil_selector',
      value: JSON.stringify(profil),
      type: 'json',
    }]
  })
}

export async function getVentesParProduit() {
  const query = 'query { shopifyqlQuery(query: "FROM sales SELECT product_id, SUM(net_quantity) AS units_sold WHERE product_type = \'Raquettes\' SINCE -90d UNTIL today GROUP BY product_id") { ... on TableResponse { tableData { rowData columns { name dataType } } } } }'
  const data = await shopifyQuery(query)
  const rows = data?.shopifyqlQuery?.tableData?.rowData || []
  const map = {}
  rows.forEach(row => {
    const [productId, unitsSold] = row
    map[productId] = parseInt(unitsSold) || 0
  })
  return map
}

function normalizeProduct(product) {
  const variant = product.variants.edges[0]?.node || {}
  const image = product.images.edges[0]?.node || {}

  const metaMap = {}
  product.metafields.edges.forEach(function(edge) {
    if (edge.node) metaMap[edge.node.key] = edge.node.value
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
    url: 'https://' + DOMAIN + '/products/' + product.handle,
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
