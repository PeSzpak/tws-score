import { parsePlace, parseReview, parseWish } from './rows'

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
    parsePlace({
      id: 'p1',
      nome: 'X',
      tipo: 'bar',
      endereco: null,
      lat: null,
      lng: null,
      visitado_em: '2026-10-16',
      criado_por: 'u1',
    }),
  ).toThrow()
})

test('parsePlace lê as informações do Google salvas com o lugar', () => {
  const google = {
    placeId: 'g1',
    mapsUrl: 'https://maps.google.com/?cid=1',
    site: null,
    telefone: '(11) 3333-4444',
    horarios: ['segunda-feira: Fechado'],
    nivelPreco: 2,
    nota: 4.6,
    totalAvaliacoes: 12,
  }
  const place = parsePlace({
    id: 'p1',
    nome: 'Café Lumi',
    tipo: 'cafe',
    endereco: null,
    lat: null,
    lng: null,
    visitado_em: '2026-10-16',
    criado_por: 'u1',
    google,
  })
  expect(place.google).toEqual(google)
})

test('parsePlace aceita lugar sem Google', () => {
  const place = parsePlace({
    id: 'p1',
    nome: 'Café Lumi',
    tipo: 'cafe',
    endereco: null,
    lat: null,
    lng: null,
    visitado_em: '2026-10-16',
    criado_por: 'u1',
    google: null,
  })
  expect(place.google).toBeNull()
})

test('parseWish lê endereço, localização e Google do item da lista', () => {
  const wish = parseWish({
    id: 'w1',
    nome: 'Café Lumi',
    tipo: 'cafe',
    observacao: null,
    endereco: 'Rua Augusta, 100',
    lat: -23.55,
    lng: -46.65,
    google: null,
  })
  expect(wish).toEqual({
    id: 'w1',
    nome: 'Café Lumi',
    tipo: 'cafe',
    observacao: null,
    endereco: 'Rua Augusta, 100',
    lat: -23.55,
    lng: -46.65,
    google: null,
  })
})
