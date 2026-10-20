import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { emptyDraft, NEW_VISIT_DRAFT, saveDraft } from '../lib/draft'
import { NewVisitPage } from './NewVisitPage'

const places = vi.hoisted(() => ({ list: [] as import('../lib/types').Place[] }))
vi.mock('../data/places', () => ({ createPlace: vi.fn(), listPlaces: () => Promise.resolve(places.list) }))
vi.mock('../data/reviews', () => ({ submitReview: vi.fn(), listReviewAuthors: () => Promise.resolve(new Map()) }))
vi.mock('../data/photos', () => ({ uploadPhoto: vi.fn() }))
vi.mock('../data/wishlist', () => ({ getWish: vi.fn(), removeWish: vi.fn() }))
vi.mock('../auth/members-context', () => ({ useMembers: () => ({ userId: 'u1', me: {}, partner: { nome: 'Belle' } }) }))

const gps = vi.hoisted(() => ({ resolve: (() => {}) as (coords: unknown) => void }))
vi.mock('../lib/geo', () => ({
  todayIso: () => '2026-10-16',
  searchAddress: () => Promise.resolve([]),
  currentPosition: () => new Promise((resolve) => (gps.resolve = resolve)),
}))

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

test('localização que chega depois não desfaz o que foi escolhido enquanto isso', async () => {
  render(<NewVisitPage />, { wrapper: MemoryRouter })
  await userEvent.click(screen.getByRole('button', { name: 'Usar minha localização' }))
  await userEvent.click(screen.getByRole('button', { name: 'Café' }))
  await act(async () => gps.resolve({ lat: -23.5, lng: -46.6 }))
  expect(screen.getByRole('button', { name: 'Café' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('Localização atual')).toBeInTheDocument()
})

test('mostra o lugar que a parceira acabou de registrar para avaliar o mesmo', async () => {
  places.list = [
    {
      id: 'p9',
      nome: 'Café Lumi',
      tipo: 'cafe',
      endereco: null,
      lat: null,
      lng: null,
      visitadoEm: '2026-10-16',
      criadoPor: 'u2',
      google: null,
    },
  ]
  render(<NewVisitPage />, { wrapper: MemoryRouter })
  expect(await screen.findByText(/Belle já registrou/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Café Lumi/ })).toHaveAttribute('href', '/lugar/p9')
  places.list = []
})

test('nova visita pelo + não herda o nome de um item da lista que não foi avaliado', () => {
  const base = emptyDraft('2026-10-16')
  saveDraft(NEW_VISIT_DRAFT, { ...base, wishId: 'w1', place: { ...base.place, nome: 'Café da Lista', tipo: 'cafe' } })
  render(<NewVisitPage />, { wrapper: MemoryRouter })
  expect(screen.getByLabelText('Nome do lugar')).toHaveValue('')
})

test('rascunho de item da lista com avaliação em andamento continua salvo', () => {
  const base = emptyDraft('2026-10-16')
  saveDraft(NEW_VISIT_DRAFT, {
    ...base,
    wishId: 'w1',
    place: { ...base.place, nome: 'Café da Lista', tipo: 'cafe' },
    scores: { notaGeral: 5 },
  })
  render(<NewVisitPage />, { wrapper: MemoryRouter })
  expect(screen.getByLabelText('Nome do lugar')).toHaveValue('Café da Lista')
})
