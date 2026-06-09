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
  const modalTitle = editingMeal ? 'Edit Meal' : 'Add Meal'

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Meals"
          description="Save dinners your household actually eats, then choose them in the weekly plan."
        />

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary"
        >
          Add Meal
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <article
            key={meal.id}
            className="card card-pad flex min-h-56 flex-col"
          >
            <div className="flex-1">
              <h2 className="font-semibold text-ink">{meal.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                {meal.recipeInstructions || 'No recipe instructions yet.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {meal.ingredients.length > 0 ? (
                  meal.ingredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="rounded-md bg-sage/10 px-2 py-1 text-xs font-semibold text-ink"
                    >
                      {ingredient}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted">
                    No ingredients added.
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => openEditModal(meal)}
                className="btn-secondary flex-1"
                aria-label={`Edit ${meal.name}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteMeal(meal.id)}
                className="btn-danger flex-1"
                aria-label={`Delete ${meal.name}`}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {meals.length === 0 && (
        <div className="empty-state">
          <h2 className="font-semibold text-ink">No meals yet</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Add a dinner your household likes. It will appear as a choice in Plan Week.
          </p>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-ink/30 px-4 py-4 backdrop-blur-sm sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="meal-modal-title"
        >
          <div className="card card-pad w-full max-w-xl shadow-[0_24px_70px_rgba(47,48,44,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="meal-modal-title" className="text-xl font-semibold text-ink">
                  {modalTitle}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Keep cooking notes simple and add ingredients as comma-separated text.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="btn-secondary px-3"
                aria-label="Close meal form"
              >
                Close
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={saveMeal}>
              <label className="block">
                <span className="field-label">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, name: event.target.value }))
                    setNameError('')
                  }}
                  className="field"
                  placeholder="Example: Taco Bowls"
                  aria-invalid={nameError ? 'true' : 'false'}
                  aria-describedby={nameError ? 'meal-name-error' : undefined}
                />
                {nameError && (
                  <span
                    id="meal-name-error"
                    className="mt-2 block text-sm font-medium text-berry"
                  >
                    {nameError}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="field-label">Recipe instructions</span>
                <textarea
                  value={form.recipeInstructions}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      recipeInstructions: event.target.value,
                    }))
                  }
                  className="field min-h-32 resize-y py-3"
                  placeholder="Short cooking notes..."
                />
              </label>

              <label className="block">
                <span className="field-label">Ingredients</span>
                <input
                  value={form.ingredientsText}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ingredientsText: event.target.value,
                    }))
                  }
                  className="field"
                  placeholder="Rice, beans, tomatoes"
                />
                <span className="mt-2 block text-xs leading-5 text-muted">
                  Separate ingredients with commas.
                </span>
              </label>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary"
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
