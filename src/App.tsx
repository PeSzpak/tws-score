import { lazy, Suspense } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { AuthGate } from './auth/AuthGate'
import { BottomNav } from './components/BottomNav'
import { HomePage } from './pages/HomePage'
import { NewVisitPage } from './pages/NewVisitPage'
import { PlacePage } from './pages/PlacePage'
import { WishlistPage } from './pages/WishlistPage'

const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })))

function Shell() {
  return (
    <>
      <Suspense>
        <Outlet />
      </Suspense>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <AuthGate>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<HomePage />} />
            <Route path="novo" element={<NewVisitPage />} />
            <Route path="lugar/:id" element={<PlacePage />} />
            <Route path="mapa" element={<MapPage />} />
            <Route path="queremos-ir" element={<WishlistPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthGate>
  )
}
