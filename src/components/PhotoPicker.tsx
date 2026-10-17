import { useEffect, useMemo, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import styles from './PhotoPicker.module.css'

type Props = {
  photos: File[]
  onChange: (photos: File[]) => void
}

export function PhotoPicker({ photos, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const previews = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos])

  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  return (
    <div className={styles.picker}>
      {previews.map((src, i) => (
        <div key={src} className={styles.thumb}>
          <img src={src} alt="" />
          <button
            type="button"
            className={styles.remove}
            aria-label="Remover foto"
            onClick={() => onChange(photos.filter((_, j) => j !== i))}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button type="button" className={styles.add} onClick={() => input.current?.click()}>
        <ImagePlus size={22} strokeWidth={1.6} />
        <span>Adicionar fotos</span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          onChange([...photos, ...Array.from(e.target.files ?? [])])
          e.target.value = ''
        }}
      />
    </div>
  )
}
