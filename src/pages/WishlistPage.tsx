import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { X } from 'lucide-react'
import { LoadError } from '../components/LoadError'
import { addWish, listWishes, removeWish } from '../data/wishlist'
import { KindIcon } from '../features/home/PlaceCard'
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
  const [confirming, setConfirming] = useState<string | null>(null)
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
      const item = await addWish({ nome: nome.trim(), tipo, observacao: observacao.trim() || null })
      setItems((list) => [item, ...(list ?? [])])
      setNome('')
      setObservacao('')
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
        <label className="field">
          Nome do lugar
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" />
        </label>
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
              <div>
                <div className={styles.name}>{item.nome}</div>
                {item.observacao && <p className={`${styles.note} muted`}>{item.observacao}</p>}
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
