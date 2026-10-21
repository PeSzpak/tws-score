import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { emptyDraft, type VisitDraft } from '../../lib/draft'
import { PlaceStep } from './PlaceStep'

const google = vi.hoisted(() => ({
  searchPlaces: vi.fn(),
  placeDetails: vi.fn(),
}))
vi.mock('../../lib/google', () => ({ googleEnabled: true, ...google }))

const info = {
  placeId: 'g1',
  mapsUrl: 'https://maps.google.com/?cid=1',
  site: null,
  telefone: null,
  horarios: [],
  nivelPreco: null,
  nota: 4.6,
  totalAvaliacoes: 80,
}

function Harness({ onPlace }: { onPlace: (p: VisitDraft['place']) => void }) {
  const [place, setPlace] = useState(emptyDraft('2026-10-19').place)
  return (
    <PlaceStep
      value={place}
      onChange={(patch) =>
        setPlace((p) => {
          const next = { ...p, ...patch }
          onPlace(next)
          return next
        })
      }
      onNext={() => {}}
    />
  )
}

test('escolher uma sugestão do Google preenche o lugar', async () => {
  google.searchPlaces.mockResolvedValue([{ placeId: 'g1', nome: 'Café Lumi', detalhe: 'Rua Augusta, São Paulo' }])
  google.placeDetails.mockResolvedValue({
    nome: 'Café Lumi',
    tipo: 'cafe',
    endereco: 'Rua Augusta, 100',
    lat: -23.55,
    lng: -46.65,
    google: info,
  })
  const onPlace = vi.fn()
  render(<Harness onPlace={onPlace} />)

  await userEvent.type(screen.getByLabelText('Nome do lugar'), 'café lu')
  await userEvent.click(await screen.findByRole('button', { name: /Café Lumi/ }))

  expect(google.placeDetails).toHaveBeenCalledWith('g1', expect.any(String))
  expect(await screen.findByText('Rua Augusta, 100')).toBeInTheDocument()
  expect(screen.getByLabelText('Nome do lugar')).toHaveValue('Café Lumi')
  expect(screen.getByRole('button', { name: 'Café' })).toHaveAttribute('aria-pressed', 'true')
  expect(onPlace).toHaveBeenLastCalledWith(expect.objectContaining({ lat: -23.55, lng: -46.65, google: info }))
})

test('dá pra seguir só com o nome digitado, sem escolher do Google', async () => {
  google.searchPlaces.mockResolvedValue([])
  const onPlace = vi.fn()
  render(<Harness onPlace={onPlace} />)
  await userEvent.type(screen.getByLabelText('Nome do lugar'), 'Padaria da esquina')
  expect(onPlace).toHaveBeenLastCalledWith(expect.objectContaining({ nome: 'Padaria da esquina', google: null }))
})

test('trocar a localização desfaz o vínculo com o Google', async () => {
  google.searchPlaces.mockResolvedValue([{ placeId: 'g1', nome: 'Café Lumi', detalhe: '' }])
  google.placeDetails.mockResolvedValue({
    nome: 'Café Lumi',
    tipo: 'cafe',
    endereco: 'Rua Augusta, 100',
    lat: -23.55,
    lng: -46.65,
    google: info,
  })
  const onPlace = vi.fn()
  render(<Harness onPlace={onPlace} />)
  await userEvent.type(screen.getByLabelText('Nome do lugar'), 'café lu')
  await userEvent.click(await screen.findByRole('button', { name: /Café Lumi/ }))
  await userEvent.click(await screen.findByRole('button', { name: 'trocar' }))
  expect(onPlace).toHaveBeenLastCalledWith(expect.objectContaining({ lat: null, google: null }))
})

test('apagar e redigitar uma busca já feita não chama o Google de novo', async () => {
  google.searchPlaces.mockClear().mockResolvedValue([{ placeId: 'g1', nome: 'Café Lumi', detalhe: '' }])
  render(<Harness onPlace={() => {}} />)
  const input = screen.getByLabelText('Nome do lugar')

  await userEvent.type(input, 'café lu')
  await screen.findByRole('button', { name: /Café Lumi/ })
  await userEvent.type(input, '{Backspace}u')
  await new Promise((r) => setTimeout(r, 500))

  expect(screen.getByRole('button', { name: /Café Lumi/ })).toBeInTheDocument()
  expect(google.searchPlaces.mock.calls.filter(([q]) => q === 'café lu')).toHaveLength(1)
})
