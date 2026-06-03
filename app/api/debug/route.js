import { getRaquettes } from '../../../lib/shopify'

export async function GET() {
  const raquettes = await getRaquettes()
  const avecSchema = raquettes.filter(r => Object.keys(r.schema).length > 0)
  const dims = ['Puissance','Confort','Spin','Contrôle','Tolérance','Maniabilité']
  
  const tranches = [
    [0,49],[50,59],[60,64],[65,69],[70,74],
    [75,79],[80,84],[85,89],[90,94],[95,100]
  ]

  const distribution = {}
  dims.forEach(d => {
    distribution[d] = tranches.map(([min, max]) => ({
      tranche: min + '-' + max,
      count: avecSchema.filter(r => {
        const v = r.schema[d] || 0
        return v >= min && v <= max
      }).length
    }))
  })

  return Response.json({
    total: avecSchema.length,
    distribution,
  })
}
