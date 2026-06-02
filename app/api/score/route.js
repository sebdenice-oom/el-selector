// app/api/score/route.js
// Endpoint principal — reçoit les réponses quiz, renvoie le TOP

import { getRaquettes, updateCustomerProfile } from '../../lib/shopify'
import { scoreRaquettes } from '../../lib/scoring'
import { identifyProfile, trackQuizComplete } from '../../lib/klaviyo'

export async function POST(request) {
  try {
    const body = await request.json()
    const { quiz, email, customerId } = body

    // Validation des champs obligatoires
    const { genre, niveau, budget, sensation } = quiz
    if (!genre || !niveau || !budget || !sensation) {
      return Response.json({ error: 'Champs quiz manquants' }, { status: 400 })
    }

    // Récupération de toutes les raquettes depuis Shopify
    const raquettes = await getRaquettes()

    // Application de l'algorithme de scoring
    const top = scoreRaquettes(raquettes, quiz, 10)

    if (top.length === 0) {
      return Response.json({
        resultats: [],
        message: 'Aucune raquette ne correspond à votre profil. Essayez d\'élargir votre budget.'
      })
    }

    // Injection asynchrone (non bloquante)
    const profilData = {
      genre,
      niveau,
      budget,
      sensation,
      date_quiz: new Date().toISOString(),
      top_raquettes: top.slice(0, 3).map(r => ({ id: r.id, titre: r.title })),
    }

    // On n'attend pas ces appels pour ne pas ralentir la réponse
    const injections = []

    if (email) {
      injections.push(identifyProfile(email, quiz, top))
      injections.push(trackQuizComplete(email, quiz, top))
    }

    if (customerId) {
      injections.push(updateCustomerProfile(customerId, profilData))
    }

    // Lancement en arrière-plan
    Promise.allSettled(injections).catch(console.error)

    // Réponse au client — on retire les données sensibles (marge, coût)
    const resultatsPublics = top.map(r => ({
      id: r.id,
      title: r.title,
      handle: r.handle,
      url: r.url,
      image: r.image,
      imageAlt: r.imageAlt,
      price: r.price,
      stock: r.stock,
      genre: r.genre,
      poids: r.poids,
      schema: r.schema,
      scoreFinal: r.scoreFinal,
      scoreTech: Math.round(r.scoreTech),
    }))

    return Response.json({ resultats: resultatsPublics })

  } catch (err) {
    console.error('Score API error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
