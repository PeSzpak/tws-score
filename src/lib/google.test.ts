import { kindFromTypes, parseDetails, parseSuggestions } from './google'

test('parseSuggestions separa nome e endereço de cada sugestão', () => {
  expect(
    parseSuggestions({
      suggestions: [
        {
          placePrediction: {
            placeId: 'g1',
            structuredFormat: { mainText: { text: 'Café Lumi' }, secondaryText: { text: 'Rua Augusta, São Paulo' } },
          },
        },
        { queryPrediction: { text: { text: 'café perto' } } },
      ],
    }),
  ).toEqual([{ placeId: 'g1', nome: 'Café Lumi', detalhe: 'Rua Augusta, São Paulo' }])
})

test('parseSuggestions aceita resposta sem sugestões', () => {
  expect(parseSuggestions({})).toEqual([])
})

test('kindFromTypes reconhece café e restaurante pelos tipos do Google', () => {
  expect(kindFromTypes('coffee_shop', ['coffee_shop', 'food'])).toBe('cafe')
  expect(kindFromTypes('bakery', ['bakery'])).toBe('cafe')
  expect(kindFromTypes('brazilian_restaurant', ['restaurant'])).toBe('restaurante')
  expect(kindFromTypes(null, ['bar', 'food'])).toBe('restaurante')
  expect(kindFromTypes('park', ['park'])).toBeNull()
})

test('parseDetails monta o lugar com as informações do Google', () => {
  expect(
    parseDetails({
      id: 'g1',
      displayName: { text: 'Café Lumi' },
      formattedAddress: 'Rua Augusta, 100 - São Paulo',
      location: { latitude: -23.55, longitude: -46.65 },
      primaryType: 'cafe',
      types: ['cafe', 'food'],
      googleMapsUri: 'https://maps.google.com/?cid=1',
      websiteUri: 'https://cafelumi.com.br',
      nationalPhoneNumber: '(11) 3333-4444',
      regularOpeningHours: { weekdayDescriptions: ['segunda-feira: 08:00–18:00'] },
      priceLevel: 'PRICE_LEVEL_MODERATE',
      rating: 4.6,
      userRatingCount: 1234,
    }),
  ).toEqual({
    nome: 'Café Lumi',
    tipo: 'cafe',
    endereco: 'Rua Augusta, 100 - São Paulo',
    lat: -23.55,
    lng: -46.65,
    google: {
      placeId: 'g1',
      mapsUrl: 'https://maps.google.com/?cid=1',
      site: 'https://cafelumi.com.br',
      telefone: '(11) 3333-4444',
      horarios: ['segunda-feira: 08:00–18:00'],
      nivelPreco: 2,
      nota: 4.6,
      totalAvaliacoes: 1234,
    },
  })
})

test('parseDetails deixa vazio o que o lugar não tem no Google', () => {
  const place = parseDetails({ id: 'g2', displayName: { text: 'Bistrô' }, types: ['restaurant'] })
  expect(place).toEqual({
    nome: 'Bistrô',
    tipo: 'restaurante',
    endereco: null,
    lat: null,
    lng: null,
    google: {
      placeId: 'g2',
      mapsUrl: null,
      site: null,
      telefone: null,
      horarios: [],
      nivelPreco: null,
      nota: null,
      totalAvaliacoes: null,
    },
  })
})
