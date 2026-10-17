import { emptyDraft, type VisitDraft } from '../../lib/draft'
import { submitVisit, type SubmitDeps } from './submitVisit'

function draft(overrides: Partial<VisitDraft> = {}): VisitDraft {
  const base = emptyDraft('2026-10-16')
  return {
    ...base,
    place: { ...base.place, nome: 'Café Lumi', tipo: 'cafe', lat: -23.5, lng: -46.6 },
    scores: { notaGeral: 5, comida: 5, ambiente: 4, atendimento: 5, preco: 3 },
    comentario: 'Pão de queijo perfeito',
    ...overrides,
  }
}

function deps(overrides: Partial<SubmitDeps> = {}): SubmitDeps {
  return {
    newId: () => 'p1',
    createPlace: vi.fn().mockResolvedValue(undefined),
    submitReview: vi.fn().mockResolvedValue('created'),
    uploadPhoto: vi.fn().mockResolvedValue(undefined),
    compressImage: vi.fn(async (f: File) => f),
    removeWish: vi.fn().mockResolvedValue(undefined),
    saveDraft: vi.fn(),
    ...overrides,
  }
}

const photo = (name: string) => new File(['x'], name, { type: 'image/jpeg' })

test('caminho feliz cria lugar, avaliação e fotos', async () => {
  const d = deps()
  const result = await submitVisit(draft(), [photo('a.jpg'), photo('b.jpg')], d)
  expect(result).toEqual({ placeId: 'p1', photoErrors: 0 })
  expect(d.submitReview).toHaveBeenCalledWith('p1', draft().scores, 'Pão de queijo perfeito')
  expect(d.uploadPhoto).toHaveBeenCalledTimes(2)
})

test('reenviar depois de falha na avaliação não cria outro lugar', async () => {
  const d = deps({ submitReview: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue('created') })
  await expect(submitVisit(draft(), [], d)).rejects.toThrow('offline')

  const saved = vi.mocked(d.saveDraft).mock.lastCall![0]
  expect(saved.placeId).toBe('p1')

  await submitVisit(saved, [], d)
  expect(vi.mocked(d.createPlace).mock.calls.map(([p]) => p.id)).toEqual(['p1', 'p1'])
})

test('avaliação já enviada conta como sucesso', async () => {
  const d = deps({ submitReview: vi.fn().mockResolvedValue('already_sent') })
  await expect(submitVisit(draft({ placeId: 'p1' }), [], d)).resolves.toEqual({ placeId: 'p1', photoErrors: 0 })
})

test('foto que falha não impede o envio', async () => {
  const d = deps({
    compressImage: vi
      .fn()
      .mockRejectedValueOnce(new Error('heic'))
      .mockImplementation(async (f: File) => f),
  })
  const result = await submitVisit(draft(), [photo('a.heic'), photo('b.jpg')], d)
  expect(result.photoErrors).toBe(1)
  expect(d.uploadPhoto).toHaveBeenCalledTimes(1)
})

test('lugar sem localização é salvo com coordenadas nulas', async () => {
  const d = deps()
  const base = draft()
  await submitVisit({ ...base, place: { ...base.place, lat: null, lng: null } }, [], d)
  expect(d.createPlace).toHaveBeenCalledWith(expect.objectContaining({ lat: null, lng: null }))
})

test('item da lista queremos ir sai depois do envio', async () => {
  const d = deps()
  await submitVisit(draft({ wishId: 'w1' }), [], d)
  expect(d.removeWish).toHaveBeenCalledWith('w1')
})

test('resposta perdida ao criar o lugar: tentar de novo reusa o mesmo id', async () => {
  let n = 0
  const d = deps({
    newId: () => `id-${++n}`,
    createPlace: vi.fn().mockRejectedValueOnce(new Error('timeout')).mockResolvedValue(undefined),
  })
  await expect(submitVisit(draft(), [], d)).rejects.toThrow('timeout')
  const saved = vi.mocked(d.saveDraft).mock.lastCall![0]
  expect(saved.placeId).toBe('id-1')

  await submitVisit(saved, [], d)
  expect(vi.mocked(d.createPlace).mock.calls.map(([p]) => p.id)).toEqual(['id-1', 'id-1'])
})

test('rascunho incompleto é recusado sem tocar no banco', async () => {
  const d = deps()
  await expect(submitVisit(draft({ scores: { notaGeral: 5 } }), [], d)).rejects.toThrow()
  expect(d.createPlace).not.toHaveBeenCalled()
})
