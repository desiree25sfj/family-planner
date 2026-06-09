import { useState, type FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import type { GroceryItemResponseDto } from '../types/grocery'

type GroceryPageProps = {
  groceryItems: GroceryItemResponseDto[]
  generatedItemCount: number
  manualItemCount: number
  onAddManualItem: (name: string) => boolean | Promise<boolean>
  onToggleItem: (item: GroceryItemResponseDto) => void | Promise<void>
  onAdjustItemQuantity: (
    item: GroceryItemResponseDto,
    nextQuantity: number,
  ) => void | Promise<void>
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
  onAdjustItemQuantity,
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
          <div className="mb-4 flex flex-col gap-2 border-b border-oat pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-ink">This week's list</h2>
              <p className="mt-1 text-sm text-muted">
                {generatedItemCount} generated, {manualItemCount} manual
              </p>
            </div>
          </div>

          {groceryItems.length > 0 ? (
            <ul className="space-y-2">
              {groceryItems.map((item) => {
                const quantityCount = getQuantityCount(item)
                const isPending = pendingItemIds.has(item.id)

                return (
                  <li
                    key={item.id}
                    className={[
                      'flex flex-col gap-3 rounded-lg border p-3 transition sm:flex-row sm:items-center',
                      item.isCompleted
                        ? 'border-oat/60 bg-paper/50'
                        : 'border-oat bg-linen hover:border-sage/40',
                    ].join(' ')}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleItem(item)}
                        disabled={isPending}
                        className={[
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:cursor-not-allowed disabled:opacity-60',
                          item.isCompleted
                            ? 'border-sage bg-sage text-white'
                            : 'border-oat bg-white/80 text-transparent hover:border-sage',
                        ].join(' ')}
                        aria-label={`Mark ${item.name} ${
                          item.isCompleted ? 'incomplete' : 'complete'
                        }`}
                      >
                        x
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={[
                              'font-medium leading-6',
                              item.isCompleted
                                ? 'text-muted/50 line-through'
                                : 'text-ink',
                            ].join(' ')}
                          >
                            {item.name}
                          </p>
                          {quantityCount > 1 && (
                            <span className="rounded-full bg-fjord/15 px-2 py-0.5 text-xs font-semibold text-ink">
                              x{quantityCount}
                            </span>
                          )}
                        </div>
                        <p
                          className={[
                            'mt-1 inline-flex rounded-md px-2 py-1 text-xs font-medium',
                            item.isManuallyAdded
                              ? 'bg-fjord/10 text-ink'
                              : 'bg-sage/10 text-ink',
                          ].join(' ')}
                        >
                          {item.isManuallyAdded ? 'Manual' : 'From meal plan'}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                      <div className="flex items-center overflow-hidden rounded-lg border border-oat bg-white/70">
                        <button
                          type="button"
                          onClick={() => onAdjustItemQuantity(item, quantityCount - 1)}
                          disabled={isPending || quantityCount <= 1}
                          className="flex h-9 w-9 items-center justify-center text-sm font-semibold text-muted transition hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          -
                        </button>
                        <span className="min-w-10 border-x border-oat px-2 text-center text-sm font-semibold text-ink">
                          {quantityCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAdjustItemQuantity(item, quantityCount + 1)}
                          disabled={isPending}
                          className="flex h-9 w-9 items-center justify-center text-sm font-semibold text-muted transition hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item)}
                        disabled={isPending}
                        className="btn-secondary min-h-9 px-3"
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="empty-state">
              <h2 className="font-semibold text-ink">Nothing to buy yet</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Plan dinners on the Plan Week page, or add a one-off item here.
              </p>
            </div>
          )}
        </div>

        <aside className="card card-pad">
          <h2 className="font-semibold text-ink">Add item</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
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

function getQuantityCount(item: GroceryItemResponseDto) {
  const parsedQuantity = Number.parseInt(item.quantity ?? '', 10)

  if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
    return 1
  }

  return parsedQuantity
}
