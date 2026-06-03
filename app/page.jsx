'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ETAPES = [
  {
    id: 'genre',
    titre: 'Vous êtes ?',
    type: 'chips',
    options: [
      { value: 'Homme', label: 'Homme' },
      { value: 'Femme', label: 'Femme' },
      { value: 'Junior', label: 'Junior' },
    ],
  },
  {
    id: 'niveau',
    titre: 'Votre niveau de jeu',
    type: 'chips',
    options: [
      { value: 'debutant', label: 'Débutant' },
      { value: 'intermediaire', label: 'Intermédiaire' },
      { value: 'avance', label: 'Avancé' },
      { value: 'competition', label: 'Compétition' },
    ],
  },
  {
    id: 'budget',
    titre: 'Votre budget maximum',
    type: 'slider',
    min: 50,
    max: 350,
    step: 10,
    default: 150,
  },
  {
    id: 'sensation',
    titre: 'Vos critères importants',
    sous_titre: 'Choisissez jusqu\'à 3 sensations par ordre d\'importance',
    type: 'ranked_chips',
    options: [
      { value: 'puissance', label: '⚡ Puissance' },
      { value: 'maniabilite', label: '🏃 Maniabilité' },
      { value: 'controle', label: '🎯 Contrôle' },
      { value: 'confort', label: '🛡️ Confort' },
      { value: 'spin', label: '🌀 Spin' },
    ],
  },
  {
    id: 'email',
    titre: 'Recevoir vos recommandations',
    sous_titre: 'Optionnel — pour recevoir votre TOP 3 par email',
    type: 'email',
  },
]

const RANG_LABEL = ['1er', '2e', '3e']
const RANG_COLOR = ['#00E87A', '#4AB4FF', '#BA7517']

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
      if (current.includes(valeur)) {
        return { ...prev, sensation: current.filter(v => v !== valeur) }
      }
      if (current.length >= 3) return prev
      return { ...prev, sensation: [...current, valeur] }
    })
  }

  function valeurActuelle() {
    return reponses[etapeActuelle.id]
  }

  function peutContinuer() {
    if (etapeActuelle.type === 'email') return true
    if (etapeActuelle.type === 'ranked_chips') return (reponses.sensation || []).length >= 1
    return !!valeurActuelle()
  }

  async function suivant() {
    if (etape < ETAPES.length - 1) {
      setEtape(e => e + 1)
      return
    }
    await soumettre()
  }

  async function soumettre() {
    setLoading(true)
    setErreur('')
    try {
      const quiz = {
        genre: reponses.genre,
        niveau: reponses.niveau,
        budget: reponses.budget,
        sensation: reponses.sensation,
      }
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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--texte-muted)', fontFamily: 'var(--font-body)' }}>Analyse de votre profil…</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '24px 20px 0', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.05em', color: 'var(--vert)' }}>
            EL SELECTOR
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progression}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--texte-muted)' }}>{etape + 1} / {ETAPES.length}</span>
          {etape > 0 && (
            <button onClick={() => setEtape(e => e - 1)}
              style={{ fontSize: 12, color: 'var(--texte-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Retour
            </button>
          )}
        </div>
      </header>

      <div className="container fade-up" style={{ flex: 1, paddingTop: 48, paddingBottom: 32 }} key={etape}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 48px)', letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: etapeActuelle.sous_titre ? 8 : 32 }}>
          {etapeActuelle.titre}
        </h1>
        {etapeActuelle.sous_titre && (
          <p style={{ color: 'var(--texte-muted)', marginBottom: 32, fontSize: 14 }}>{etapeActuelle.sous_titre}</p>
        )}

        {etapeActuelle.type === 'chips' && (
          <div className="chip-group">
            {etapeActuelle.options.map(opt => (
              <button key={opt.value}
                className={`chip ${valeurActuelle() === opt.value ? 'active' : ''}`}
                onClick={() => {
                  selectionner(opt.value)
                  setTimeout(() => setEtape(e => Math.min(e + 1, ETAPES.length - 1)), 200)
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {etapeActuelle.type === 'ranked_chips' && (
          <div>
            <div className="chip-group" style={{ marginBottom: 20 }}>
              {etapeActuelle.options.map(opt => {
                const rang = (reponses.sensation || []).indexOf(opt.value)
                const selected = rang !== -1
                const disabled = !selected && (reponses.sensation || []).length >= 3
                return (
                  <button key={opt.value}
                    className={`chip ${selected ? 'active' : ''}`}
                    disabled={disabled}
                    onClick={() => toggleSensation(opt.value)}
                    style={{ opacity: disabled ? 0.4 : 1, position: 'relative', paddingLeft: selected ? 36 : 18 }}>
                    {selected && (
                      <span style={{
                        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                        width: 18, height: 18, borderRadius: '50%',
                        background: RANG_COLOR[rang],
                        color: '#000', fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              <div style={{ marginBottom: 20 }}>
                {(reponses.sensation || []).map((s, i) => {
                  const opt = etapeActuelle.options.find(o => o.value === s)
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--texte-muted)', width: 28 }}>{RANG_LABEL[i]}</span>
                      <span style={{ fontSize: 13, color: 'var(--blanc)', fontWeight: 500 }}>{opt?.label}</span>
                      <button onClick={() => toggleSensation(s)}
                        style={{ fontSize: 11, color: 'var(--texte-muted)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {etapeActuelle.type === 'slider' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 64, color: 'var(--vert)' }}>
                {reponses.budget}€
              </span>
            </div>
            <div className="slider-wrap">
              <input type="range" min={etapeActuelle.min} max={etapeActuelle.max} step={etapeActuelle.step}
                value={reponses.budget} onChange={e => selectionner(parseInt(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--texte-muted)' }}>{etapeActuelle.min}€</span>
                <span style={{ fontSize: 12, color: 'var(--texte-muted)' }}>{etapeActuelle.max}€</span>
              </div>
            </div>
          </div>
        )}

        {etapeActuelle.type === 'email' && (
          <div>
            <input type="email" placeholder="votre@email.com"
              value={reponses.email || ''}
              onChange={e => selectionner(e.target.value)}
              style={{ width: '100%', padding: '16px', background: 'var(--gris)', border: '1.5px solid var(--gris-light)', borderRadius: 'var(--radius-sm)', color: 'var(--blanc)', fontFamily: 'var(--font-body)', fontSize: 16, outline: 'none' }} />
            <p style={{ fontSize: 12, color: 'var(--texte-muted)', marginTop: 12 }}>
              🔒 Vos données sont traitées conformément au RGPD. Pas de spam.
            </p>
          </div>
        )}

        {erreur && <p style={{ color: '#FF6B6B', fontSize: 14, marginTop: 16 }}>{erreur}</p>}
      </div>

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
