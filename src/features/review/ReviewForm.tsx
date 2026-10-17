import { Dots } from '../../components/Dots'
import { Hearts } from '../../components/Hearts'
import { PhotoPicker } from '../../components/PhotoPicker'
import { completeScores, CRITERIA } from '../../lib/rating'
import type { Scores } from '../../lib/types'
import styles from './ReviewForm.module.css'

export type ReviewFormValue = {
  scores: Partial<Scores>
  comentario: string
  photos: File[]
}

type Props = {
  value: ReviewFormValue
  onChange: (v: ReviewFormValue) => void
  onSubmit: () => void
  submitting: boolean
  error: string | null
}

export function ReviewForm({ value, onChange, onSubmit, submitting, error }: Props) {
  const ready = completeScores(value.scores) !== null
  const setScore = (key: keyof Scores, s: Scores[keyof Scores]) =>
    onChange({ ...value, scores: { ...value.scores, [key]: s } })

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        if (ready && !submitting) onSubmit()
      }}
    >
      <section className={styles.overall}>
        <h2 className={styles.sectionTitle}>Como foi?</h2>
        <Hearts size="lg" value={value.scores.notaGeral ?? null} onChange={(s) => setScore('notaGeral', s)} />
      </section>

      <section className={styles.criteria}>
        {CRITERIA.map(({ key, label }) => (
          <Dots key={key} label={label} value={value.scores[key] ?? null} onChange={(s) => setScore(key, s)} />
        ))}
      </section>

      <label className="field">
        Comentário
        <textarea
          className={`input ${styles.textarea}`}
          placeholder="Algo pra lembrar?"
          value={value.comentario}
          onChange={(e) => onChange({ ...value, comentario: e.target.value })}
        />
      </label>

      <section className={styles.section}>
        <span className="field">Fotos</span>
        <PhotoPicker photos={value.photos} onChange={(photos) => onChange({ ...value, photos })} />
      </section>

      <div className={styles.footer}>
        {error ? (
          <>
            <p className="error" role="alert">
              {error}
            </p>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              Tentar de novo
            </button>
          </>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={!ready || submitting}>
            {submitting ? 'Enviando…' : 'Enviar avaliação'}
          </button>
        )}
        <p className={`${styles.hint} muted`}>Depois de enviar, não dá pra mudar 💌</p>
      </div>
    </form>
  )
}
