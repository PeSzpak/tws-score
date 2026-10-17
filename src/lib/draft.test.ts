import { clearDraft, emptyDraft, loadDraft, saveDraft } from './draft'

beforeEach(() => localStorage.clear())

test('salva e recupera o rascunho', () => {
  const draft = { ...emptyDraft('2026-10-16'), comentario: 'bolo de laranja' }
  saveDraft('tws:draft:new', draft)
  expect(loadDraft('tws:draft:new')).toEqual(draft)
})

test('rascunho corrompido vira null', () => {
  localStorage.setItem('tws:draft:new', '{')
  expect(loadDraft('tws:draft:new')).toBeNull()
})

test('falha ao gravar não quebra o app', () => {
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('QuotaExceeded')
  })
  expect(() => saveDraft('tws:draft:new', emptyDraft('2026-10-16'))).not.toThrow()
  spy.mockRestore()
})

test('clearDraft remove', () => {
  saveDraft('k', emptyDraft('2026-10-16'))
  clearDraft('k')
  expect(loadDraft('k')).toBeNull()
})
