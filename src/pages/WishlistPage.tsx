import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { ChevronDown, MapPin, Star, X } from 'lucide-react'
import { LoadError } from '../components/LoadError'
import { PlaceNameField } from '../components/PlaceNameField'
import { addWish, listWishes, removeWish } from '../data/wishlist'
import { KindIcon } from '../features/home/PlaceCard'
import { GoogleInfoCard } from '../features/place/GoogleInfoCard'
import type { GooglePlace } from '../lib/google'
import styles from '../features/wishlist/wishlist.module.css'
import type { PlaceKind, WishItem } from '../lib/types'
import page from './page.module.css'

export function WishlistPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<WishItem[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<PlaceKind>('cafe')
  const [observacao, setObservacao] = useState('')
  const [picked, setPicked] = useState<Omit<GooglePlace, 'nome' | 'tipo'> | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function fetchItems() {
    listWishes().then(
      (list) => {
        setItems(list)
        setFailed(false)
      },
      () => setFailed(true),
    )
  }

  useEffect(fetchItems, [])

  async function add(event: FormEvent) {
    event.preventDefault()
    if (!nome.trim()) return
    setSaving(true)
    try {
      const item = await addWish({
        nome: nome.trim(),
        tipo,
        observacao: observacao.trim() || null,
        endereco: picked?.endereco ?? null,
        lat: picked?.lat ?? null,
        lng: picked?.lng ?? null,
        google: picked?.google ?? null,
      })
      setItems((list) => [item, ...(list ?? [])])
      setNome('')
      setObservacao('')
      setPicked(null)
    } catch {
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    setConfirming(null)
    setItems((list) => list?.filter((i) => i.id !== id) ?? null)
    await removeWish(id).catch(fetchItems)
  }

  return (
    <main className={page.page}>
      <header className={page.header}>
        <h1 className={page.title}>Queremos ir</h1>
      </header>

      <form className={styles.form} onSubmit={add}>
        <PlaceNameField
          value={nome}
          onChange={setNome}
          onPick={({ nome: found, tipo: kind, ...rest }) => {
            setNome(found)
            if (kind) setTipo(kind)
            setPicked(rest)
          }}
        />
        {picked?.endereco && (
          <div className={styles.picked}>
            <MapPin size={14} />
            <span>{picked.endereco}</span>
            <button type="button" onClick={() => setPicked(null)}>
              tirar
            </button>
          </div>
        )}
        <div className={styles.kinds} role="group" aria-label="Tipo">
          <button type="button" className={styles.kind} aria-pressed={tipo === 'cafe'} onClick={() => setTipo('cafe')}>
            Café
          </button>
          <button
            type="button"
            className={styles.kind}
            aria-pressed={tipo === 'restaurante'}
            onClick={() => setTipo('restaurante')}
          >
            Restaurante
          </button>
        </div>
        <input
          className="input"
          placeholder="Observação (opcional)"
          aria-label="Observação"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
        <button className="btn btn-primary" disabled={!nome.trim() || saving}>
          Adicionar
        </button>
      </form>

      {failed && <LoadError onRetry={fetchItems} />}

      {items?.length === 0 && <p className={styles.empty}>Anota aqui os lugares que vocês querem conhecer.</p>}

      {items && items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.icon}>
                <KindIcon tipo={item.tipo} size={20} />
              </span>
              <div className={styles.text}>
                {item.google ? (
                  <button
                    type="button"
                    className={styles.toggle}
                    aria-expanded={open === item.id}
                    onClick={() => setOpen((id) => (id === item.id ? null : item.id))}
                  >
                    <span className={styles.name}>{item.nome}</span>
                    <ChevronDown size={16} className={styles.chevron} aria-hidden />
                  </button>
                ) : (
                  <div className={styles.name}>{item.nome}</div>
                )}
                {item.observacao && <p className={`${styles.note} muted`}>{item.observacao}</p>}
                {item.endereco && <p className={`${styles.address} muted`}>{item.endereco}</p>}
                {item.google?.nota != null && (
                  <p className={`${styles.address} muted`}>
                    <Star size={12} strokeWidth={1.6} aria-hidden /> {item.google.nota.toLocaleString('pt-BR')} no
                    Google
                    {item.google.nivelPreco !== null && ` · ${'$'.repeat(item.google.nivelPreco)}`}
                  </p>
                )}
              </div>
              <div className={styles.actions}>
                <button className={`btn ${styles.went}`} onClick={() => navigate(`/novo?wish=${item.id}`)}>
                  Fomos!
                </button>
                <button
                  className={styles.remove}
                  aria-label={`Remover ${item.nome}`}
                  onClick={() => setConfirming(item.id)}
                >
                  <X size={18} />
                </button>
              </div>
              {open === item.id && item.google && (
                <div className={styles.details}>
                  <GoogleInfoCard nome={item.nome} info={item.google} />
                </div>
              )}
              {confirming === item.id && (
                <div className={styles.confirm}>
                  <span className="muted">Tirar da lista?</span>
                  <button className="btn btn-ghost" onClick={() => setConfirming(null)}>
                    Cancelar
                  </button>
                  <button className="btn" onClick={() => remove(item.id)}>
                    Sim, remover
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
