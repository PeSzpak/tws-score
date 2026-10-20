import { useEffect, useRef, useState } from 'react'
import { googleEnabled, placeDetails, searchPlaces, type GooglePlace, type Suggestion } from '../lib/google'
import styles from './PlaceNameField.module.css'

type Props = {
  value: string
  onChange: (nome: string) => void
  onPick: (place: GooglePlace) => void
}

const SEARCH_DEBOUNCE_MS = 400

export function PlaceNameField({ value, onChange, onPick }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const sessionToken = useRef(crypto.randomUUID())

  useEffect(() => {
    if (!googleEnabled || query.trim().length < 3) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchPlaces(query, sessionToken.current, controller.signal)
        .then(setSuggestions)
        .catch(() => undefined)
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  async function pick(s: Suggestion) {
    setQuery('')
    setSuggestions([])
    const token = sessionToken.current
    sessionToken.current = crypto.randomUUID()
    try {
      const found = await placeDetails(s.placeId, token)
      onPick({ ...found, nome: found.nome || s.nome })
    } catch {
      onChange(s.nome)
    }
  }

  return (
    <div className={styles.field}>
      <label className="field">
        Nome do lugar
        <input
          className="input"
          value={value}
          autoComplete="off"
          placeholder={googleEnabled ? 'Digite para buscar no Google' : undefined}
          onChange={(e) => {
            onChange(e.target.value)
            setQuery(e.target.value)
            if (e.target.value.trim().length < 3) setSuggestions([])
          }}
        />
      </label>
      {suggestions.length > 0 && (
        <ul className={styles.results} aria-label="Sugestões do Google">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button type="button" onClick={() => pick(s)}>
                <strong>{s.nome}</strong>
                {s.detalhe && <span className={styles.detail}>{s.detalhe}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
