import { useState } from 'react'
import { Clock, ExternalLink, MapPinned, Phone, Star } from 'lucide-react'
import { groupHours, weekdayIndex } from '../../lib/hours'
import type { GoogleInfo } from '../../lib/types'
import styles from './GoogleInfoCard.module.css'

type Props = { nome: string; info: GoogleInfo }

function mapsUrl(nome: string, info: GoogleInfo): string {
  if (info.mapsUrl) return info.mapsUrl
  const params = new URLSearchParams({ api: '1', query: nome, query_place_id: info.placeId })
  return `https://www.google.com/maps/search/?${params}`
}

function Hours({ horarios }: { horarios: string[] }) {
  const [hoje] = useState(() => weekdayIndex(new Date()))
  const groups = groupHours(horarios, hoje)
  const today = groups?.find((g) => g.hoje)
  return (
    <details className={styles.hours}>
      <summary>
        <Clock size={14} strokeWidth={1.6} aria-hidden /> {today ? `Hoje: ${today.horas.join(', ')}` : 'Horários'}
      </summary>
      {groups ? (
        <dl className={styles.week}>
          {groups.map((g) => (
            <div key={g.dias} className={g.hoje ? styles.today : undefined}>
              <dt>{g.dias}</dt>
              <dd>
                {g.horas.map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <ul>
          {horarios.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
    </details>
  )
}

export function GoogleInfoCard({ nome, info }: Props) {
  return (
    <section className={styles.card} aria-label="No Google">
      {(info.nota !== null || info.nivelPreco !== null) && (
        <p className={styles.summary}>
          {info.nota !== null && (
            <span>
              <Star size={14} strokeWidth={1.6} aria-hidden /> {info.nota.toLocaleString('pt-BR')} no Google
              {info.totalAvaliacoes !== null && (
                <span className="muted"> · {info.totalAvaliacoes.toLocaleString('pt-BR')} avaliações</span>
              )}
            </span>
          )}
          {info.nivelPreco !== null && <span className={styles.price}>{'$'.repeat(info.nivelPreco)}</span>}
        </p>
      )}

      {info.horarios.length > 0 && <Hours horarios={info.horarios} />}

      <div className={styles.actions}>
        {info.site && (
          <a className="btn" href={info.site} target="_blank" rel="noreferrer">
            <ExternalLink size={16} strokeWidth={1.6} /> Cardápio e site
          </a>
        )}
        {info.telefone && (
          <a className="btn" href={`tel:${info.telefone.replace(/\D/g, '')}`}>
            <Phone size={16} strokeWidth={1.6} /> Ligar
          </a>
        )}
        <a className="btn" href={mapsUrl(nome, info)} target="_blank" rel="noreferrer">
          <MapPinned size={16} strokeWidth={1.6} /> Abrir no Google Maps
        </a>
      </div>
    </section>
  )
}
