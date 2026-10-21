import { render, screen } from '@testing-library/react'
import type { GoogleInfo } from '../../lib/types'
import { GoogleInfoCard } from './GoogleInfoCard'

const full: GoogleInfo = {
  placeId: 'g1',
  mapsUrl: 'https://maps.google.com/?cid=1',
  site: 'https://cafelumi.com.br/cardapio',
  telefone: '(11) 3333-4444',
  horarios: ['segunda-feira: 08:00–18:00', 'domingo: Fechado'],
  nivelPreco: 2,
  nota: 4.6,
  totalAvaliacoes: 1234,
}

test('mostra nota, preço, horários e atalhos do Google', () => {
  render(<GoogleInfoCard nome="Café Lumi" info={full} />)
  expect(screen.getByText(/4,6/)).toBeInTheDocument()
  expect(screen.getByText(/1\.234 avaliações/)).toBeInTheDocument()
  expect(screen.getByText('$$')).toBeInTheDocument()
  expect(screen.getByText('domingo: Fechado')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Cardápio e site/ })).toHaveAttribute('href', full.site)
  expect(screen.getByRole('link', { name: /Ligar/ })).toHaveAttribute('href', 'tel:1133334444')
  expect(screen.getByRole('link', { name: /Google Maps/ })).toHaveAttribute('href', full.mapsUrl)
})

test('sem site, o cardápio fica no Google Maps e some o que o lugar não tem', () => {
  render(
    <GoogleInfoCard
      nome="Café Lumi"
      info={{ ...full, site: null, telefone: null, horarios: [], nivelPreco: null, nota: null, mapsUrl: null }}
    />,
  )
  expect(screen.queryByRole('link', { name: /Cardápio e site/ })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /Ligar/ })).not.toBeInTheDocument()
  expect(screen.queryByText('Horários')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Google Maps/ })).toHaveAttribute(
    'href',
    'https://www.google.com/maps/search/?api=1&query=Caf%C3%A9+Lumi&query_place_id=g1',
  )
})

test('horários mostram o de hoje e agrupam os dias iguais', () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 21, 12))
  const dias = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo']
  const horarios = dias.map((d, i) => `${d}: ${i < 5 ? '11:30–14:30, 18:00–22:00' : '11:30–15:00'}`)
  render(<GoogleInfoCard nome="Café Lumi" info={{ ...full, horarios }} />)
  vi.useRealTimers()

  expect(screen.getByText('Hoje: 11:30–14:30, 18:00–22:00')).toBeInTheDocument()
  expect(screen.getByText('seg a sex')).toBeInTheDocument()
  expect(screen.getByText('sáb e dom')).toBeInTheDocument()
  expect(screen.queryByText(/segunda-feira/)).not.toBeInTheDocument()
})
