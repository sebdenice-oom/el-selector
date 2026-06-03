import { getRaquettes } from '../../../lib/shopify'

export async function GET() {
  const raquettes = await getRaquettes()
  const avecSchema = raquettes.filter(r => Object.keys(r.schema).length > 0)

  const parGenre = {}
  avecSchema.forEach(r => {
    const g = r.genre || 'Non renseigné'
    parGenre[g] = (parGenre[g] || 0) + 1
  })

  const parGenreAvecStock = {}
  avecSchema.filter(r => r.stock > 0).forEach(r => {
    const g = r.genre || 'Non renseigné'
    parGenreAvecStock[g] = (parGenreAvecStock[g] || 0) + 1
  })

  return Response.json({
    total_avec_schema: avecSchema.length,
    repartition_genre: parGenre,
    repartition_genre_avec_stock: parGenreAvecStock,
  })
}
