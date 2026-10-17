import { coupleAverage, formatScore, reviewState } from './rating'
import type { Review, Score } from './types'

function review(autorId: string, notaGeral: Score): Review {
  return {
    id: `r-${autorId}`,
    placeId: 'p1',
    autorId,
    scores: { notaGeral, comida: 4, ambiente: 4, atendimento: 4, preco: 4 },
    comentario: null,
    criadoEm: '2026-10-16T12:00:00Z',
  }
}

const mine = review('a', 4)
const theirs = review('b', 5)

describe('reviewState', () => {
  test('ninguém avaliou', () => {
    expect(reviewState('a', [], [])).toEqual({ kind: 'none' })
  })

  test('só o parceiro avaliou', () => {
    expect(reviewState('a', ['b'], [])).toEqual({ kind: 'waiting_me' })
  })

  test('só eu avaliei', () => {
    expect(reviewState('a', ['a'], [mine])).toEqual({ kind: 'waiting_partner', mine })
  })

  test('os dois avaliaram', () => {
    expect(reviewState('a', ['a', 'b'], [mine, theirs])).toEqual({
      kind: 'revealed',
      mine,
      theirs,
      average: 4.5,
    })
  })

  test('nunca revela sem as duas avaliações visíveis', () => {
    expect(reviewState('a', ['a', 'b'], [mine])).toEqual({ kind: 'waiting_partner', mine })
  })
})

describe('coupleAverage', () => {
  test('média simples', () => {
    expect(coupleAverage(review('a', 4), review('b', 5))).toBe(4.5)
    expect(coupleAverage(review('a', 4), review('b', 4))).toBe(4)
  })
})

describe('formatScore', () => {
  test('usa vírgula e omite ,0', () => {
    expect(formatScore(4.5)).toBe('4,5')
    expect(formatScore(4)).toBe('4')
  })

  test('arredonda para uma casa', () => {
    expect(formatScore(4.25)).toBe('4,3')
  })
})
