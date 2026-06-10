import type { AppPage, NavItem } from '../types/navigation'

const navItems: NavItem[] = [
  { page: 'week', label: 'Plan Week' },
  { page: 'meals', label: 'Meals' },
  { page: 'grocery', label: 'Groceries' },
]

type TopNavProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
}

export function TopNav({ activePage, onNavigate }: TopNavProps) {
  return (
    <header className="border-b border-oat/80 bg-linen/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-sage">Family Planner</p>
          <p className="text-base font-semibold leading-6 text-ink sm:text-lg">
            Plan dinners and groceries
          </p>
        </div>

        <nav
          aria-label="Primary navigation"
          className="grid w-full grid-cols-3 gap-1 rounded-xl bg-paper/70 p-1 sm:flex sm:w-auto sm:gap-2"
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
    </header>
  )
}
