import { getRaquettes } from '../../../lib/shopify'

export async function GET() {
  const raquettes = await getRaquettes()
  
  return Response.json({
    total: raquettes.length,
    exemple: raquettes[0] || null,
    stocks: raquettes.slice(0, 5).map(r => ({
      titre: r.title,
      stock: r.stock,
      prix: r.price,
      genre: r.genre,
      schema: r.schema,
    }))
  })
}
