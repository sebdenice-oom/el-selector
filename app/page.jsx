'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ETAPES = [
  {
    id: 'genre',
    titre: 'Tu es ?',
    type: 'chips',
    options: [
      { value: 'Homme', label: '🎾 Homme' },
      { value: 'Femme', label: '🎾 Femme' },
      { value: 'Junior', label: '🌟 Junior' },
    ],
  },
  {
    id: 'niveau',
    titre: 'Quel est ton niveau de jeu ?',
    type: 'level_cards',
    options: [
      { value: 'debutant',      label: 'Débutant',       icon: '🎾' },
      { value: 'intermediaire', label: 'Intermédiaire',  icon: '🏆' },
      { value: 'avance',        label: 'Avancé',         icon: '⚡' },
      { value: 'competition',   label: 'Compétition',    icon: '🥇' },
    ],
  },
  {
    id: 'budget',
    titre: 'Ton budget maximum',
    type: 'slider',
    min: 50, max: 350, step: 10, default: 150,
  },
  {
    id: 'sensation',
    titre: 'Tes critères importants',
    sous_titre: 'Choisis jusqu\'à 3 sensations par ordre d\'importance',
    type: 'ranked_chips',
    options: [
      { value: 'puissance',   label: '⚡ Puissance' },
      { value: 'maniabilite', label: '🏃 Maniabilité' },
      { value: 'controle',    label: '🎯 Contrôle' },
      { value: 'confort',     label: '🛡️ Confort' },
      { value: 'spin',        label: '🌀 Spin' },
    ],
  },
  {
    id: 'email',
    titre: 'Reçois tes recommandations',
    sous_titre: 'Optionnel — reçois ton TOP 3 par email',
    type: 'email',
  },
]

const RANG_LABEL = ['1er', '2e', '3e']

