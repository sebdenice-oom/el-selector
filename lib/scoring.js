const SEUILS_BASE = {
  debutant:      { Puissance: 45, Confort: 50, Spin: 45, Contrôle: 50, Tolérance: 50, Maniabilité: 50 },
  intermediaire: { Puissance: 55, Confort: 55, Spin: 55, Contrôle: 58, Tolérance: 55, Maniabilité: 58 },
  avance:        { Puissance: 62, Confort: 52, Spin: 62, Contrôle: 65, Tolérance: 52, Maniabilité: 62 },
  competition:   { Puissance: 70, Confort: 48, Spin: 68, Contrôle: 70, Tolérance: 48, Maniabilité: 68 },
}

const BOOSTS_SENSATION = {
  puissance:   { Puissance: +10, Confort:  -5, Spin:  +3, Contrôle:   0, Tolérance:  -5, Maniabilité:  -5 },
  maniabilite: { Puissance:  -5, Confort:  +3, Spin:   0, Contrôle:  +5, Tolérance:  +3, Maniabilité:  +8 },
  controle:    { Puissance:  -5, Confort:   0, Spin:   0, Contrôle: +10, Tolérance:  +5, Maniabilité:  +3 },
  confort:     { Puissance:  -5, Confort: +10, Spin:  -5, Contrôle:  +3, Tolérance:  +8, Maniabilité:  +3 },
  spin:        { Puissance:  +5, Confort:  -5, Spin: +10, Contrôle:   0, Tolérance:  -5, Maniabilité:   0 },
}

const POIDS_SCORING = {
  puissance:   { Puissance: 10, Confort: 1, Spin: 3, Contrôle: 2, Tolérance: 1, Maniabilité: 1 },
  maniabilite: { Puissance: 1, Confort: 3, Spin: 2, Contrôle: 5, Tolérance: 3, Maniabilité: 10 },
  controle:    { Puissance: 1, Confort: 2, Spin: 2, Contrôle: 10, Tolérance: 5, Maniabilité: 4 },
  confort:     { Puissance: 1, Confort: 10, Spin: 1, Contrôle: 3, Tolérance: 7, Maniabilité: 3 },
  spin:        { Puissance: 4, Confort: 1, Spin: 10, Contrôle: 2, Tolérance: 1, Maniabilité: 2 },
}

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']

function coeffGenre(genreJoueur, genreRaquette) {
  if (!genreRaquette || genreRaquette === 'Unisexe') return 1.0
  if (genreRaquette === genreJoueur) return 1.0
  if (genreJoueur === 'Junior') return 0.9
  return 0.75
}

function getSeuilsEffectifs(niveau, sensation) {
  const base = SEUILS_BASE[niveau] || SEUILS_BASE.intermediaire
  const boost = BOOSTS_SENSATION[sensation] || BOOSTS_SENSATION.maniabilite
  const result = {}
  DIMS.forEach(d => {
    result[d] = Math.max(0, Math.min(95, base[d] + boost[d]))
  })
  return result
}

function couche1(raquette, quiz) {
  const { genre, niveau, budget, sensation } = quiz
  const schema = raquette.schema || {}

  if (Object.keys(schema).length === 0) return { ok: false, raison: 'pas_de_schema' }
  if (raquette.stock <= 0) return { ok: false, raison: 'stock_zero' }
  if (raquette.price > budget) return { ok: false, raison: 'hors_budget' }

  const seuils = getSeuilsEffectifs(niveau, sensation)
  const echecs = DIMS.filter(d => (schema[d] || 0) < seuils[d])
  if (echecs.length > 0) return { ok: false, raison: 'seuil_' + echecs.join('_') }

  const poids = POIDS_SCORING[sensation] || POIDS_SCORING.maniabilite
  let num = 0, den = 0
  DIMS.forEach(d => {
    num += poids[d] * (schema[d] || 0)
    den += poids[d] * 100
  })
  const scoreTech = den > 0 ? (num / den) * 100 : 0
  const coeff = coeffGenre(genre, raquette.genre)

  return { ok: true, scoreTech, coeffGenre: coeff }
}

function normalise(valeur, min, max) {
  if (max === min) return 50
  return Math.max(0, Math.min(100, ((valeur - min) / (max - min)) * 100))
}

function couche2(pool) {
  if (pool.length === 0) return []

  const marges = pool.map(r => r.marge)
  const stocks = pool.map(r => r.stock)
  const rotations = pool.map(r => r.rotation)

  const [minM, maxM] = [Math.min(...marges), Math.max(...marges)]
  const [minS, maxS] = [Math.min(...stocks), Math.max(...stocks)]
  const [minR, maxR] = [Math.min(...rotations), Math.max(...rotations)]

  return pool.map(r => {
    const scoreMarge    = normalise(r.marge, minM, maxM)
    const scoreStock    = normalise(r.stock, minS, maxS)
    const scoreRotation = normalise(r.rotation, minR, maxR)
    const scoreCommercial = (scoreMarge * 3 + scoreStock * 2 + scoreRotation * 1) / 6
    const scoreFinal = (r.scoreTech * r.coeffGenre * 0.6) + (scoreCommercial * 0.4)

    return { ...r, scoreMarge, scoreStock, scoreRotation, scoreCommercial, scoreFinal: Math.round(scoreFinal) }
  })
}

export function scoreRaquettes(raquettes, quiz, topN = 10) {
  const pool = []
  raquettes.forEach(r => {
    const resultat = couche1(r, quiz)
    if (resultat.ok) {
      pool.push({ ...r, scoreTech: resultat.scoreTech, coeffGenre: resultat.coeffGenre })
    }
  })
  const scores = couche2(pool)
  return scores.sort((a, b) => b.scoreFinal - a.scoreFinal).slice(0, topN)
}
