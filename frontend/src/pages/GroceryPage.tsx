import { useState, type FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import type { GroceryItemResponseDto } from '../types/grocery'

type GroceryPageProps = {
  groceryItems: GroceryItemResponseDto[]
  generatedItemCount: number
  manualItemCount: number
  onAddManualItem: (name: string) => boolean | Promise<boolean>
  onToggleItem: (item: GroceryItemResponseDto) => void | Promise<void>
  onRemoveItem: (item: GroceryItemResponseDto) => void | Promise<void>
  isAddingItem: boolean
  pendingItemIds: Set<number>
}

export function GroceryPage({
  groceryItems,
  generatedItemCount,
  manualItemCount,
  onAddManualItem,
  onToggleItem,
  onRemoveItem,
  isAddingItem,
  pendingItemIds,
}: GroceryPageProps) {
  const [manualItemName, setManualItemName] = useState('')

  async function addManualItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const added = await onAddManualItem(manualItemName)

    if (added) {
      setManualItemName('')
    }
  }

  return (
    <section>
      <PageHeader
        title="Groceries"
        description="Ingredients from your weekly dinners appear here automatically. Add anything extra by hand."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="card card-pad">
          <div className="mb-4 flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-ink">This week's list</h2>
              <p className="mt-1 text-sm text-slate-600">
                {generatedItemCount} generated, {manualItemCount} manual
              </p>
            </div>
          </div>

          {groceryItems.length > 0 ? (
            <ul className="space-y-2">
              {groceryItems.map((item) => (
                <li
                  key={item.id}
                  className={[
                    'flex items-center gap-3 rounded-md border p-3 transition',
                    item.isCompleted
                      ? 'border-slate-100 bg-slate-50'
                      : 'border-slate-200 bg-white',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={() => onToggleItem(item)}
                    disabled={pendingItemIds.has(item.id)}
                    className={[
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded border text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60',
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
                        'font-medium leading-6',
                        item.isCompleted
                          ? 'text-slate-400 line-through'
                          : 'text-ink',
                      ].join(' ')}
                    >
                      {item.name}
                    </p>
                    <p
                      className={[
                        'mt-1 inline-flex rounded-md px-2 py-1 text-xs font-medium',
                        item.isManuallyAdded
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-sage/15 text-slate-700',
                      ].join(' ')}
                    >
                      {item.isManuallyAdded ? 'Manual' : 'From meal plan'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item)}
                    disabled={pendingItemIds.has(item.id)}
                    className="btn-secondary min-h-9 px-3"
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <h2 className="font-semibold text-ink">Nothing to buy yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Plan dinners on the Plan Week page, or add a one-off item here.
              </p>
            </div>
          )}
        </div>

        <aside className="card card-pad">
          <h2 className="font-semibold text-ink">Add item</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use this for household items that are not part of a planned dinner.
          </p>

          <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={addManualItem}>
            <input
              value={manualItemName}
              onChange={(event) => setManualItemName(event.target.value)}
              className="field mt-0 min-w-0 flex-1"
              placeholder="Milk"
              aria-label="Manual grocery item"
            />
            <button
              type="submit"
              disabled={isAddingItem}
              className="btn-primary min-h-11"
            >
              {isAddingItem ? 'Adding...' : 'Add'}
            </button>
          </form>
        </aside>
      </div>
    </section>
  )
}
