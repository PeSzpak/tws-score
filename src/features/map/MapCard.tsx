import { Link } from 'react-router'
import { ChevronRight, Heart } from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge'
import { formatScore } from '../../lib/rating'
import type { Place, ReviewState } from '../../lib/types'
import { KindIcon } from '../home/PlaceCard'
import styles from './MapCard.module.css'

type Props = {
  place: Place
  state: ReviewState
  partnerName: string
  cover: string | null
}

function shortDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export function MapCard({ place, state, partnerName, cover }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        {cover ? <img src={cover} alt={`Foto de ${place.nome}`} /> : <KindIcon tipo={place.tipo} size={28} />}
      </div>
      <div className={styles.body}>
        <span className={styles.name}>{place.nome}</span>
        <div className={styles.meta}>
          {state.kind === 'revealed' ? (
            <span className={styles.score} aria-label={`Nota do casal ${formatScore(state.average)}`}>
              <Heart size={13} fill="currentColor" strokeWidth={0} aria-hidden />
              {formatScore(state.average)}
            </span>
          ) : (
            <StatusBadge state={state} partnerName={partnerName} />
          )}
          <span>{place.tipo === 'cafe' ? 'Café' : 'Restaurante'}</span>
          <span aria-hidden>·</span>
          <span>{shortDate(place.visitadoEm)}</span>
        </div>
        <Link to={`/lugar/${place.id}`} className={styles.link}>
          Ver lugar <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  )
}
