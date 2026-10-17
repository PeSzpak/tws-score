import { Link } from 'react-router'
import { Coffee, Heart, UtensilsCrossed } from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge'
import { formatScore } from '../../lib/rating'
import type { Place, ReviewState } from '../../lib/types'
import styles from './PlaceCard.module.css'

type Props = {
  place: Place
  state: ReviewState
  partnerName: string
  cover: string | null
}

export function KindIcon({ tipo, size = 22 }: { tipo: Place['tipo']; size?: number }) {
  return tipo === 'cafe' ? (
    <Coffee size={size} strokeWidth={1.5} aria-label="Café" />
  ) : (
    <UtensilsCrossed size={size} strokeWidth={1.5} aria-label="Restaurante" />
  )
}

export function PlaceCard({ place, state, partnerName, cover }: Props) {
  return (
    <Link to={`/lugar/${place.id}`} className={styles.card}>
      <div className={styles.cover}>{cover ? <img src={cover} alt="" loading="lazy" /> : <KindIcon tipo={place.tipo} />}</div>
      <div className={styles.body}>
        <span className={styles.name}>{place.nome}</span>
        <div className={styles.meta}>
          {state.kind === 'revealed' ? (
            <span className={styles.score} aria-label={`Nota do casal ${formatScore(state.average)}`}>
              <Heart size={14} fill="currentColor" strokeWidth={0} aria-hidden />
              {formatScore(state.average)}
            </span>
          ) : (
            <StatusBadge state={state} partnerName={partnerName} />
          )}
          <span>{place.tipo === 'cafe' ? 'Café' : 'Restaurante'}</span>
        </div>
      </div>
    </Link>
  )
}
