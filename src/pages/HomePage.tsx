import { useState } from 'react'
import { Link } from 'react-router'
import { useMembers } from '../auth/members-context'
import { LoadError } from '../components/LoadError'
import { listPhotoUrls } from '../data/photos'
import { listPlaces } from '../data/places'
import { listReviewAuthors, listVisibleReviews } from '../data/reviews'
import { filterPlaces, type KindFilter } from '../features/home/filterPlaces'
import home from '../features/home/home.module.css'
import { PlaceCard } from '../features/home/PlaceCard'
import { reviewState } from '../lib/rating'
import { useLoad } from '../lib/useLoad'
import styles from './page.module.css'

const FILTERS: { value: KindFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'cafe', label: 'Cafés' },
  { value: 'restaurante', label: 'Restaurantes' },
]

async function loadHome() {
  const [places, authors, reviews, photos] = await Promise.all([
    listPlaces(),
    listReviewAuthors(),
    listVisibleReviews(),
    listPhotoUrls(),
  ])
  const covers = new Map<string, string>()
  for (const p of photos) if (!covers.has(p.placeId)) covers.set(p.placeId, p.url)
  return { places, authors, reviews, covers }
}

export function HomePage() {
  const { userId, partner } = useMembers()
  const [kind, setKind] = useState<KindFilter>('todos')
  const [query, setQuery] = useState('')
  const home$ = useLoad(loadHome, 'home')

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Nossos lugares</h1>
      </header>

      {home$.status === 'error' && <LoadError onRetry={home$.reload} />}

      {home$.status === 'ready' && home$.data.places.length === 0 && (
        <div className={home.empty}>
          <p>Nenhum lugar ainda. Qual vai ser o primeiro?</p>
          <Link to="/novo" className="btn btn-primary">
            Registrar visita
          </Link>
        </div>
      )}

      {home$.status === 'ready' && home$.data.places.length > 0 && (
        <>
          <div className={home.controls}>
            <div className={home.segmented} role="group" aria-label="Filtrar por tipo">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={home.segment}
                  aria-pressed={kind === f.value}
                  onClick={() => setKind(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              className="input"
              type="search"
              placeholder="Buscar pelo nome"
              aria-label="Buscar pelo nome"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={home.list}>
            {filterPlaces(home$.data.places, kind, query).map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                partnerName={partner?.nome ?? 'o outro'}
                cover={home$.data.covers.get(place.id) ?? null}
                state={reviewState(
                  userId,
                  home$.data.authors.get(place.id) ?? [],
                  home$.data.reviews.filter((r) => r.placeId === place.id),
                )}
              />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
