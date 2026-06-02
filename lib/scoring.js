// lib/scoring.js
// Algorithme de scoring El Selector — Couche 1 + Couche 2

// ─────────────────────────────────────────────
// COUCHE 1 — Seuils techniques par niveau + sensation
// ─────────────────────────────────────────────

const SEUILS_BASE = {
  debutant:      { Puissance: 55, Confort: 60, Spin: 55, Contrôle: 60, Tolérance: 65, Maniabilité: 65 },
  intermediaire: { Puissance: 65, Confort: 65, Spin: 65, Contrôle: 65, Tolérance: 65, Maniabilité: 65 },
  avance:        { Puissance: 72, Confort: 60, Spin: 72, Contrôle: 72, Tolérance: 60, Maniabilité: 70 },
  competition:   { Puissance: 80, Confort: 55, Spin: 78, Contrôle: 78, Tolérance: 55, Maniabilité: 75 },
}

const BOOSTS_SENSATION = {
  puissance:   { Puissance: +20, Confort: -10, Spin: +5,  Contrôle:   0, Tolérance: -10, Maniabilité: -10 },
  maniabilite: { Puissance: -10, Confort:  +5, Spin:  0,  Contrôle: +10, Tolérance:  +5, Maniabilité: +15 },
  controle:    { Puissance: -10, Confort:   0, Spin:  0,  Contrôle: +20, Tolérance: +10, Maniabilité:  +5 },
  confort:     { Puissance: -10, Confort: +20, Spin: -10, Contrôle:  +5, Tolérance: +15, Maniabilité:  +5 },
  spin:        { Puissance: +10, Confort: -10, Spin: +20, Contrôle:   0, Tolérance: -10, Maniabilité:   0 },
}

// Poids pour le score de classement (dimension pivot = ×10)
const POIDS_SCORING = {
  puissance:   { Puissance: 10, Confort: 1, Spin: 3, Contrôle: 2, Tolérance: 1, Maniabilité: 1 },
  maniabilite: { Puissance: 1, Confort: 3, Spin: 2, Contrôle: 5, Tolérance: 3, Maniabilité: 10 },
  controle:    { Puissance: 1, Confort: 2, Spin: 2, Contrôle: 10, Tolérance: 5, Maniabilité: 4 },
  confort:     { Puissance: 1, Confort: 10, Spin: 1, Contrôle: 3, Tolérance: 7, Maniabilité: 3 },
  spin:        { Puissance: 4, Confort: 1, Spin: 10, Contrôle: 2, Tolérance: 1, Maniabilité: 2 },
}

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']

// Coefficient genre (soft — pas d'exclusion dure)
function coeffGenre(genreJoueur, genreRaquette) {
  if (!genreRaquette || genreRaquette === 'Unisexe') return 1.0
  if (genreRaquette === genreJoueur) return 1.0
  if (genreJoueur === 'Junior') return 0.9
  return 0.75 // cross-genre
}

// Calcule les seuils effectifs selon niveau + sensation
function getSeuilsEffectifs(niveau, sensation) {
  const base = SEUILS_BASE[niveau] || SEUILS_BASE.intermediaire
  const boost = BOOSTS_SENSATION[sensation] || BOOSTS_SENSATION.maniabilite
  const result = {}
  DIMS.forEach(d => {
    result[d] = Math.max(0, Math.min(95, base[d] + boost[d]))
  })
  return result
}

// ─────────────────────────────────────────────
// COUCHE 1 — Filtres
// ─────────────────────────────────────────────

function couche1(raquette, quiz) {
  const { genre, niveau, budget, sensation } = quiz
  const schema = raquette.schema || {}

  // Filtre 1 : stock
  if (raquette.stock <= 0) return { ok: false, raison: 'stock_zero' }

  // Filtre 2 : budget
  if (raquette.price > budget) return { ok: false, raison: 'hors_budget' }

  // Filtre 3 : seuils techniques
  const seuils = getSeuilsEffectifs(niveau, sensation)
  const echecs = DIMS.filter(d => (schema[d] || 0) < seuils[d])
  if (echecs.length > 0) return { ok: false, raison: `seuil_${echecs.join('_')}` }

  // Score technique
  const poids = POIDS_SCORING[sensation] || POIDS_SCORING.maniabilite
  let num = 0, den = 0
  DIMS.forEach(d => {
    num += poids[d] * (schema[d] || 0)
    den += poids[d] * 100
  })
  const scoreTech = den > 0 ? (num / den) * 100 : 0

  // Coefficient genre
  const coeff = coeffGenre(genre, raquette.genre)

  return { ok: true, scoreTech, coeffGenre: coeff }
}

// ─────────────────────────────────────────────
// COUCHE 2 — Pondération commerciale
// ─────────────────────────────────────────────

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

    // Score commercial : marge ×3, stock ×2, rotation ×1
    const scoreCommercial = (scoreMarge * 3 + scoreStock * 2 + scoreRotation * 1) / 6

    // Score final : tech (avec coeff genre) + commercial
    const scoreFinal = (r.scoreTech * r.coeffGenre * 0.6) + (scoreCommercial * 0.4)

    return {
      ...r,
      scoreMarge,
      scoreStock,
      scoreRotation,
      scoreCommercial,
      scoreFinal: Math.round(scoreFinal),
    }
  })
}

// ─────────────────────────────────────────────
// POINT D'ENTRÉE PRINCIPAL
// ─────────────────────────────────────────────

export function scoreRaquettes(raquettes, quiz, topN = 10) {
  // Couche 1 : filtrage
  const pool = []
  raquettes.forEach(r => {
    const resultat = couche1(r, quiz)
    if (resultat.ok) {
      pool.push({ ...r, scoreTech: resultat.scoreTech, coeffGenre: resultat.coeffGenre })
    }
  })

  // Couche 2 : pondération commerciale
  const scores = couche2(pool)

  // Tri et sélection du TOP N
  return scores
    .sort((a, b) => b.scoreFinal - a.scoreFinal)
    .slice(0, topN)
}
