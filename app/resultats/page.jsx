'use client'
import { useEffect, useState } from 'react'

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']
const DIM_COLORS = {
  Puissance: '#2B4EE5', Confort: '#1D9E75', Spin: '#7F77DD',
  Contrôle: '#F6BC3E', Tolérance: '#D85A30', Maniabilité: '#D4537E',
}
const LABEL_SENSATION = {
  puissance: '⚡ Puissance', maniabilite: '🏃 Maniabilité',
  controle: '🎯 Contrôle', confort: '🛡️ Confort', spin: '🌀 Spin',
}
const LABEL_NIVEAU = {
  debutant: 'Débutant', intermediaire: 'Intermédiaire',
  avance: 'Avancé', competition: 'Compétition',
}

function RaquetteCard({ raquette, rank }) {
  const [expanded, setExpanded] = useState(rank === 1)
  const isTop = rank === 1

  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${isTop ? '#2B4EE5' : '#E8EAF0'}`,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 14,
    }}>

      {/* Badge top */}
      {isTop && (
        <div style={{ background: '#2B4EE5', color: '#fff', padding: '6px 16px', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', fontFamily: 'Nunito, sans-serif' }}>
          ⭐ Notre recommandation
        </div>
      )}

      {/* Résumé — toujours visible */}
      <div style={{ display: 'flex', gap: 14, padding: '16px 16px 12px' }}>

        {/* Image */}
        <div style={{ width: 88, height: 88, flexShrink: 0, background: '#F0F3FF', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {raquette.image
            ? <img src={raquette.image} alt={raquette.imageAlt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : <span style={{ fontSize: 32 }}>🏏</span>}
        </div>

        {/* Infos */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, color: '#1A1A2E', lineHeight: 1.3, marginBottom: 5 }}>
            {raquette.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 20, fontWeight: 900, color: '#2B4EE5' }}>
              {parseFloat(raquette.price).toFixed(2)} €
            </span>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#EEF2FF', color: '#2B4EE5', padding: '2px 10px', borderRadius: 100 }}>
              Score {raquette.scoreFinal}%
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#F0F3FF', color: '#2B4EE5', padding: '3px 9px', borderRadius: 8 }}>
              {raquette.genre}
            </span>
            {raquette.poids && (
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#F8F9FB', color: '#888', padding: '3px 9px', borderRadius: 8, border: '1px solid #E8EAF0' }}>
                {raquette.poids}
              </span>
            )}
            {raquette.precommande ? (
  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#FEF5E0', color: '#9A6B00', padding: '3px 9px', borderRadius: 8, border: '1px solid #F6BC3E' }}>
    🔜 Précommande
  </span>
) : (
  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#F0FAF4', color: '#1D9E75', padding: '3px 9px', borderRadius: 8 }}>
    ✓ En stock
  </span>
)}
          </div>

          {/* Lien produit — toujours visible */}
          <a href={raquette.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: isTop ? '#2B4EE5' : 'transparent',
              color: isTop ? '#fff' : '#2B4EE5',
              border: isTop ? 'none' : '1.5px solid #2B4EE5',
              fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800,
              padding: '9px 16px', borderRadius: 10, textDecoration: 'none',
              transition: 'all .15s',
            }}>
            Voir la raquette →
          </a>
        </div>
      </div>

      {/* Bouton toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: 'none', border: 'none',
          borderTop: '1px solid #EEF0F6', padding: '10px 16px',
          fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700,
          color: '#2B4EE5', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
        {expanded ? 'Masquer les caractéristiques' : 'Voir les caractéristiques'}
        <span style={{ display: 'inline-block', transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {/* Section dépliable */}
      {expanded && (
        <div style={{ padding: '14px 16px 16px', borderTop: '1px solid #EEF0F6' }}>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Profil El Comparateur
          </p>
          {DIMS.filter(d => raquette.schema[d] !== undefined).map(d => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: '#888', width: 80, flexShrink: 0 }}>{d}</span>
              <div style={{ flex: 1, height: 6, background: '#EEF0F6', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${raquette.schema[d]}%`, height: '100%', background: DIM_COLORS[d], borderRadius: 3 }} />
              </div>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, color: '#1A1A2E', width: 24, textAlign: 'right' }}>
                {raquette.schema[d]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ResultatsPage() {
  const [resultats, setResultats] = useState(null)
  const [quiz, setQuiz] = useState(null)

  useEffect(() => {
    const r = sessionStorage.getItem('selector_resultats')
    const q = sessionStorage.getItem('selector_quiz')
    if (r) setResultats(JSON.parse(r))
    if (q) setQuiz(JSON.parse(q))
  }, [])

  if (!resultats) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--fond)' }}>
        <div className="spinner" />
      </main>
    )
  }

  const sensations = Array.isArray(quiz?.sensation) ? quiz.sensation : (quiz?.sensation ? [quiz.sensation] : [])

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8EAF0', padding: '14px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, fontWeight: 900, color: '#2B4EE5' }}>
            EL <span style={{ color: '#F6BC3E' }}>SELECTOR</span>
          </span>
        </div>
      </div>

      {/* Hero profil */}
      <div style={{ background: '#EEF2FF', padding: '28px 20px', textAlign: 'center', borderBottom: '1px solid #D8E0FA' }}>
        <h1 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, color: '#1A1A2E', marginBottom: 8 }}>
          Tes raquettes idéales 🏏
        </h1>
        {quiz && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
            {[
              quiz.genre,
              LABEL_NIVEAU[quiz.niveau],
              `${quiz.budget}€ max`,
              ...sensations.map((s, i) => `${i + 1}. ${LABEL_SENSATION[s]}`),
            ].map(tag => (
              <span key={tag} style={{
                fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700,
                padding: '4px 12px', borderRadius: 100,
                background: tag.match(/^\d\./) ? '#FEF5E0' : '#fff',
                color: tag.match(/^\d\./) ? '#9A6B00' : '#2B4EE5',
                border: `1px solid ${tag.match(/^\d\./) ? '#F6BC3E' : '#C8D3F9'}`,
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="container" style={{ paddingTop: 24 }}>
        {resultats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>
              Aucune raquette ne correspond à tes critères.
            </p>
            <p style={{ color: 'var(--texte-muted)', marginBottom: 32, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
              Essaie d'augmenter ton budget ou de modifier ton niveau.
            </p>
            <a href="/" className="btn btn-secondary" style={{ display: 'inline-flex' }}>← Refaire le quiz</a>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--texte-muted)', fontSize: 13, fontWeight: 700, marginBottom: 20, fontFamily: 'Nunito, sans-serif' }}>
              {resultats.length} raquette{resultats.length > 1 ? 's' : ''} sélectionnée{resultats.length > 1 ? 's' : ''} pour toi
            </p>
            {resultats.map((r, i) => (
              <RaquetteCard key={r.id} raquette={r} rank={i + 1} />
            ))}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <a href="/" className="btn btn-secondary" style={{ display: 'inline-flex', width: 'auto' }}>
                ← Refaire le quiz
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
