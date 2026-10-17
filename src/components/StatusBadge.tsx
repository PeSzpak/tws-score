import type { ReviewState } from '../lib/types'
import styles from './rating.module.css'

export function StatusBadge({ state, partnerName }: { state: ReviewState; partnerName: string }) {
  if (state.kind === 'waiting_me') return <span className={styles.badge}>esperando você</span>
  if (state.kind === 'waiting_partner') return <span className={styles.badge}>esperando {partnerName}</span>
  return null
}
