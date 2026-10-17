import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Dots } from '../../components/Dots'
import { Hearts } from '../../components/Hearts'
import { CRITERIA, formatScore } from '../../lib/rating'
import type { Member, Review, ReviewState } from '../../lib/types'
import styles from './RevealCards.module.css'

type Props = {
  state: ReviewState
  me: Member
  partner: Member | null
  onReview: () => void
}

function Who({ member }: { member: Member }) {
  return (
    <div className={styles.who}>
      <span className={styles.emoji} aria-hidden>
        {member.avatarEmoji}
      </span>
      {member.nome}
    </div>
  )
}

function ReviewCard({ member, review, reveal }: { member: Member; review: Review; reveal: boolean }) {
  return (
    <article className={`${styles.card} ${reveal ? styles.reveal : ''}`} data-reveal={reveal}>
      <Who member={member} />
      <Hearts value={review.scores.notaGeral} size="lg" />
      <div>
        {CRITERIA.map(({ key, label }) => (
          <Dots key={key} label={label} value={review.scores[key]} />
        ))}
      </div>
      {review.comentario && <p className={styles.comment}>{review.comentario}</p>}
    </article>
  )
}

function SealedCard({ text }: { text: string }) {
  return (
    <article className={`${styles.card} ${styles.sealed}`}>
      <Heart className={styles.sealedHeart} size={28} fill="currentColor" strokeWidth={0} aria-hidden />
      <span>{text}</span>
    </article>
  )
}

function PromptCard({ text, onReview }: { text: string; onReview: () => void }) {
  return (
    <article className={`${styles.card} ${styles.prompt}`}>
      <p>{text}</p>
      <button className="btn btn-primary" onClick={onReview}>
        Avaliar
      </button>
    </article>
  )
}

const seenKey = (placeId: string) => `tws:revealed:${placeId}`

function useFirstReveal(placeId: string): boolean {
  const [first] = useState(() => {
    try {
      return localStorage.getItem(seenKey(placeId)) === null
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(seenKey(placeId), '1')
    } catch {
      // Without storage the reveal just plays again next time.
    }
  }, [placeId])

  return first
}

type RevealedState = Extract<ReviewState, { kind: 'revealed' }>

function Revealed({ state, me, partner }: { state: RevealedState; me: Member; partner: Member | null }) {
  const firstReveal = useFirstReveal(state.mine.placeId)
  return (
    <section className={styles.wrap}>
      <div className={`${styles.couple} ${firstReveal ? styles.reveal : ''}`}>
        <span className={styles.coupleLabel}>Nota do casal</span>
        <span className={styles.coupleScore}>
          <Heart size={28} fill="currentColor" strokeWidth={0} aria-hidden />
          {formatScore(state.average)}
        </span>
      </div>
      <div className={styles.cards}>
        <ReviewCard member={me} review={state.mine} reveal={false} />
        {partner && <ReviewCard member={partner} review={state.theirs} reveal={firstReveal} />}
      </div>
    </section>
  )
}

export function RevealCards({ state, me, partner, onReview }: Props) {
  const partnerName = partner?.nome ?? 'O outro'

  if (state.kind === 'revealed') return <Revealed state={state} me={me} partner={partner} />

  return (
    <section className={styles.cards}>
      {state.kind === 'waiting_partner' ? (
        <ReviewCard member={me} review={state.mine} reveal={false} />
      ) : (
        <PromptCard
          text={state.kind === 'waiting_me' ? `${partnerName} já avaliou. Sua vez!` : 'Que tal avaliar?'}
          onReview={onReview}
        />
      )}
      <SealedCard
        text={
          state.kind === 'waiting_me'
            ? `A nota de ${partnerName} aparece quando você avaliar`
            : `${partnerName} ainda não avaliou`
        }
      />
    </section>
  )
}
