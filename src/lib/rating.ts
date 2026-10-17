import type { Review, ReviewState, Scores } from './types'

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

export const CRITERIA = [
  { key: 'comida', label: 'Comida/bebida' },
  { key: 'ambiente', label: 'Ambiente' },
  { key: 'atendimento', label: 'Atendimento' },
  { key: 'preco', label: 'Preço' },
] as const

export function completeScores(s: Partial<Scores>): Scores | null {
  const { notaGeral, comida, ambiente, atendimento, preco } = s
  if (!notaGeral || !comida || !ambiente || !atendimento || !preco) return null
  return { notaGeral, comida, ambiente, atendimento, preco }
}
