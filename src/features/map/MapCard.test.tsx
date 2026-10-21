import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { Place, Review } from '../../lib/types'
import { MapCard } from './MapCard'

const place: Place = {
  id: 'p1',
  nome: 'Café Lumi',
  tipo: 'cafe',
  endereco: 'Rua Augusta, 100',
  lat: -23.55,
  lng: -46.65,
  visitadoEm: '2026-10-16',
  criadoPor: 'u1',
  google: null,
}

const review = (autorId: string, nota: 1 | 2 | 3 | 4 | 5): Review => ({
  id: autorId,
  placeId: 'p1',
  autorId,
  scores: { notaGeral: nota, comida: nota, ambiente: nota, atendimento: nota, preco: nota },
  comentario: null,
  criadoEm: '2026-10-16T12:00:00Z',
})

test('card do mapa mostra foto, nota do casal, tipo e data', () => {
  render(
    <MapCard
      place={place}
      cover="https://x/foto.jpg"
      partnerName="Belle"
      state={{ kind: 'revealed', mine: review('u1', 5), theirs: review('u2', 4), average: 4.5 }}
    />,
    { wrapper: MemoryRouter },
  )
  expect(screen.getByRole('img')).toHaveAttribute('src', 'https://x/foto.jpg')
  expect(screen.getByText('Café Lumi')).toBeInTheDocument()
  expect(screen.getByLabelText('Nota do casal 4,5')).toBeInTheDocument()
  expect(screen.getByText(/16 de out/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Ver lugar/ })).toHaveAttribute('href', '/lugar/p1')
})

test('card do mapa sem foto e esperando a parceira mostra o status', () => {
  render(
    <MapCard
      place={place}
      cover={null}
      partnerName="Belle"
      state={{ kind: 'waiting_partner', mine: review('u1', 5) }}
    />,
    { wrapper: MemoryRouter },
  )
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  expect(screen.getByText('esperando Belle')).toBeInTheDocument()
})
