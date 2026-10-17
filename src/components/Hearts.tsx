import { Heart } from 'lucide-react'
import type { Score } from '../lib/types'
import styles from './rating.module.css'
import { Scale } from './Scale'

type Props = {
  value: Score | null
  onChange?: (s: Score) => void
  size?: 'sm' | 'lg'
  label?: string
}

function HeartIcon({ filled, px }: { filled: boolean; px: number }) {
  return (
    <Heart
      size={px}
      strokeWidth={1.6}
      fill={filled ? 'currentColor' : 'none'}
      className={filled ? undefined : styles.empty}
      aria-hidden
    />
  )
}

export function Hearts({ value, onChange, size = 'sm', label = 'Nota geral' }: Props) {
  const px = size === 'lg' ? 34 : 16

  if (!onChange) {
    return (
      <span className={styles.hearts} role="img" aria-label={`${value ?? 0} de 5 corações`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <HeartIcon key={s} filled={value !== null && s <= value} px={px} />
        ))}
      </span>
    )
  }

  return (
    <Scale
      label={label}
      value={value}
      onChange={onChange}
      className={styles.hearts}
      optionClassName={styles.heartButton}
      optionLabel={(s) => (s === 1 ? '1 coração' : `${s} corações`)}
      renderOption={(_, filled) => <HeartIcon filled={filled} px={px} />}
    />
  )
}