export default function QuizPage() {
  const router = useRouter()
  const [etape, setEtape] = useState(0)
  const [reponses, setReponses] = useState({ budget: 150, sensation: [] })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const etapeActuelle = ETAPES[etape]
  const progression = (etape / ETAPES.length) * 100

  function selectionner(valeur) {
    setReponses(prev => ({ ...prev, [etapeActuelle.id]: valeur }))
  }

  function toggleSensation(valeur) {
    setReponses(prev => {
      const current = prev.sensation || []
      if (current.includes(valeur)) return { ...prev, sensation: current.filter(v => v !== valeur) }
      if (current.length >= 3) return prev
      return { ...prev, sensation: [...current, valeur] }
    })
  }

  function valeurActuelle() { return reponses[etapeActuelle.id] }

  function peutContinuer() {
    if (etapeActuelle.type === 'email') return true
    if (etapeActuelle.type === 'ranked_chips') return (reponses.sensation || []).length >= 1
    return !!valeurActuelle()
  }

  async function suivant() {
    if (etape < ETAPES.length - 1) { setEtape(e => e + 1); return }
    await soumettre()
  }

  async function soumettre() {
    setLoading(true)
    setErreur('')
    try {
      const quiz = { genre: reponses.genre, niveau: reponses.niveau, budget: reponses.budget, sensation: reponses.sensation }
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz, email: reponses.email || null, customerId: null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sessionStorage.setItem('selector_resultats', JSON.stringify(data.resultats))
      sessionStorage.setItem('selector_quiz', JSON.stringify(quiz))
      router.push('/resultats')
    } catch (e) {
      setErreur('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--fond)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--texte-muted)', fontFamily: 'var(--font)', fontWeight: 700 }}>
            Analyse de ton profil…
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--fond)' }}>

      {/* Header */}
      <header style={{ background: 'var(--blanc)', borderBottom: '1px solid var(--bordure)', padding: '14px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 900, color: 'var(--bleu)', letterSpacing: '-0.01em' }}>
            EL <span style={{ color: 'var(--jaune)' }}>SELECTOR</span>
          </span>
        </div>
      </header>

      {/* Progress */}
      <div style={{ background: 'var(--blanc)', padding: '10px 20px 14px', borderBottom: '1px solid var(--bordure)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progression}%` }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>{etape + 1} / {ETAPES.length}</span>
            {etape > 0 && (
              <button onClick={() => setEtape(e => e - 1)}
                style={{ fontSize: 13, color: 'var(--texte-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700 }}>
                ← Retour
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="container fade-up" style={{ flex: 1, paddingTop: 40, paddingBottom: 32 }} key={etape}>

        <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: 'var(--texte)', textAlign: 'center', marginBottom: etapeActuelle.sous_titre ? 8 : 32, lineHeight: 1.2 }}>
          {etapeActuelle.titre}
        </h1>

        {etapeActuelle.sous_titre && (
          <p style={{ color: 'var(--texte-muted)', marginBottom: 28, fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
            {etapeActuelle.sous_titre}
          </p>
        )}

        {/* Chips (genre) */}
        {etapeActuelle.type === 'chips' && (
          <div className="chip-group" style={{ justifyContent: 'center', marginBottom: 8 }}>
            {etapeActuelle.options.map(opt => (
              <button key={opt.value}
                className={`chip ${valeurActuelle() === opt.value ? 'active' : ''}`}
                onClick={() => { selectionner(opt.value); setTimeout(() => setEtape(e => Math.min(e + 1, ETAPES.length - 1)), 200) }}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Level cards */}
        {etapeActuelle.type === 'level_cards' && (
          <div className="level-grid">
            {etapeActuelle.options.map(opt => (
              <button key={opt.value}
                className={`level-card ${valeurActuelle() === opt.value ? 'active' : ''}`}
                onClick={() => { selectionner(opt.value); setTimeout(() => setEtape(e => Math.min(e + 1, ETAPES.length - 1)), 200) }}>
                <div className="level-card-icon">{opt.icon}</div>
                <div className="level-card-label">{opt.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* Slider budget */}
        {etapeActuelle.type === 'slider' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span style={{ fontFamily: 'var(--font)', fontSize: 56, fontWeight: 900, color: 'var(--bleu)' }}>
                {reponses.budget}€
              </span>
            </div>
            <input type="range" min={etapeActuelle.min} max={etapeActuelle.max} step={etapeActuelle.step}
              value={reponses.budget} onChange={e => selectionner(parseInt(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, marginBottom: 28 }}>
              <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>{etapeActuelle.min}€</span>
              <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>{etapeActuelle.max}€</span>
            </div>
          </div>
        )}

        {/* Ranked chips */}
        {etapeActuelle.type === 'ranked_chips' && (
          <div>
            <div className="chip-group" style={{ justifyContent: 'center', marginBottom: 20 }}>
              {etapeActuelle.options.map(opt => {
                const rang = (reponses.sensation || []).indexOf(opt.value)
                const selected = rang !== -1
                const disabled = !selected && (reponses.sensation || []).length >= 3
                return (
                  <button key={opt.value}
                    disabled={disabled}
                    onClick={() => toggleSensation(opt.value)}
                    style={{
                      padding: '10px 20px', paddingLeft: selected ? 12 : 20,
                      borderRadius: 100, border: `2px solid ${selected ? 'var(--bleu)' : 'var(--bordure)'}`,
                      background: selected ? 'var(--bleu)' : 'var(--blanc)',
                      color: selected ? '#fff' : 'var(--texte-muted)',
                      fontFamily: 'var(--font)', fontSize: 14, fontWeight: 700,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.4 : 1,
                      display: 'flex', alignItems: 'center', gap: 7,
                      transition: 'all .15s',
                    }}>
                    {selected && (
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%', background: 'var(--jaune)',
                        color: '#1A1A2E', fontSize: 10, fontWeight: 900,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {rang + 1}
                      </span>
                    )}
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {(reponses.sensation || []).length > 0 && (
              <div style={{ background: 'var(--blanc)', border: '1px solid var(--bordure)', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
                {(reponses.sensation || []).map((s, i) => {
                  const opt = etapeActuelle.options.find(o => o.value === s)
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: i < reponses.sensation.length - 1 ? 10 : 0, marginBottom: i < reponses.sensation.length - 1 ? 10 : 0, borderBottom: i < reponses.sensation.length - 1 ? '1px solid var(--bordure)' : 'none' }}>
                      <span style={{ fontSize: 11, color: 'var(--texte-muted)', fontWeight: 800, width: 28 }}>{RANG_LABEL[i]}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--texte)', flex: 1 }}>{opt?.label}</span>
                      <button onClick={() => toggleSensation(s)}
                        style={{ fontSize: 12, color: 'var(--texte-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Email */}
        {etapeActuelle.type === 'email' && (
          <div>
            <input type="email" placeholder="ton@email.com"
              value={reponses.email || ''}
              onChange={e => selectionner(e.target.value)}
              style={{ width: '100%', padding: '16px', background: 'var(--blanc)', border: '2px solid var(--bordure)', borderRadius: 12, color: 'var(--texte)', fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, outline: 'none', marginBottom: 12 }} />
            <p style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 600, textAlign: 'center' }}>
              🔒 Données traitées conformément au RGPD. Aucun spam.
            </p>
          </div>
        )}

        {erreur && <p style={{ color: '#D32F2F', fontSize: 14, marginTop: 12, textAlign: 'center', fontWeight: 700 }}>{erreur}</p>}
      </div>

      {/* CTA */}
      <div className="container" style={{ paddingBottom: 40 }}>
        {(etapeActuelle.type === 'slider' || etapeActuelle.type === 'email' || etapeActuelle.type === 'ranked_chips') && (
          <button className="btn btn-primary" onClick={suivant} disabled={!peutContinuer()}>
            {etape === ETAPES.length - 1 ? 'Voir mes raquettes →' : 'Continuer →'}
          </button>
        )}
      </div>
    </main>
  )
}
