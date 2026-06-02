import { getRaquettes } from '../../../lib/shopify'

export async function GET() {
  const raquettes = await getRaquettes()
  return Response.json({
    total: raquettes.length,
    exemple: raquettes[0] || null,
  })
}
