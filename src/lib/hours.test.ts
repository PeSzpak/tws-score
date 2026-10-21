import { groupHours, weekdayIndex } from './hours'

const week = (seg: string, sab: string, dom = sab) => [
  `segunda-feira: ${seg}`,
  `terça-feira: ${seg}`,
  `quarta-feira: ${seg}`,
  `quinta-feira: ${seg}`,
  `sexta-feira: ${seg}`,
  `sábado: ${sab}`,
  `domingo: ${dom}`,
]

test('junta os dias seguidos com o mesmo horário e separa os turnos', () => {
  const groups = groupHours(week('11:30–14:30, 18:00–22:00', '11:30–15:00, 18:00–22:00'), 2)
  expect(groups).toEqual([
    { dias: 'seg a sex', horas: ['11:30–14:30', '18:00–22:00'], hoje: true },
    { dias: 'sáb e dom', horas: ['11:30–15:00', '18:00–22:00'], hoje: false },
  ])
})

test('um dia diferente no meio quebra a sequência', () => {
  const horarios = week('08:00–18:00', '09:00–13:00', 'Fechado')
  horarios[2] = 'quarta-feira: Fechado'
  expect(groupHours(horarios, 6)?.map((g) => [g.dias, g.horas.join(), g.hoje])).toEqual([
    ['seg e ter', '08:00–18:00', false],
    ['qua', 'Fechado', false],
    ['qui e sex', '08:00–18:00', false],
    ['sáb', '09:00–13:00', false],
    ['dom', 'Fechado', true],
  ])
})

test('formato inesperado do Google não é agrupado', () => {
  expect(groupHours(['segunda-feira: 08:00–18:00', 'domingo: Fechado'], 0)).toBeNull()
})

test('a semana do Google começa na segunda', () => {
  expect(weekdayIndex(new Date(2026, 9, 19))).toBe(0)
  expect(weekdayIndex(new Date(2026, 9, 25))).toBe(6)
})
