import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import type { WishItem } from '../lib/types'
import { WishlistPage } from './WishlistPage'

const wishes = vi.hoisted(() => ({
  list: [] as WishItem[],
  addWish: vi.fn(),
  removeWish: vi.fn(),
}))

vi.mock('../data/wishlist', () => ({
  listWishes: () => Promise.resolve(wishes.list),
  addWish: wishes.addWish,
  removeWish: wishes.removeWish,
}))

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/queremos-ir']}>
      <Routes>
        <Route path="/queremos-ir" element={<WishlistPage />} />
        <Route path="/novo" element={<p>nova visita</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  wishes.list = [{ id: 'w1', nome: 'Cantina Roma', tipo: 'restaurante', observacao: 'massa fresca' }]
  wishes.addWish.mockReset().mockImplementation(async (input) => ({ id: 'w2', ...input }))
  wishes.removeWish.mockReset().mockResolvedValue(undefined)
})

test('lista os lugares que queremos conhecer', async () => {
  renderPage()
  expect(await screen.findByText('Cantina Roma')).toBeInTheDocument()
  expect(screen.getByText('massa fresca')).toBeInTheDocument()
})

test('adiciona um café', async () => {
  renderPage()
  await userEvent.type(await screen.findByLabelText('Nome do lugar'), 'Café Lumi')
  await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
  expect(wishes.addWish).toHaveBeenCalledWith({ nome: 'Café Lumi', tipo: 'cafe', observacao: null })
  expect(await screen.findByText('Café Lumi')).toBeInTheDocument()
})

test('fomos! abre a nova visita com o item', async () => {
  renderPage()
  await userEvent.click(await screen.findByRole('button', { name: 'Fomos!' }))
  expect(await screen.findByText('nova visita')).toBeInTheDocument()
})

test('remover pede confirmação na própria lista', async () => {
  renderPage()
  await userEvent.click(await screen.findByRole('button', { name: 'Remover Cantina Roma' }))
  expect(wishes.removeWish).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Sim, remover' }))
  expect(wishes.removeWish).toHaveBeenCalledWith('w1')
})
