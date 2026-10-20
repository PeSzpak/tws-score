import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import type { GoogleInfo, WishItem } from '../lib/types'
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

const google = vi.hoisted(() => ({ searchPlaces: vi.fn(), placeDetails: vi.fn() }))
vi.mock('../lib/google', () => ({ googleEnabled: true, ...google }))

const info: GoogleInfo = {
  placeId: 'g1',
  mapsUrl: null,
  site: null,
  telefone: null,
  horarios: [],
  nivelPreco: null,
  nota: 4.7,
  totalAvaliacoes: 50,
}

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
  wishes.list = [
    {
      id: 'w1',
      nome: 'Cantina Roma',
      tipo: 'restaurante',
      observacao: 'massa fresca',
      endereco: null,
      lat: null,
      lng: null,
      google: null,
    },
  ]
  wishes.addWish.mockReset().mockImplementation(async (input) => ({ id: 'w2', ...input }))
  wishes.removeWish.mockReset().mockResolvedValue(undefined)
  google.searchPlaces.mockReset().mockResolvedValue([])
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
  expect(wishes.addWish).toHaveBeenCalledWith({
    nome: 'Café Lumi',
    tipo: 'cafe',
    observacao: null,
    endereco: null,
    lat: null,
    lng: null,
    google: null,
  })
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

test('adicionar pela busca do Google guarda endereço e localização', async () => {
  google.searchPlaces.mockResolvedValue([{ placeId: 'g1', nome: 'Café Lumi', detalhe: 'Rua Augusta' }])
  google.placeDetails.mockResolvedValue({
    nome: 'Café Lumi',
    tipo: 'cafe',
    endereco: 'Rua Augusta, 100',
    lat: -23.55,
    lng: -46.65,
    google: info,
  })
  renderPage()
  await userEvent.click(screen.getByRole('button', { name: 'Restaurante' }))
  await userEvent.type(screen.getByLabelText('Nome do lugar'), 'café lu')
  await userEvent.click(await screen.findByRole('button', { name: /Café Lumi/ }))
  expect(await screen.findByText('Rua Augusta, 100')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
  expect(wishes.addWish).toHaveBeenCalledWith({
    nome: 'Café Lumi',
    tipo: 'cafe',
    observacao: null,
    endereco: 'Rua Augusta, 100',
    lat: -23.55,
    lng: -46.65,
    google: info,
  })
})

test('adicionar só com o nome digitado continua funcionando', async () => {
  google.searchPlaces.mockResolvedValue([])
  renderPage()
  await userEvent.type(screen.getByLabelText('Nome do lugar'), 'Padaria')
  await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
  expect(wishes.addWish).toHaveBeenCalledWith(
    expect.objectContaining({ nome: 'Padaria', endereco: null, lat: null, lng: null, google: null }),
  )
})

test('item da lista mostra endereço e abre cardápio e horários antes da visita', async () => {
  wishes.list = [
    {
      id: 'w3',
      nome: 'Taisho Sushi',
      tipo: 'restaurante',
      observacao: null,
      endereco: 'Av. Iguaçu, 1848 - Água Verde, Curitiba',
      lat: -25.44,
      lng: -49.27,
      google: { ...info, site: 'https://taisho.com.br', horarios: ['terça-feira: 18:00–23:00'] },
    },
  ]
  renderPage()
  expect(await screen.findByText('Av. Iguaçu, 1848 - Água Verde, Curitiba')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /Cardápio e site/ })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Taisho Sushi' }))
  expect(screen.getByRole('link', { name: /Cardápio e site/ })).toHaveAttribute('href', 'https://taisho.com.br')
  expect(screen.getByText('terça-feira: 18:00–23:00')).toBeInTheDocument()
})
