import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Scores } from '../../lib/types'
import { ReviewForm, type ReviewFormValue } from './ReviewForm'

const full: Scores = { notaGeral: 5, comida: 4, ambiente: 4, atendimento: 5, preco: 3 }

function setup(overrides: Partial<ReviewFormValue> = {}, props: { submitting?: boolean; error?: string | null } = {}) {
  const onSubmit = vi.fn()
  const onChange = vi.fn()
  render(
    <ReviewForm
      value={{ scores: {}, comentario: '', photos: [], ...overrides }}
      onChange={onChange}
      onSubmit={onSubmit}
      submitting={props.submitting ?? false}
      error={props.error ?? null}
    />,
  )
  return { onSubmit, onChange }
}

test('não envia enquanto faltar alguma nota', () => {
  setup({ scores: { notaGeral: 5, comida: 4, ambiente: 4, atendimento: 5 } })
  expect(screen.getByRole('button', { name: 'Enviar avaliação' })).toBeDisabled()
})

test('com as cinco notas, envia', async () => {
  const { onSubmit } = setup({ scores: full })
  await userEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }))
  expect(onSubmit).toHaveBeenCalled()
})

test('escolher um critério atualiza as notas', async () => {
  const { onChange } = setup({ scores: { notaGeral: 5 } })
  await userEvent.click(screen.getByRole('radio', { name: 'Preço 2' }))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ scores: { notaGeral: 5, preco: 2 } }))
})

test('erro mostra mensagem e tentar de novo', async () => {
  const { onSubmit } = setup({ scores: full }, { error: 'Sem conexão agora.' })
  expect(screen.getByText('Sem conexão agora.')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
  expect(onSubmit).toHaveBeenCalled()
})

test('enviando desabilita o botão', () => {
  setup({ scores: full }, { submitting: true })
  expect(screen.getByRole('button', { name: /Enviando/ })).toBeDisabled()
})
