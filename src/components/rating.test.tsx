import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Review } from '../lib/types'
import { Dots } from './Dots'
import { Hearts } from './Hearts'
import { StatusBadge } from './StatusBadge'

test('tocar no 4º coração escolhe 4', async () => {
  const onChange = vi.fn()
  render(<Hearts value={null} onChange={onChange} />)
  await userEvent.click(screen.getByRole('radio', { name: '4 corações' }))
  expect(onChange).toHaveBeenCalledWith(4)
})

test('seta para a direita aumenta a nota', () => {
  const onChange = vi.fn()
  render(<Hearts value={2} onChange={onChange} />)
  fireEvent.keyDown(screen.getByRole('radio', { name: '2 corações' }), { key: 'ArrowRight' })
  expect(onChange).toHaveBeenCalledWith(3)
})

test('sem onChange é só leitura', () => {
  render(<Hearts value={3} />)
  expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  expect(screen.getByLabelText('3 de 5 corações')).toBeInTheDocument()
})

test('pontinhos têm rótulo visível e escolhem nota', async () => {
  const onChange = vi.fn()
  render(<Dots label="Ambiente" value={null} onChange={onChange} />)
  expect(screen.getByRole('radiogroup', { name: 'Ambiente' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('radio', { name: 'Ambiente 5' }))
  expect(onChange).toHaveBeenCalledWith(5)
})

test('selo mostra quem falta avaliar', () => {
  const mine = { id: 'r', placeId: 'p', autorId: 'a' } as Review
  const { rerender } = render(<StatusBadge state={{ kind: 'waiting_partner', mine }} partnerName="Ana" />)
  expect(screen.getByText('esperando Ana')).toBeInTheDocument()
  rerender(<StatusBadge state={{ kind: 'waiting_me' }} partnerName="Ana" />)
  expect(screen.getByText('esperando você')).toBeInTheDocument()
  rerender(<StatusBadge state={{ kind: 'none' }} partnerName="Ana" />)
  expect(screen.queryByText(/esperando/)).not.toBeInTheDocument()
})
