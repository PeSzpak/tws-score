import { useEffect, useRef, useState } from 'react'
import { Coffee, LocateFixed, MapPin, UtensilsCrossed } from 'lucide-react'
import { currentPosition, searchAddress, type AddressResult } from '../../lib/geo'
import { googleEnabled, placeDetails, searchPlaces, type Suggestion } from '../../lib/google'
import type { VisitDraft } from '../../lib/draft'
import styles from './PlaceStep.module.css'

type PlaceDraft = VisitDraft['place']

type Props = {
  value: PlaceDraft
  onChange: (patch: Partial<PlaceDraft>) => void
  onNext: () => void
}

const SEARCH_DEBOUNCE_MS = 400

export function PlaceStep({ value, onChange, onNext }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AddressResult[]>([])
  const [nameQuery, setNameQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const sessionToken = useRef(crypto.randomUUID())
  const [locating, setLocating] = useState(false)
  const [gpsFailed, setGpsFailed] = useState(false)
  const hasLocation = value.lat !== null
  const ready = value.nome.trim() !== '' && value.tipo !== null

  useEffect(() => {
    if (query.trim().length < 3) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchAddress(query, controller.signal)
        .then(setResults)
        .catch(() => undefined)
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    if (!googleEnabled || nameQuery.trim().length < 3) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchPlaces(nameQuery, sessionToken.current, controller.signal)
        .then(setSuggestions)
        .catch(() => undefined)
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [nameQuery])

  async function pickSuggestion(s: Suggestion) {
    setNameQuery('')
    setSuggestions([])
    const token = sessionToken.current
    sessionToken.current = crypto.randomUUID()
    try {
      const found = await placeDetails(s.placeId, token)
      onChange({
        nome: found.nome || s.nome,
        endereco: found.endereco,
        lat: found.lat,
        lng: found.lng,
        google: found.google,
        ...(found.tipo ? { tipo: found.tipo } : {}),
      })
    } catch {
      onChange({ nome: s.nome })
    }
  }

  async function useMyLocation() {
    setLocating(true)
    const coords = await currentPosition()
    setLocating(false)
    if (coords) onChange({ ...coords, endereco: null })
    else setGpsFailed(true)
  }

  return (
    <form
      className={styles.step}
      onSubmit={(e) => {
        e.preventDefault()
        if (ready) onNext()
      }}
    >
      <div className={styles.location}>
        <label className="field">
          Nome do lugar
          <input
            className="input"
            value={value.nome}
            autoComplete="off"
            onChange={(e) => {
              onChange({ nome: e.target.value })
              setNameQuery(e.target.value)
              if (e.target.value.trim().length < 3) setSuggestions([])
            }}
          />
        </label>
        {suggestions.length > 0 && (
          <ul className={styles.results} aria-label="Sugestões do Google">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button type="button" onClick={() => pickSuggestion(s)}>
                  <strong>{s.nome}</strong>
                  {s.detalhe && <span className={styles.detail}>{s.detalhe}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.segmented} role="group" aria-label="Tipo">
        <button
          type="button"
          className={styles.option}
          aria-pressed={value.tipo === 'cafe'}
          onClick={() => onChange({ tipo: 'cafe' })}
        >
          <Coffee size={18} strokeWidth={1.6} /> Café
        </button>
        <button
          type="button"
          className={styles.option}
          aria-pressed={value.tipo === 'restaurante'}
          onClick={() => onChange({ tipo: 'restaurante' })}
        >
          <UtensilsCrossed size={18} strokeWidth={1.6} /> Restaurante
        </button>
      </div>

      <div className={styles.location}>
        <span className="field">Onde fica</span>
        {hasLocation ? (
          <div className={styles.chosen}>
            <MapPin size={16} />
            <span>{value.endereco ?? 'Localização atual'}</span>
            <button type="button" onClick={() => onChange({ lat: null, lng: null, endereco: null, google: null })}>
              trocar
            </button>
          </div>
        ) : (
          <>
            <button type="button" className="btn" onClick={useMyLocation} disabled={locating}>
              <LocateFixed size={18} strokeWidth={1.6} />
              {locating ? 'Procurando…' : 'Usar minha localização'}
            </button>
            {gpsFailed && <p className={`${styles.note} muted`}>Não consegui sua localização. Busca pelo endereço?</p>}
            <input
              className="input"
              placeholder="Buscar endereço"
              aria-label="Buscar endereço"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (e.target.value.trim().length < 3) setResults([])
              }}
            />
            {results.length > 0 && (
              <ul className={styles.results}>
                {results.map((r) => (
                  <li key={`${r.lat},${r.lng}`}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange({ lat: r.lat, lng: r.lng, endereco: r.label })
                        setQuery('')
                        setResults([])
                      }}
                    >
                      {r.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className={`${styles.note} muted`}>Opcional. Sem localização, o lugar só não aparece no mapa.</p>
          </>
        )}
      </div>

      <label className="field">
        Quando
        <input
          className="input"
          type="date"
          value={value.visitadoEm}
          onChange={(e) => onChange({ visitadoEm: e.target.value })}
        />
      </label>

      <button type="submit" className="btn btn-primary" disabled={!ready}>
        Continuar
      </button>
    </form>
  )
}
