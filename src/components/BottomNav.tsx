import { NavLink } from 'react-router'
import { Bookmark, House, Map, Plus } from 'lucide-react'
import styles from './BottomNav.module.css'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.link} ${styles.active}` : styles.link

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <NavLink to="/" end className={linkClass}>
        <House size={22} strokeWidth={1.6} />
        Início
      </NavLink>
      <NavLink to="/mapa" className={linkClass}>
        <Map size={22} strokeWidth={1.6} />
        Mapa
      </NavLink>
      <NavLink to="/novo" className={styles.add} aria-label="Nova visita">
        <Plus size={26} strokeWidth={1.8} />
      </NavLink>
      <NavLink to="/queremos-ir" className={linkClass}>
        <Bookmark size={22} strokeWidth={1.6} />
        Queremos ir
      </NavLink>
    </nav>
  )
}
