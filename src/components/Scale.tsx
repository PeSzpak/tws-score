import type { KeyboardEvent, ReactNode } from 'react'
import type { Score } from '../lib/types'

const SCORES: Score[] = [1, 2, 3, 4, 5]

type Props = {
  label: string
  value: Score | null
  onChange: (s: Score) => void
  optionLabel: (s: Score) => string
  renderOption: (s: Score, filled: boolean) => ReactNode
  className?: string
  optionClassName?: string
}

function clamp(n: number): Score {
  return Math.min(5, Math.max(1, n)) as Score
}

export function Scale({ label, value, onChange, optionLabel, renderOption, className, optionClassName }: Props) {
  function onKeyDown(event: KeyboardEvent, s: Score) {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = clamp(s + step)
    onChange(next)
    const group = event.currentTarget.parentElement
    group?.querySelectorAll<HTMLElement>('[role="radio"]')[next - 1]?.focus()
  }

  return (
    <div role="radiogroup" aria-label={label} className={className}>
      {SCORES.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={optionLabel(s)}
          tabIndex={s === (value ?? 1) ? 0 : -1}
          className={optionClassName}
          onClick={() => onChange(s)}
          onKeyDown={(e) => onKeyDown(e, s)}
        >
          {renderOption(s, value !== null && s <= value)}
        </button>
      ))}
    </div>
  )
}
