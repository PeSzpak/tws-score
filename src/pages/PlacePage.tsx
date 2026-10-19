import { lazy, Suspense, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { useMembers } from '../auth/members-context'
import { LoadError } from '../components/LoadError'
import { listPhotoUrls, uploadPhoto } from '../data/photos'
import { getPlace } from '../data/places'
import { listReviewAuthors, listVisibleReviews, submitReview } from '../data/reviews'
import { KindIcon } from '../features/home/PlaceCard'
import place from '../features/place/place.module.css'
import { GoogleInfoCard } from '../features/place/GoogleInfoCard'
import { PhotoGallery } from '../features/place/PhotoGallery'
import { RevealCards } from '../features/place/RevealCards'
import { ReviewForm, type ReviewFormValue } from '../features/review/ReviewForm'
import { uploadPhotos } from '../features/visit/submitVisit'
import { clearDraft, emptyDraft, forgetNewVisitDraftFor, loadDraft, placeDraftKey, saveDraft } from '../lib/draft'
import { todayIso } from '../lib/geo'
import { compressImage } from '../lib/image'
import { completeScores, reviewState } from '../lib/rating'
import { useLoad } from '../lib/useLoad'
import styles from './page.module.css'

const MiniMap = lazy(() => import('../components/MiniMap').then((m) => ({ default: m.MiniMap })))

async function loadPlace(id: string) {
  const [found, authors, reviews, photos] = await Promise.all([
    getPlace(id),
    listReviewAuthors(),
    listVisibleReviews(id),
    listPhotoUrls(id),
  ])
  return { place: found, authorIds: authors.get(id) ?? [], reviews, photos: photos.map((p) => p.url) }
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function photoNotice(errors: number): string | null {
  if (errors === 0) return null
  return errors === 1
    ? 'Uma foto não subiu. Dá pra adicionar de novo aqui embaixo.'
    : `${errors} fotos não subiram. Dá pra adicionar de novo aqui embaixo.`
}

export function PlacePage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const { me, partner, userId } = useMembers()
  const data = useLoad(() => loadPlace(id), id)
  const [notice, setNotice] = useState(() =>
    photoNotice((location.state as { photoErrors?: number })?.photoErrors ?? 0),
  )
  const [reviewing, setReviewing] = useState(false)
  const [form, setForm] = useState<ReviewFormValue>(() => {
    const d = loadDraft(placeDraftKey(id))
    return { scores: d?.scores ?? {}, comentario: d?.comentario ?? '', photos: [] }
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateForm(v: ReviewFormValue) {
    setForm(v)
    saveDraft(placeDraftKey(id), { ...emptyDraft(todayIso()), placeId: id, scores: v.scores, comentario: v.comentario })
  }

  async function sendReview() {
    const scores = completeScores(form.scores)
    if (!scores) return
    setBusy(true)
    setError(null)
    try {
      await submitReview(id, scores, form.comentario.trim() || null)
      const photoErrors = await uploadPhotos(id, form.photos, { uploadPhoto, compressImage })
      clearDraft(placeDraftKey(id))
      forgetNewVisitDraftFor(id)
      setNotice(photoNotice(photoErrors))
      setReviewing(false)
      data.reload()
    } catch {
      setError('Não deu pra enviar agora. Seu rascunho está salvo.')
    } finally {
      setBusy(false)
    }
  }

  async function addPhotos(files: File[]) {
    setBusy(true)
    const errors = await uploadPhotos(id, files, { uploadPhoto, compressImage })
    setNotice(photoNotice(errors))
    setBusy(false)
    data.reload()
  }

  if (data.status === 'loading') return <main className={styles.page} />
  if (data.status === 'error') {
    return (
      <main className={styles.page}>
        <LoadError onRetry={data.reload} />
      </main>
    )
  }
  if (!data.data.place) {
    return (
      <main className={styles.page}>
        <p className="muted">Esse lugar não existe mais.</p>
        <Link to="/" className="btn">
          Voltar
        </Link>
      </main>
    )
  }

  const p = data.data.place
  const state = reviewState(userId, data.data.authorIds, data.data.reviews)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={`btn btn-ghost ${place.back}`}>
          <ChevronLeft size={18} /> Lugares
        </Link>
        <h1 className={styles.title}>{p.nome}</h1>
        <div className={place.meta}>
          <KindIcon tipo={p.tipo} size={16} />
          <span>{p.tipo === 'cafe' ? 'Café' : 'Restaurante'}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(p.visitadoEm)}</span>
        </div>
        {p.endereco && <p className={`${place.address} muted`}>{p.endereco}</p>}
      </header>

      <div className={place.sections}>
        {notice && (
          <p className={place.notice} role="status">
            {notice}
          </p>
        )}

        {reviewing ? (
          <ReviewForm value={form} onChange={updateForm} onSubmit={sendReview} submitting={busy} error={error} />
        ) : (
          <RevealCards state={state} me={me} partner={partner} onReview={() => setReviewing(true)} />
        )}

        <PhotoGallery urls={data.data.photos} uploading={busy} onAdd={addPhotos} />

        {p.google && <GoogleInfoCard nome={p.nome} info={p.google} />}

        {p.lat !== null && p.lng !== null && (
          <Suspense>
            <MiniMap lat={p.lat} lng={p.lng} />
          </Suspense>
        )}
      </div>
    </main>
  )
}
