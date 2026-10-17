import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from './LoginPage'

const auth = vi.hoisted(() => ({
  signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
  verifyOtp: vi.fn().mockResolvedValue({ error: null }),
}))
vi.mock('../lib/supabase', () => ({ supabase: { auth } }))

beforeEach(() => {
  auth.signInWithOtp.mockClear()
  auth.verifyOtp.mockClear()
})

test('login nunca cria usuário novo no Auth compartilhado', async () => {
  render(<LoginPage />)
  await userEvent.type(screen.getByLabelText('Seu e-mail'), 'pedro@x.com')
  await userEvent.click(screen.getByRole('button', { name: 'Receber link' }))
  expect(auth.signInWithOtp).toHaveBeenCalledWith({
    email: 'pedro@x.com',
    options: expect.objectContaining({ shouldCreateUser: false }),
  })
})

test('dá pra entrar com o código do e-mail, para o app instalado', async () => {
  render(<LoginPage />)
  await userEvent.type(screen.getByLabelText('Seu e-mail'), 'pedro@x.com')
  await userEvent.click(screen.getByRole('button', { name: 'Receber link' }))
  await userEvent.type(await screen.findByLabelText('Código do e-mail'), '123456')
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
  expect(auth.verifyOtp).toHaveBeenCalledWith({ email: 'pedro@x.com', token: '123456', type: 'email' })
})

test('código errado avisa com gentileza', async () => {
  auth.verifyOtp.mockResolvedValueOnce({ error: new Error('invalid') })
  render(<LoginPage />)
  await userEvent.type(screen.getByLabelText('Seu e-mail'), 'pedro@x.com')
  await userEvent.click(screen.getByRole('button', { name: 'Receber link' }))
  await userEvent.type(await screen.findByLabelText('Código do e-mail'), '000000')
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
  expect(await screen.findByText(/Código não confere/)).toBeInTheDocument()
})
