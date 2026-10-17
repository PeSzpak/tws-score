import type { Score } from '../lib/types'
import styles from './rating.module.css'
import { Scale } from './Scale'

type Props = {
  label: string
  value: Score | null
  onChange?: (s: Score) => void
}

function Dot({ filled }: { filled: boolean }) {
  return <span className={filled ? `${styles.dot} ${styles.dotFilled}` : styles.dot} aria-hidden />
}

export function Dots({ label, value, onChange }: Props) {
  return (
    <div className={styles.dotsRow}>
      <span className={styles.dotsLabel}>{label}</span>
      {onChange ? (
        <Scale
          label={label}
          value={value}
          onChange={onChange}
          className={styles.dots}
          optionClassName={styles.dotButton}
          optionLabel={(s) => `${label} ${s}`}
          renderOption={(_, filled) => <Dot filled={filled} />}
        />
      ) : (
        <span className={styles.dots} role="img" aria-label={`${label}: ${value ?? 0} de 5`}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={styles.dotButton}>
              <Dot filled={value !== null && s <= value} />
            </span>
          ))}
        </span>
      )}
    </div>
  )
}
