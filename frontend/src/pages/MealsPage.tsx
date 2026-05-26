import { useMemo, useState, type FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import type { CreateMealDto, MealResponseDto, UpdateMealDto } from '../types/meal'

type MealFormState = {
  name: string
  recipeInstructions: string
  ingredientsText: string
}

const emptyForm: MealFormState = {
  name: '',
  recipeInstructions: '',
  ingredientsText: '',
}

type MealsPageProps = {
  meals: MealResponseDto[]
  onCreateMeal: (meal: CreateMealDto) => Promise<boolean>
  onUpdateMeal: (id: number, meal: UpdateMealDto) => Promise<boolean>
  onDeleteMeal: (id: number) => Promise<boolean>
}

export function MealsPage({
  meals,
  onCreateMeal,
  onUpdateMeal,
  onDeleteMeal,
}: MealsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMealId, setEditingMealId] = useState<number | null>(null)
  const [form, setForm] = useState<MealFormState>(emptyForm)
  const [nameError, setNameError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const editingMeal = useMemo(
    () => meals.find((meal) => meal.id === editingMealId) ?? null,
    [editingMealId, meals],
  )
  const modalTitle = editingMeal ? 'Edit Meal' : 'Create Meal'

  function openCreateModal() {
    setEditingMealId(null)
    setForm(emptyForm)
    setNameError('')
    setIsModalOpen(true)
  }

  function openEditModal(meal: MealResponseDto) {
    setEditingMealId(meal.id)
    setForm({
      name: meal.name,
      recipeInstructions: meal.recipeInstructions ?? '',
      ingredientsText: meal.ingredients.join(', '),
    })
    setNameError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingMealId(null)
    setForm(emptyForm)
    setNameError('')
  }

  async function saveMeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = form.name.trim()
    if (!name) {
      setNameError('Meal name is required.')
      return
    }

    const ingredients = form.ingredientsText
      .split(',')
      .map((ingredient) => ingredient.trim())
      .filter(Boolean)

    const mealPayload = {
      name,
      recipeInstructions: form.recipeInstructions.trim(),
      ingredients,
    }

    setIsSaving(true)

    const saved = editingMeal
      ? await onUpdateMeal(editingMeal.id, mealPayload)
      : await onCreateMeal(mealPayload)

    setIsSaving(false)

    if (saved) {
      closeModal()
    }
  }

  async function deleteMeal(mealId: number) {
    const deleted = await onDeleteMeal(mealId)

    if (deleted && editingMealId === mealId) {
      closeModal()
    }
  }

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Meals"
          description="Create and manage the meals that can be assigned to the weekly plan."
        />

        <button
          type="button"
          onClick={openCreateModal}
          className="min-h-10 rounded-md bg-ink px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Create Meal
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <article
            key={meal.id}
            className="flex min-h-56 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex-1">
              <h2 className="font-semibold text-ink">{meal.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {meal.recipeInstructions || 'No recipe instructions yet.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {meal.ingredients.length > 0 ? (
                  meal.ingredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                    >
                      {ingredient}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">
                    No ingredients added.
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => openEditModal(meal)}
                className="min-h-10 flex-1 rounded-md bg-slate-100 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteMeal(meal.id)}
                className="min-h-10 flex-1 rounded-md bg-berry/10 px-3 text-sm font-medium text-berry transition hover:bg-berry/15"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {meals.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="font-semibold text-ink">No meals yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Create your first meal so the week planner has something to work with.
          </p>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-950/40 px-4 py-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="meal-modal-title"
        >
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="meal-modal-title" className="text-xl font-semibold text-ink">
                  {modalTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Ingredients can stay comma-separated for now. Fancy parsing can wait its turn.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={saveMeal}>
              <label className="block">
                <span className="text-sm font-medium text-ink">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, name: event.target.value }))
                    setNameError('')
                  }}
                  className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                  placeholder="Example: Taco Bowls"
                />
                {nameError && (
                  <span className="mt-2 block text-sm font-medium text-berry">
                    {nameError}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">
                  Recipe instructions
                </span>
                <textarea
                  value={form.recipeInstructions}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      recipeInstructions: event.target.value,
                    }))
                  }
                  className="mt-2 min-h-32 w-full resize-y rounded-md border border-slate-300 px-3 py-3 text-sm text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                  placeholder="Short cooking notes..."
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">Ingredients</span>
                <input
                  value={form.ingredientsText}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ingredientsText: event.target.value,
                    }))
                  }
                  className="mt-2 min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                  placeholder="Rice, beans, tomatoes"
                />
              </label>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-10 rounded-md bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="min-h-10 rounded-md bg-ink px-4 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {isSaving ? 'Saving...' : 'Save Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
