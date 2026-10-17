import { parsePlace, parseReview } from './rows'

const reviewRow = {
  id: 'r1',
  place_id: 'p1',
  autor_id: 'u1',
  nota_geral: 5,
  comida: 4,
  ambiente: 3,
  atendimento: 2,
  preco: 1,
  comentario: 'Bolo incrível',
  criado_em: '2026-10-16T12:00:00Z',
}

test('parseReview converte as colunas para o tipo de domínio', () => {
  expect(parseReview(reviewRow)).toEqual({
    id: 'r1',
    placeId: 'p1',
    autorId: 'u1',
    scores: { notaGeral: 5, comida: 4, ambiente: 3, atendimento: 2, preco: 1 },
    comentario: 'Bolo incrível',
    criadoEm: '2026-10-16T12:00:00Z',
  })
})

test('parseReview rejeita nota fora de 1 a 5', () => {
  expect(() => parseReview({ ...reviewRow, nota_geral: 7 })).toThrow()
})

test('parsePlace aceita lugar sem localização', () => {
  const place = parsePlace({
    id: 'p1',
    nome: 'Café Lumi',
    tipo: 'cafe',
    endereco: null,
    lat: null,
    lng: null,
    visitado_em: '2026-10-16',
    criado_por: 'u1',
  })
  expect(place.lat).toBeNull()
  expect(place.tipo).toBe('cafe')
})

test('parsePlace rejeita tipo desconhecido', () => {
  expect(() =>
    parsePlace({ id: 'p1', nome: 'X', tipo: 'bar', endereco: null, lat: null, lng: null, visitado_em: '2026-10-16', criado_por: 'u1' }),
  ).toThrow()
})
