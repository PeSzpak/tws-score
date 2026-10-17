import type { Place } from '../../lib/types'

const RECENT_DAYS = 2

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000)
}

export function pendingForMe(places: Place[], authors: Map<string, string[]>, myId: string, today: string): Place[] {
  return places.filter(
    (p) =>
      p.criadoPor !== myId &&
      !(authors.get(p.id) ?? []).includes(myId) &&
      daysBetween(p.visitadoEm, today) <= RECENT_DAYS,
  )
}
