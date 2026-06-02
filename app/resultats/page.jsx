'use client'
// app/resultats/page.jsx — Page de résultats El Selector

import { useEffect, useState } from 'react'

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']
const COLORS_SCHEMA = {
  Puissance: '#FF6B4A', Confort: '#00E87A', Spin: '#9B8FFF',
  Contrôle: '#4AB4FF', Tolérance: '#FFBE00', Maniabilité: '#FF8AB4',
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
  const isTop = rank === 1

  return (
    <div className="fade-up" style={{
      animationDelay: `${(rank - 1) * 0.08}s`,
      background: isTop ? 'linear-gradient(135deg, #1A1A1A 0%, #0F2A1A 100%)' : 'var(--gris)',
      border: `1.5px solid ${isTop ? 'var(--vert)' : 'var(--gris-mid)'}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      {isTop && (
        <div style={{
          background: 'var(--vert)', color: 'var(--noir)',
          padding: '6px 16px', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          fontFamily: 'var(--font-display)',
        }}>
          ★ Notre recommandation
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, padding: 20 }}>
        {/* Image */}
        <div style={{
          width: 100, height: 100, flexShrink: 0,
          background: '#111', borderRadius: 8, overflow: 'hidden',
        }}>
          {raquette.image ? (
            <img src={raquette.image} alt={raquette.imageAlt}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--texte-muted)', fontSize: 28 }}>🏏</span>
            </div>
          )}
        </div>

        {/* Infos */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
            <h3 style={{
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
              color: 'var(--blanc)', lineHeight: 1.3,
            }}>
              {raquette.title}
            </h3>
            <span className={`score-badge ${raquette.scoreFinal >= 65 ? 'score-high' : 'score-mid'}`}>
              {raquette.scoreFinal}%
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: isTop ? 'var(--vert)' : 'var(--blanc)' }}>
              {parseFloat(raquette.price).toFixed(2)} €
            </span>
            <span style={{
              fontSize: 11, color: 'var(--texte-muted)',
              background: 'var(--gris-mid)', padding: '2px 8px', borderRadius: 4,
            }}>
              {raquette.genre}
            </span>
            {raquette.poids && (
              <span style={{
                fontSize: 11, color: 'var(--texte-muted)',
                background: 'var(--gris-mid)', padding: '2px 8px', borderRadius: 4,
              }}>
                {raquette.poids}
              </span>
            )}
          </div>

          {/* Barres dimensions */}
          <div className="dim-bars">
            {DIMS.filter(d => raquette.schema[d] !== undefined).slice(0, 4).map(d => (
              <div key={d} className="dim-row">
                <span className="dim-name">{d}</span>
                <div className="dim-bar-bg">
                  <div className="dim-bar-fill" style={{
                    width: `${raquette.schema[d]}%`,
                    background: COLORS_SCHEMA[d],
                  }} />
                </div>
                <span className="dim-val">{raquette.schema[d]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 20px' }}>
        <a href={raquette.url} target="_blank" rel="noopener noreferrer"
          className={`btn ${isTop ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: '100%', textDecoration: 'none', display: 'flex' }}>
          Voir la raquette →
        </a>
      </div>
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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #0F2A1A 0%, var(--noir) 100%)',
        padding: '32px 20px 40px', textAlign: 'center',
        borderBottom: '1px solid var(--gris-mid)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--vert)', letterSpacing: '0.1em' }}>
          EL SELECTOR
        </span>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 7vw, 56px)',
          letterSpacing: '0.03em',
          lineHeight: 1,
          marginTop: 8, marginBottom: 16,
        }}>
          VOS RAQUETTES<br />
          <span style={{ color: 'var(--vert)' }}>IDÉALES</span>
        </h1>

        {quiz && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              quiz.genre,
              LABEL_NIVEAU[quiz.niveau],
              `${quiz.budget}€ max`,
              LABEL_SENSATION[quiz.sensation],
            ].map(tag => (
              <span key={tag} style={{
                fontSize: 12, padding: '4px 12px',
                background: 'rgba(0,232,122,0.1)',
                border: '1px solid rgba(0,232,122,0.3)',
                borderRadius: 100, color: 'var(--vert)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="container" style={{ paddingTop: 32 }}>
        {resultats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 18, marginBottom: 16 }}>Aucune raquette ne correspond à vos critères.</p>
            <p style={{ color: 'var(--texte-muted)', marginBottom: 32 }}>Essayez d'augmenter votre budget ou de choisir un autre niveau.</p>
            <a href="/" className="btn btn-secondary">← Refaire le quiz</a>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--texte-muted)', fontSize: 14, marginBottom: 24 }}>
              {resultats.length} raquette{resultats.length > 1 ? 's' : ''} sélectionnée{resultats.length > 1 ? 's' : ''} pour vous
            </p>
            {resultats.map((r, i) => (
              <RaquetteCard key={r.id} raquette={r} rank={i + 1} />
            ))}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <a href="/" className="btn btn-secondary">← Refaire le quiz</a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
