import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMembers } from '../auth/members-context'
import { createPlace, listPlaces } from '../data/places'
import { uploadPhoto } from '../data/photos'
import { listReviewAuthors, submitReview } from '../data/reviews'
import { getWish, removeWish } from '../data/wishlist'
import { ReviewForm } from '../features/review/ReviewForm'
import { PlaceStep } from '../features/visit/PlaceStep'
import { pendingForMe } from '../features/visit/pendingForMe'
import { submitVisit } from '../features/visit/submitVisit'
import { clearDraft, emptyDraft, loadDraft, NEW_VISIT_DRAFT, saveDraft, type VisitDraft } from '../lib/draft'
import { todayIso } from '../lib/geo'
import { compressImage } from '../lib/image'
import { useLoad } from '../lib/useLoad'
import visit from '../features/visit/visit.module.css'
import styles from './page.module.css'

function formatShortDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

async function loadPending(userId: string) {
  const [places, authors] = await Promise.all([listPlaces(), listReviewAuthors()])
  return pendingForMe(places, authors, userId, todayIso())
}

export function NewVisitPage() {
  const navigate = useNavigate()
  const { userId, partner } = useMembers()
  const pending = useLoad(() => loadPending(userId), userId)
  const [params] = useSearchParams()
  const wishId = params.get('wish')
  const [draft, setDraft] = useState<VisitDraft>(() => loadDraft(NEW_VISIT_DRAFT) ?? emptyDraft(todayIso()))
  const [step, setStep] = useState<1 | 2>(draft.placeId ? 2 : 1)
  const [photos, setPhotos] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => saveDraft(NEW_VISIT_DRAFT, draft), [draft])

  useEffect(() => {
    if (!wishId || draft.wishId === wishId) return
    getWish(wishId).then((wish) => {
      if (!wish) return
      const base = emptyDraft(todayIso())
      setDraft({ ...base, wishId: wish.id, place: { ...base.place, nome: wish.nome, tipo: wish.tipo } })
      setStep(1)
    })
  }, [wishId, draft.wishId])

  function discardDraft() {
    clearDraft(NEW_VISIT_DRAFT)
    setDraft(emptyDraft(todayIso()))
    setPhotos([])
    setError(null)
    setStep(1)
  }

  async function send() {
    setSubmitting(true)
    setError(null)
    try {
      const { placeId, photoErrors } = await submitVisit(draft, photos, {
        newId: () => crypto.randomUUID(),
        createPlace,
        submitReview,
        uploadPhoto,
        compressImage,
        removeWish,
        saveDraft: (d) => {
          saveDraft(NEW_VISIT_DRAFT, d)
          setDraft(d)
        },
      })
      clearDraft(NEW_VISIT_DRAFT)
      navigate(`/lugar/${placeId}`, { replace: true, state: { photoErrors } })
    } catch {
      setError('Não deu pra enviar agora. Seu rascunho está salvo.')
      setSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        {step === 2 && !draft.placeId && (
          <button className="btn btn-ghost" style={{ paddingLeft: 0 }} onClick={() => setStep(1)}>
            <ChevronLeft size={18} /> {draft.place.nome}
          </button>
        )}
        <h1 className={styles.title}>{step === 1 ? 'Nova visita' : 'Sua avaliação'}</h1>
        {draft.placeId && (
          <div className={visit.pending}>
            <p>
              Terminando a avaliação de <strong>{draft.place.nome}</strong> ({formatShortDate(draft.place.visitadoEm)}).
            </p>
            <button className="btn btn-ghost" onClick={discardDraft}>
              Descartar rascunho
            </button>
          </div>
        )}
      </header>

      {step === 1 && !draft.placeId && pending.status === 'ready' && pending.data.length > 0 && (
        <section className={visit.partnerPlaces}>
          <h2>{partner?.nome ?? 'O outro'} já registrou</h2>
          {pending.data.map((p) => (
            <Link key={p.id} to={`/lugar/${p.id}`} className={visit.partnerPlace}>
              <span>{p.nome}</span>
              <span className={visit.go}>
                avaliar <ChevronRight size={16} />
              </span>
            </Link>
          ))}
        </section>
      )}

      {step === 1 ? (
        <PlaceStep
          value={draft.place}
          onChange={(patch) => setDraft((d) => ({ ...d, place: { ...d.place, ...patch } }))}
          onNext={() => setStep(2)}
        />
      ) : (
        <ReviewForm
          value={{ scores: draft.scores, comentario: draft.comentario, photos }}
          onChange={(v) => {
            setDraft((d) => ({ ...d, scores: v.scores, comentario: v.comentario }))
            setPhotos(v.photos)
          }}
          onSubmit={send}
          submitting={submitting}
          error={error}
        />
      )}
    </main>
  )
}
