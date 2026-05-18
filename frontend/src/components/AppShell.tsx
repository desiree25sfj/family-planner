import { TopNav } from './TopNav'
import type { AppPage } from '../types/navigation'

type AppShellProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  children: React.ReactNode
}

export function AppShell({ activePage, onNavigate, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-paper">
      <TopNav activePage={activePage} onNavigate={onNavigate} />
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
