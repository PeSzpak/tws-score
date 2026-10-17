import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Member, Review, Score } from '../../lib/types'
import { RevealCards } from './RevealCards'

const me: Member = { email: 'p@x.com', nome: 'Pedro', avatarEmoji: '☕', userId: 'a' }
const partner: Member = { email: 'a@x.com', nome: 'Ana', avatarEmoji: '🍰', userId: 'b' }

function review(autorId: string, notaGeral: Score, comentario: string): Review {
  return {
    id: `r-${autorId}`,
    placeId: 'p1',
    autorId,
    scores: { notaGeral, comida: 4, ambiente: 4, atendimento: 4, preco: 4 },
    comentario,
    criadoEm: '2026-10-16T12:00:00Z',
  }
}

const mine = review('a', 4, 'Gostei do café')
const theirs = review('b', 5, 'Melhor croissant da vida')

test('esperando o parceiro não mostra nada da avaliação dele', () => {
  render(<RevealCards state={{ kind: 'waiting_partner', mine }} me={me} partner={partner} onReview={vi.fn()} />)
  expect(screen.getByText('Ana ainda não avaliou')).toBeInTheDocument()
  expect(screen.getByText('Gostei do café')).toBeInTheDocument()
  expect(screen.queryByText('Melhor croissant da vida')).not.toBeInTheDocument()
  expect(screen.queryByText(/Nota do casal/)).not.toBeInTheDocument()
})

test('revelado mostra a nota do casal e o comentário do parceiro', () => {
  render(
    <RevealCards state={{ kind: 'revealed', mine, theirs, average: 4.5 }} me={me} partner={partner} onReview={vi.fn()} />,
  )
  expect(screen.getByText('Nota do casal')).toBeInTheDocument()
  expect(screen.getByText('4,5')).toBeInTheDocument()
  expect(screen.getByText('Melhor croissant da vida')).toBeInTheDocument()
})

test('quando falta a minha, oferece avaliar', async () => {
  const onReview = vi.fn()
  render(<RevealCards state={{ kind: 'waiting_me' }} me={me} partner={partner} onReview={onReview} />)
  expect(screen.getByText('Ana já avaliou. Sua vez!')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Avaliar' }))
  expect(onReview).toHaveBeenCalled()
})
