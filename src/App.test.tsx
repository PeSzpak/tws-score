import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./auth/useSession', () => ({ useSession: () => ({ status: 'signed_out' }) }))

test('sem sessão abre no login', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'TWS Score' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Receber link' })).toBeInTheDocument()
})
