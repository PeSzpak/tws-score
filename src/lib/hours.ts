export type HoursGroup = { dias: string; horas: string[]; hoje: boolean }

const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

function label(from: number, to: number): string {
  if (from === to) return DIAS[from]
  return `${DIAS[from]} ${to === from + 1 ? 'e' : 'a'} ${DIAS[to]}`
}

export function groupHours(horarios: string[], hoje: number): HoursGroup[] | null {
  if (horarios.length !== 7) return null
  const days = horarios.map((linha) => linha.slice(linha.indexOf(': ') + 2))
  if (horarios.some((linha) => !linha.includes(': '))) return null

  const groups: HoursGroup[] = []
  let from = 0
  for (let i = 1; i <= 7; i++) {
    if (i < 7 && days[i] === days[from]) continue
    groups.push({ dias: label(from, i - 1), horas: days[from].split(', '), hoje: hoje >= from && hoje < i })
    from = i
  }
  return groups
}
