import { getRaquettes } from '../../../lib/shopify'

export async function GET() {
  const raquettes = await getRaquettes()
  const avecStock = raquettes.filter(r => r.stock > 0)
  const sansStock = raquettes.filter(r => r.stock === 0)
  const avecSchema = raquettes.filter(r => Object.keys(r.schema).length > 0)

  return Response.json({
    total: raquettes.length,
    avecStock: avecStock.length,
    sansStock: sansStock.length,
    avecSchema: avecSchema.length,
    exempleAvecStock: avecStock[0] || null,
  })
}
