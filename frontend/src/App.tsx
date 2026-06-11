import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { GroceryPage } from './pages/GroceryPage'
import { HouseholdPage } from './pages/HouseholdPage'
import { MealsPage } from './pages/MealsPage'
import { SignInPage } from './pages/SignInPage'
import { WeekViewPage } from './pages/WeekViewPage'
import { authApi } from './services/authApi'
import { groceryApi } from './services/groceryApi'
import { ApiError, getApiErrorMessage } from './services/apiClient'
import { householdApi } from './services/householdApi'
import { mealsApi } from './services/mealsApi'
import { weekPlanApi } from './services/weekPlanApi'
import type { AuthUser } from './types/auth'
import type { GroceryItemResponseDto } from './types/grocery'
import type { CreateMealDto, MealResponseDto, UpdateMealDto } from './types/meal'
import type { AppPage } from './types/navigation'
import type { DayOfWeek, PlannedMealsByDay } from './types/weekPlan'
import { sortGroceryItems } from './utils/groceryUtils'
import {
  removeMealFromPlannedMeals,
  toPlannedMealsByDay,
  updateMealInPlannedMeals,
} from './utils/weekPlanUtils'

function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [activePage, setActivePage] = useState<AppPage>('week')
  const [meals, setMeals] = useState<MealResponseDto[]>([])
  const [plannedMeals, setPlannedMeals] = useState<PlannedMealsByDay>({})
  const [groceryItems, setGroceryItems] = useState<GroceryItemResponseDto[]>([])
  const [statusMessage, setStatusMessage] = useState('Loading planner data...')
  const [isWeekPlanSaving, setIsWeekPlanSaving] = useState(false)
  const [isAddingGroceryItem, setIsAddingGroceryItem] = useState(false)
  const [processedInviteToken, setProcessedInviteToken] = useState<string | null>(null)
  const [pendingEditMealId, setPendingEditMealId] = useState<number | null>(null)
  const [pendingGroceryItemIds, setPendingGroceryItemIds] = useState<Set<number>>(
    () => new Set(),
  )

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      acceptInviteFromUrl()
      loadPlannerData()
    }
  }, [currentUser])

  async function acceptInviteFromUrl() {
    const inviteToken = getInviteTokenFromPath()

    if (!inviteToken || inviteToken === processedInviteToken) {
      return
    }

    try {
      setProcessedInviteToken(inviteToken)
      await householdApi.acceptInvitation(inviteToken)
      const user = await authApi.getCurrentUser()
      setCurrentUser(user)
      setActivePage('household')
      window.history.replaceState({}, '', '/')
      setStatusMessage('You joined the household.')
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, 'Could not accept the household invitation.'),
      )
    }
  }

  async function loadCurrentUser() {
    try {
      const user = await authApi.getCurrentUser()
      setCurrentUser(user)
      setStatusMessage('Loading planner data...')
    } catch (error) {
      setCurrentUser(null)
      clearPlannerState()

      if (error instanceof ApiError && error.status === 401) {
        setStatusMessage('')
      } else {
        setStatusMessage(
          getApiErrorMessage(error, 'Could not check your sign-in status.'),
        )
      }
    } finally {
      setIsAuthLoading(false)
    }
  }

  async function loadPlannerData() {
    try {
      const loadedMeals = await mealsApi.getAll()
      const loadedWeekPlan = await weekPlanApi.getCurrent()
      const loadedGroceryList = await groceryApi.getCurrent()

      setMeals(loadedMeals)
      setPlannedMeals(toPlannedMealsByDay(loadedWeekPlan, loadedMeals))
      setGroceryItems(sortGroceryItems(loadedGroceryList.items))
      setStatusMessage('')
    } catch (error) {
      setMeals([])
      setPlannedMeals({})
      setGroceryItems([])

      if (error instanceof ApiError && error.status === 401) {
        setCurrentUser(null)
        setStatusMessage('Your session expired. Sign in again to continue.')
        return
      }

      setStatusMessage(
        getApiErrorMessage(error, 'Could not load API data. Start the API and refresh.'),
      )
    }
  }

  async function createMeal(meal: CreateMealDto) {
    try {
      const createdMeal = await mealsApi.create(meal)
      setMeals((currentMeals) => [createdMeal, ...currentMeals])
      setStatusMessage('')
      return true
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, 'Could not create meal. Check that the API is running.'),
      )
      return false
    }
  }

  async function updateMeal(id: number, meal: UpdateMealDto) {
    const previousMeals = meals
    const previousPlannedMeals = plannedMeals
    const optimisticMeal: MealResponseDto = {
      id,
      name: meal.name,
      recipeInstructions: meal.recipeInstructions ?? null,
      isDraft:
        !meal.recipeInstructions?.trim() || (meal.ingredients?.length ?? 0) === 0,
      ingredients: meal.ingredients ?? [],
    }

    applyMealUpdate(optimisticMeal)

    try {
      const updatedMeal = await mealsApi.update(id, meal)
      applyMealUpdate(updatedMeal)
      await refreshGroceryList()
      setStatusMessage('')
      return true
    } catch (error) {
      setMeals(previousMeals)
      setPlannedMeals(previousPlannedMeals)
      setStatusMessage(
        getApiErrorMessage(error, 'Could not update meal. Check that the API is running.'),
      )
      return false
    }
  }

  async function deleteMeal(id: number) {
    const previousMeals = meals
    const previousPlannedMeals = plannedMeals
    const previousGroceryItems = groceryItems

    removeMealFromState(id)

    try {
      await mealsApi.delete(id)
      await loadPlannerData()
      setStatusMessage('')
      return true
    } catch (error) {
      setMeals(previousMeals)
      setPlannedMeals(previousPlannedMeals)
      setGroceryItems(previousGroceryItems)
      setStatusMessage(
        getApiErrorMessage(error, 'Could not delete meal. Check that the API is running.'),
      )
      return false
    }
  }

  async function assignMeal(day: DayOfWeek, meal: MealResponseDto) {
    if (isWeekPlanSaving) {
      return false
    }

    const existingAssignment = plannedMeals[day]
    const previousPlannedMeals = plannedMeals
    const previousGroceryItems = groceryItems

    setIsWeekPlanSaving(true)
    // Optimistic update keeps the planner feeling instant; failed requests roll
    // back to the previous state in the catch block below.
    setPlannedMeals((currentPlan) => ({
      ...currentPlan,
      [day]: {
        plannedMealId: existingAssignment?.plannedMealId ?? -Date.now(),
        meal,
        assignedFamilyMemberName:
          existingAssignment?.assignedFamilyMemberName ?? null,
      },
    }))

    try {
      const savedPlannedMeal = existingAssignment
        ? await weekPlanApi.updateMeal(existingAssignment.plannedMealId, {
            dayOfWeek: day,
            mealId: meal.id,
          })
        : await weekPlanApi.addMeal({ dayOfWeek: day, mealId: meal.id })

      setPlannedMeals((currentPlan) => ({
        ...currentPlan,
        [day]: {
          plannedMealId: savedPlannedMeal.id,
          meal,
          assignedFamilyMemberName: savedPlannedMeal.assignedFamilyMemberName,
        },
      }))
      await refreshGroceryList()
      setStatusMessage('')
      return true
    } catch (error) {
      setPlannedMeals(previousPlannedMeals)
      setGroceryItems(previousGroceryItems)
      setStatusMessage(
        getApiErrorMessage(error, 'Could not update week plan. Check that the API is running.'),
      )
      return false
    } finally {
      setIsWeekPlanSaving(false)
    }
  }

  async function createAndAssignMeal(day: DayOfWeek, mealName: string) {
    const trimmedName = mealName.trim()

    if (!trimmedName || isWeekPlanSaving) {
      return false
    }

    try {
      const createdMeal = await mealsApi.create({
        name: trimmedName,
        recipeInstructions: null,
        ingredients: [],
      })
      setMeals((currentMeals) => [createdMeal, ...currentMeals])
      const assigned = await assignMeal(day, createdMeal)

      if (assigned) {
        setStatusMessage('')
      }

      return assigned
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, 'Could not quick add meal. Check that the API is running.'),
      )
      return false
    }
  }

  function editMealFromPlanner(meal: MealResponseDto) {
    setPendingEditMealId(meal.id)
    setActivePage('meals')
  }

  async function clearMeal(day: DayOfWeek) {
    if (isWeekPlanSaving) {
      return
    }

    const existingAssignment = plannedMeals[day]

    if (!existingAssignment) {
      return
    }

    const previousPlannedMeals = plannedMeals
    const previousGroceryItems = groceryItems

    setIsWeekPlanSaving(true)
    // Optimistic clear mirrors the assign flow; the previous plan is restored if
    // the backend rejects the delete.
    setPlannedMeals((currentPlan) => {
      const nextPlan = { ...currentPlan }
      delete nextPlan[day]
      return nextPlan
    })

    try {
      await weekPlanApi.deleteMeal(existingAssignment.plannedMealId)
      await refreshGroceryList()
      setStatusMessage('')
    } catch (error) {
      setPlannedMeals(previousPlannedMeals)
      setGroceryItems(previousGroceryItems)
      setStatusMessage(
        getApiErrorMessage(error, 'Could not update week plan. Check that the API is running.'),
      )
    } finally {
      setIsWeekPlanSaving(false)
    }
  }

  function applyMealUpdate(updatedMeal: MealResponseDto) {
    setMeals((currentMeals) =>
      currentMeals.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal)),
    )
    setPlannedMeals((currentPlan) => updateMealInPlannedMeals(currentPlan, updatedMeal))
  }

  function removeMealFromState(id: number) {
    setMeals((currentMeals) => currentMeals.filter((meal) => meal.id !== id))
    setPlannedMeals((currentPlan) => removeMealFromPlannedMeals(currentPlan, id))
  }

  async function addManualGroceryItem(name: string) {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return false
    }

    try {
      setIsAddingGroceryItem(true)
      await groceryApi.addItem({ name: trimmedName })
      await refreshGroceryList()
      setStatusMessage('')
      return true
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, 'Could not add grocery item. Check that the API is running.'),
      )
      return false
    } finally {
      setIsAddingGroceryItem(false)
    }
  }

  async function toggleGroceryItem(item: GroceryItemResponseDto) {
    if (pendingGroceryItemIds.has(item.id)) {
      return
    }

    const previousGroceryItems = groceryItems

    setPendingGroceryItemIds((currentIds) => new Set(currentIds).add(item.id))
    setGroceryItems((currentItems) =>
      sortGroceryItems(
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, isCompleted: !currentItem.isCompleted }
            : currentItem,
        ),
      ),
    )

    try {
      const updatedItem = await groceryApi.updateItem(item.id, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
        isCompleted: !item.isCompleted,
      })
      setGroceryItems((currentItems) =>
        sortGroceryItems(
          currentItems.map((currentItem) =>
            currentItem.id === updatedItem.id ? updatedItem : currentItem,
          ),
        ),
      )
      setStatusMessage('')
    } catch (error) {
      setGroceryItems(previousGroceryItems)
      setStatusMessage(
        getApiErrorMessage(error, 'Could not update grocery item. Check that the API is running.'),
      )
    } finally {
      setPendingGroceryItemIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(item.id)
        return nextIds
      })
    }
  }

  async function adjustGroceryItemQuantity(
    item: GroceryItemResponseDto,
    nextQuantity: number,
  ) {
    if (pendingGroceryItemIds.has(item.id) || nextQuantity < 1) {
      return
    }

    const previousGroceryItems = groceryItems
    const nextQuantityText = nextQuantity > 1 ? nextQuantity.toString() : null

    setPendingGroceryItemIds((currentIds) => new Set(currentIds).add(item.id))
    setGroceryItems((currentItems) =>
      sortGroceryItems(
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, quantity: nextQuantityText }
            : currentItem,
        ),
      ),
    )

    try {
      const updatedItem = await groceryApi.updateItem(item.id, {
        name: item.name,
        quantity: nextQuantityText,
        unit: item.unit,
        notes: item.notes,
        isCompleted: item.isCompleted,
      })
      setGroceryItems((currentItems) =>
        sortGroceryItems(
          currentItems.map((currentItem) =>
            currentItem.id === updatedItem.id ? updatedItem : currentItem,
          ),
        ),
      )
      setStatusMessage('')
    } catch (error) {
      setGroceryItems(previousGroceryItems)
      setStatusMessage(
        getApiErrorMessage(error, 'Could not update grocery quantity. Check that the API is running.'),
      )
    } finally {
      setPendingGroceryItemIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(item.id)
        return nextIds
      })
    }
  }

  async function removeGroceryItem(item: GroceryItemResponseDto) {
    if (pendingGroceryItemIds.has(item.id)) {
      return
    }

    const previousGroceryItems = groceryItems

    setPendingGroceryItemIds((currentIds) => new Set(currentIds).add(item.id))
    setGroceryItems((currentItems) =>
      currentItems.filter((currentItem) => currentItem.id !== item.id),
    )

    try {
      await groceryApi.deleteItem(item.id)
      await refreshGroceryList()
      setStatusMessage('')
    } catch (error) {
      setGroceryItems(previousGroceryItems)
      setStatusMessage(
        getApiErrorMessage(error, 'Could not remove grocery item. Check that the API is running.'),
      )
    } finally {
      setPendingGroceryItemIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(item.id)
        return nextIds
      })
    }
  }

  async function refreshGroceryList() {
    const groceryList = await groceryApi.getCurrent()
    setGroceryItems(sortGroceryItems(groceryList.items))
  }

  async function signOut() {
    try {
      await authApi.signOut()
    } finally {
      setCurrentUser(null)
      clearPlannerState()
      setStatusMessage('')
    }
  }

  function clearPlannerState() {
    setMeals([])
    setPlannedMeals({})
    setGroceryItems([])
    setPendingGroceryItemIds(new Set())
    setIsWeekPlanSaving(false)
    setIsAddingGroceryItem(false)
  }

  if (isAuthLoading) {
    return <SignInPage statusMessage="Checking your sign-in status..." />
  }

  if (!currentUser) {
    return (
      <SignInPage
        statusMessage={
          getInviteTokenFromPath()
            ? statusMessage || 'Sign in with Google to join this household.'
            : statusMessage || undefined
        }
      />
    )
  }

  return (
    <AppShell
      activePage={activePage}
      currentUser={currentUser}
      onNavigate={setActivePage}
      onSignOut={signOut}
    >
      {statusMessage && (
        <div className="mb-5 rounded-xl border border-marigold/30 bg-marigold/10 px-4 py-3 text-sm text-ink">
          {statusMessage}
        </div>
      )}

      {activePage === 'week' && (
        <WeekViewPage
          availableMeals={meals}
          plannedMeals={plannedMeals}
          onAssignMeal={assignMeal}
          onCreateAndAssignMeal={createAndAssignMeal}
          onClearMeal={clearMeal}
          onEditMeal={editMealFromPlanner}
          isSaving={isWeekPlanSaving}
        />
      )}
      {activePage === 'meals' && (
        <MealsPage
          meals={meals}
          onCreateMeal={createMeal}
          onUpdateMeal={updateMeal}
          onDeleteMeal={deleteMeal}
          editMealId={pendingEditMealId}
          onEditMealHandled={() => setPendingEditMealId(null)}
        />
      )}
      {activePage === 'grocery' && (
        <GroceryPage
          groceryItems={groceryItems}
          generatedItemCount={
            groceryItems.filter((item) => !item.isManuallyAdded).length
          }
          manualItemCount={groceryItems.filter((item) => item.isManuallyAdded).length}
          onAddManualItem={addManualGroceryItem}
          onToggleItem={toggleGroceryItem}
          onAdjustItemQuantity={adjustGroceryItemQuantity}
          onRemoveItem={removeGroceryItem}
          isAddingItem={isAddingGroceryItem}
          pendingItemIds={pendingGroceryItemIds}
        />
      )}
      {activePage === 'household' && <HouseholdPage />}
    </AppShell>
  )
}

function getInviteTokenFromPath() {
  const match = window.location.pathname.match(/^\/invite\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

export default App
