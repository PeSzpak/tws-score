import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { emptyDraft, NEW_VISIT_DRAFT, saveDraft } from '../lib/draft'
import { NewVisitPage } from './NewVisitPage'

vi.mock('../data/places', () => ({ createPlace: vi.fn(), listPlaces: () => Promise.resolve([]) }))
vi.mock('../data/reviews', () => ({ submitReview: vi.fn(), listReviewAuthors: () => Promise.resolve(new Map()) }))
vi.mock('../data/photos', () => ({ uploadPhoto: vi.fn() }))
vi.mock('../data/wishlist', () => ({ getWish: vi.fn(), removeWish: vi.fn() }))
vi.mock('../auth/members-context', () => ({ useMembers: () => ({ userId: 'u1', me: {}, partner: { nome: 'Belle' } }) }))

beforeEach(() => localStorage.clear())

function pendingDraft() {
  const base = emptyDraft('2026-10-10')
  saveDraft(NEW_VISIT_DRAFT, {
    ...base,
    placeId: 'p-old',
    place: { ...base.place, nome: 'Café Antigo', tipo: 'cafe' },
    scores: { notaGeral: 4 },
  })
}

test('rascunho pendente mostra de qual lugar é', () => {
  pendingDraft()
  render(<NewVisitPage />, { wrapper: MemoryRouter })
  expect(screen.getByText(/Café Antigo/)).toBeInTheDocument()
})

test('dá pra descartar o rascunho e começar outra visita', async () => {
  pendingDraft()
  render(<NewVisitPage />, { wrapper: MemoryRouter })
  await userEvent.click(screen.getByRole('button', { name: 'Descartar rascunho' }))
  expect(screen.getByRole('heading', { name: 'Nova visita' })).toBeInTheDocument()
  expect(screen.getByLabelText('Nome do lugar')).toHaveValue('')
})
