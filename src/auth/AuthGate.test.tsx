import { render, screen } from '@testing-library/react'
import type { Member } from '../lib/types'
import { AuthGate } from './AuthGate'

const session = vi.hoisted(() => ({ current: { status: 'signed_out' } as unknown }))
const members = vi.hoisted(() => ({ list: [] as Member[] }))

vi.mock('./useSession', () => ({ useSession: () => session.current }))
vi.mock('../data/members', () => ({
  claimMembership: () => Promise.resolve(),
  listMembers: () => Promise.resolve(members.list),
}))

const pedro: Member = { email: 'pedro@x.com', nome: 'Pedro', avatarEmoji: '☕', userId: 'u1' }
const belle: Member = { email: 'belle@x.com', nome: 'Belle', avatarEmoji: '🍰', userId: 'u2' }

test('sem sessão mostra o login', () => {
  session.current = { status: 'signed_out' }
  render(<AuthGate>conteúdo</AuthGate>)
  expect(screen.getByLabelText('Seu e-mail')).toBeInTheDocument()
  expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
})

test('logado sem ser membro vê acesso restrito', async () => {
  session.current = { status: 'signed_in', userId: 'intruso', email: 'intruso@x.com' }
  members.list = []
  render(<AuthGate>conteúdo</AuthGate>)
  expect(await screen.findByText(/Esse cantinho é só nosso/)).toBeInTheDocument()
  expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
})

test('membro vê o app', async () => {
  session.current = { status: 'signed_in', userId: 'u1', email: 'pedro@x.com' }
  members.list = [pedro, belle]
  render(<AuthGate>conteúdo</AuthGate>)
  expect(await screen.findByText('conteúdo')).toBeInTheDocument()
})
