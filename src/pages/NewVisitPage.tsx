import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { createPlace } from '../data/places'
import { uploadPhoto } from '../data/photos'
import { submitReview } from '../data/reviews'
import { getWish, removeWish } from '../data/wishlist'
import { ReviewForm } from '../features/review/ReviewForm'
import { PlaceStep } from '../features/visit/PlaceStep'
import { submitVisit } from '../features/visit/submitVisit'
import { clearDraft, emptyDraft, loadDraft, NEW_VISIT_DRAFT, saveDraft, type VisitDraft } from '../lib/draft'
import { todayIso } from '../lib/geo'
import { compressImage } from '../lib/image'
import styles from './page.module.css'

export function NewVisitPage() {
  const navigate = useNavigate()
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
      </header>

      {step === 1 ? (
        <PlaceStep value={draft.place} onChange={(place) => setDraft({ ...draft, place })} onNext={() => setStep(2)} />
      ) : (
        <ReviewForm
          value={{ scores: draft.scores, comentario: draft.comentario, photos }}
          onChange={(v) => {
            setDraft({ ...draft, scores: v.scores, comentario: v.comentario })
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
