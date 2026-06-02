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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase text-sage">Family Planner</p>
          <p className="text-lg font-semibold text-ink">Plan dinners and groceries</p>
        </div>

        <nav
          aria-label="Primary navigation"
          className="flex gap-2 overflow-x-auto rounded-xl bg-paper/70 p-1"
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
                  'btn min-h-9 whitespace-nowrap px-3',
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
