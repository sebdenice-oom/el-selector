import { getRaquettes } from '../../../lib/shopify'

export async function GET() {
  const raquettes = await getRaquettes()
  const avecSchema = raquettes.filter(r => Object.keys(r.schema).length > 0)
  const parGenre = {}
  avecSchema.filter(r => r.stock > 0).forEach(r => {
    const g = r.genre || 'Non renseigné'
    parGenre[g] = (parGenre[g] || 0) + 1
  })
  return Response.json({
    total_fetched: raquettes.length,
    avec_schema: avecSchema.length,
    avec_schema_et_stock: Object.values(parGenre).reduce((a,b) => a+b, 0),
    par_genre: parGenre,
  })
}
