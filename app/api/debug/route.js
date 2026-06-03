import { getRaquettes } from '../../../lib/shopify'

export async function GET() {
  const raquettes = await getRaquettes()
  const avecSchema = raquettes.filter(r => Object.keys(r.schema).length > 0)
  const dims = ['Puissance','Confort','Spin','Contrôle','Tolérance','Maniabilité']
  const seuils = [60, 65, 70, 75, 80, 85, 90, 95]

  const distribution = {}
  dims.forEach(d => {
    distribution[d] = {}
    seuils.forEach(s => {
      distribution[d][s] = avecSchema.filter(r => (r.schema[d] || 0) >= s).length
    })
  })

  return Response.json({
    total_avec_schema: avecSchema.length,
    distribution,
  })
}
