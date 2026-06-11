import type { AuthUser } from '../types/auth'
import type { AppPage, NavItem } from '../types/navigation'

const navItems: NavItem[] = [
  { page: 'week', label: 'Plan Week' },
  { page: 'meals', label: 'Meals' },
  { page: 'grocery', label: 'Groceries' },
  { page: 'household', label: 'Household' },
]

type TopNavProps = {
  activePage: AppPage
  currentUser: AuthUser
  onNavigate: (page: AppPage) => void
  onSignOut: () => void
}

export function TopNav({ activePage, currentUser, onNavigate, onSignOut }: TopNavProps) {
  return (
    <header className="border-b border-oat/80 bg-linen/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-sage">Family Planner</p>
          <p className="text-base font-semibold leading-6 text-ink sm:text-lg">
            Plan dinners and groceries
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex min-w-0 items-center gap-3">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full border border-oat bg-paper object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-oat bg-paper text-sm font-semibold text-sage">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {currentUser.displayName}
              </p>
              <p className="truncate text-xs text-muted">{currentUser.email}</p>
            </div>
            <button type="button" onClick={onSignOut} className="btn-ghost shrink-0 px-3">
              Sign out
            </button>
          </div>

          <nav
            aria-label="Primary navigation"
            className="grid w-full grid-cols-2 gap-1 rounded-xl bg-paper/70 p-1 sm:flex sm:w-auto sm:gap-2"
          >
            {navItems.map((item) => {
              const isActive = activePage === item.page

              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'btn min-h-11 min-w-0 whitespace-normal px-2 text-center text-xs leading-tight sm:whitespace-nowrap sm:px-3 sm:text-sm',
                    isActive
                      ? 'bg-sage text-white shadow-sm'
                      : 'bg-transparent text-muted hover:bg-linen hover:text-ink',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
