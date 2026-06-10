import { TopNav } from './TopNav'
import type { AuthUser } from '../types/auth'
import type { AppPage } from '../types/navigation'

type AppShellProps = {
  activePage: AppPage
  currentUser: AuthUser
  onNavigate: (page: AppPage) => void
  onSignOut: () => void
  children: React.ReactNode
}

export function AppShell({
  activePage,
  currentUser,
  onNavigate,
  onSignOut,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <TopNav
        activePage={activePage}
        currentUser={currentUser}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
      />
      <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  )
}
