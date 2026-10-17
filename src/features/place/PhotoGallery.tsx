import { useRef } from 'react'
import { ImagePlus } from 'lucide-react'
import styles from './PhotoGallery.module.css'

type Props = {
  urls: string[]
  uploading: boolean
  onAdd: (files: File[]) => void
}

export function PhotoGallery({ urls, uploading, onAdd }: Props) {
  const input = useRef<HTMLInputElement>(null)

  return (
    <section>
      {urls.length > 0 && (
        <div className={styles.gallery}>
          {urls.map((url) => (
            <img key={url} src={url} alt="" className={styles.photo} loading="lazy" />
          ))}
        </div>
      )}
      <button className={`btn btn-ghost ${styles.add}`} onClick={() => input.current?.click()} disabled={uploading}>
        <ImagePlus size={18} strokeWidth={1.6} />
        {uploading ? 'Enviando fotos…' : 'Adicionar fotos'}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          e.target.value = ''
          if (files.length) onAdd(files)
        }}
      />
    </section>
  )
}
