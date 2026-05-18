import { useMemo, useState, type FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import type { PlannedMealsByDay } from '../types/weekPlan'

type ManualGroceryItem = {
  id: number
  name: string
  isCompleted: boolean
}

type GroceryListItem = {
  id: string
  name: string
  source: 'generated' | 'manual'
  isCompleted: boolean
}

type GroceryPageProps = {
  plannedMeals: PlannedMealsByDay
}

export function GroceryPage({ plannedMeals }: GroceryPageProps) {
  const [manualItems, setManualItems] = useState<ManualGroceryItem[]>([])
  const [manualItemName, setManualItemName] = useState('')
  const [completedGeneratedNames, setCompletedGeneratedNames] = useState<Set<string>>(
    () => new Set(),
  )
  const [removedGeneratedNames, setRemovedGeneratedNames] = useState<Set<string>>(
    () => new Set(),
  )

  const generatedItems = useMemo(() => {
    const ingredientsByName = new Map<string, string>()

    Object.values(plannedMeals).forEach((assignment) => {
      assignment?.meal.ingredients.forEach((ingredient) => {
        const name = ingredient.trim()

        if (!name) {
          return
        }

        const key = normalizeName(name)
        if (!ingredientsByName.has(key)) {
          ingredientsByName.set(key, name)
        }
      })
    })

    return Array.from(ingredientsByName.entries())
      .filter(([key]) => !removedGeneratedNames.has(key))
      .map(([key, name]) => ({
        id: `generated-${key}`,
        name,
        source: 'generated' as const,
        isCompleted: completedGeneratedNames.has(key),
      }))
      .sort((first, second) => first.name.localeCompare(second.name))
  }, [completedGeneratedNames, plannedMeals, removedGeneratedNames])

  const groceryItems: GroceryListItem[] = [
    ...generatedItems,
    ...manualItems.map((item) => ({
      id: `manual-${item.id}`,
      name: item.name,
      source: 'manual' as const,
      isCompleted: item.isCompleted,
    })),
  ].sort((first, second) => {
    if (first.isCompleted !== second.isCompleted) {
      return first.isCompleted ? 1 : -1
    }

    return first.name.localeCompare(second.name)
  })

  function addManualItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = manualItemName.trim()
    if (!name) {
      return
    }

    setManualItems((currentItems) => [
      ...currentItems,
      {
        id: Date.now(),
        name,
        isCompleted: false,
      },
    ])
    setManualItemName('')
  }

  function toggleItem(item: GroceryListItem) {
    if (item.source === 'manual') {
      const manualId = Number(item.id.replace('manual-', ''))
      setManualItems((currentItems) =>
        currentItems.map((manualItem) =>
          manualItem.id === manualId
            ? { ...manualItem, isCompleted: !manualItem.isCompleted }
            : manualItem,
        ),
      )
      return
    }

    const key = item.id.replace('generated-', '')
    setCompletedGeneratedNames((currentNames) => {
      const nextNames = new Set(currentNames)

      if (nextNames.has(key)) {
        nextNames.delete(key)
      } else {
        nextNames.add(key)
      }

      return nextNames
    })
  }

  function removeItem(item: GroceryListItem) {
    if (item.source === 'manual') {
      const manualId = Number(item.id.replace('manual-', ''))
      setManualItems((currentItems) =>
        currentItems.filter((manualItem) => manualItem.id !== manualId),
      )
      return
    }

    const key = item.id.replace('generated-', '')
    setRemovedGeneratedNames((currentNames) => new Set(currentNames).add(key))
  }

  return (
    <section>
      <PageHeader
        title="Grocery List"
        description="Ingredients from planned meals are combined automatically, and you can add extra items by hand."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-ink">This week's list</h2>
              <p className="mt-1 text-sm text-slate-600">
                {generatedItems.length} generated, {manualItems.length} manual
              </p>
            </div>
          </div>

          {groceryItems.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {groceryItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 py-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item)}
                    className={[
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold transition',
                      item.isCompleted
                        ? 'border-ink bg-ink text-white'
                        : 'border-slate-300 bg-white text-transparent hover:border-slate-500',
                    ].join(' ')}
                    aria-label={`Mark ${item.name} ${
                      item.isCompleted ? 'incomplete' : 'complete'
                    }`}
                  >
                    x
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={[
                        'font-medium',
                        item.isCompleted
                          ? 'text-slate-400 line-through'
                          : 'text-ink',
                      ].join(' ')}
                    >
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs uppercase text-slate-500">
                      {item.source === 'generated' ? 'From meal plan' : 'Manual'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="min-h-9 rounded-md bg-slate-100 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <h2 className="font-semibold text-ink">Nothing to buy yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Assign meals in Week View or add a manual item here.
              </p>
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-ink">Add item</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use this for breakfast stuff, snacks, or the thing someone remembers
            exactly 12 seconds after you leave the house.
          </p>

          <form className="mt-4 flex gap-2" onSubmit={addManualItem}>
            <input
              value={manualItemName}
              onChange={(event) => setManualItemName(event.target.value)}
              className="min-h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
              placeholder="Milk"
              aria-label="Manual grocery item"
            />
            <button
              type="submit"
              className="min-h-11 rounded-md bg-ink px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add
            </button>
          </form>
        </aside>
      </div>
    </section>
  )
}

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase()
}
