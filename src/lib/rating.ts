import type { Review, ReviewState } from './types'

export function coupleAverage(a: Review, b: Review): number {
  return (a.scores.notaGeral + b.scores.notaGeral) / 2
}

export function formatScore(n: number): string {
  return (Math.round(n * 10) / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

export function reviewState(myId: string, authorIds: string[], visible: Review[]): ReviewState {
  const mine = visible.find((r) => r.autorId === myId)
  const theirs = visible.find((r) => r.autorId !== myId)

  if (mine && theirs) {
    return { kind: 'revealed', mine, theirs, average: coupleAverage(mine, theirs) }
  }
  if (mine) return { kind: 'waiting_partner', mine }
  if (authorIds.some((id) => id !== myId)) return { kind: 'waiting_me' }
  return { kind: 'none' }
}
