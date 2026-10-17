import type { Place } from '../../lib/types'
import { filterPlaces } from './filterPlaces'

const place = (nome: string, tipo: Place['tipo']): Place => ({
  id: nome,
  nome,
  tipo,
  endereco: null,
  lat: null,
  lng: null,
  visitadoEm: '2026-10-16',
  criadoPor: 'u1',
})

const places = [place('Padaria São Jorge', 'cafe'), place('Cantina Roma', 'restaurante'), place('Café Lumi', 'cafe')]

test('filtra por tipo', () => {
  expect(filterPlaces(places, 'cafe', '').map((p) => p.nome)).toEqual(['Padaria São Jorge', 'Café Lumi'])
  expect(filterPlaces(places, 'todos', '')).toHaveLength(3)
})

test('busca ignora acento e maiúsculas', () => {
  expect(filterPlaces(places, 'todos', 'padaria sao').map((p) => p.nome)).toEqual(['Padaria São Jorge'])
  expect(filterPlaces(places, 'todos', 'CAFE').map((p) => p.nome)).toEqual(['Café Lumi'])
})
