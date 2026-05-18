import type { AppPage, NavItem } from '../types/navigation'

const navItems: NavItem[] = [
  { page: 'week', label: 'Week view' },
  { page: 'meals', label: 'Meals' },
  { page: 'grocery', label: 'Grocery List' },
]

type TopNavProps = {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
}

export function TopNav({ activePage, onNavigate }: TopNavProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase text-sage">
            Family Planner
          </p>
          <p className="text-lg font-semibold text-ink">Kitchen command center</p>
        </div>

        <nav aria-label="Primary navigation" className="flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.page

            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                className={[
                  'min-h-10 whitespace-nowrap rounded-md px-4 text-sm font-medium transition',
                  isActive
                    ? 'bg-ink text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
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
