import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { GroceryPage } from './pages/GroceryPage'
import { MealsPage } from './pages/MealsPage'
import { WeekViewPage } from './pages/WeekViewPage'
import type { AppPage } from './types/navigation'

function App() {
  const [activePage, setActivePage] = useState<AppPage>('week')

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'week' && <WeekViewPage />}
      {activePage === 'meals' && <MealsPage />}
      {activePage === 'grocery' && <GroceryPage />}
    </AppShell>
  )
}

export default App
