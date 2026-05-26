using FamilyPlanner.Api.Common;
using FamilyPlanner.Api.Data;
using FamilyPlanner.Api.DTOs;
using FamilyPlanner.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyPlanner.Api.Services;

public class GroceryListService(FamilyPlannerDbContext dbContext)
{
    public async Task<GroceryListResponseDto> GetCurrentAsync()
    {
        var weekPlan = await GetOrCreateCurrentWeekPlanAsync();
        await SyncGeneratedItemsAsync(weekPlan);

        return ToListResponseDto(weekPlan);
    }

    public async Task<GroceryItemResponseDto> AddManualItemAsync(CreateGroceryItemDto dto)
    {
        var weekPlan = await GetOrCreateCurrentWeekPlanAsync();

        var item = new GroceryItem
        {
            WeekPlanId = weekPlan.Id,
            Name = NormalizeRequiredText(dto.Name),
            Quantity = NormalizeOptionalText(dto.Quantity),
            Unit = NormalizeOptionalText(dto.Unit),
            Notes = NormalizeOptionalText(dto.Notes),
            IsManuallyAdded = true
        };

        dbContext.GroceryItems.Add(item);
        await dbContext.SaveChangesAsync();

        return ToItemResponseDto(item);
    }

    public async Task<GroceryItemResponseDto?> UpdateCurrentItemAsync(int id, UpdateGroceryItemDto dto)
    {
        var weekStartDate = WeekDateHelper.GetCurrentWeekStartDate();
        var item = await dbContext.GroceryItems
            .Include(groceryItem => groceryItem.WeekPlan)
            .FirstOrDefaultAsync(groceryItem =>
                groceryItem.Id == id &&
                groceryItem.WeekPlan.WeekStartDate == weekStartDate);

        if (item is null)
        {
            return null;
        }

        var name = NormalizeRequiredText(dto.Name);
        var quantity = NormalizeOptionalText(dto.Quantity);
        var unit = NormalizeOptionalText(dto.Unit);
        var notes = NormalizeOptionalText(dto.Notes);
        var contentChanged =
            !string.Equals(item.Name, name, StringComparison.Ordinal) ||
            !string.Equals(item.Quantity, quantity, StringComparison.Ordinal) ||
            !string.Equals(item.Unit, unit, StringComparison.Ordinal) ||
            !string.Equals(item.Notes, notes, StringComparison.Ordinal);

        item.Name = name;
        item.Quantity = quantity;
        item.Unit = unit;
        item.Notes = notes;
        item.IsChecked = dto.IsCompleted;

        // Editing a generated line is treated as a user override. This keeps the
        // grocery list from "correcting" a human's wording on the next refresh.
        if (contentChanged)
        {
            item.IsManuallyAdded = true;
            item.SourceMealId = null;
        }

        await dbContext.SaveChangesAsync();

        return ToItemResponseDto(item);
    }

    public async Task<bool> DeleteCurrentItemAsync(int id)
    {
        var weekStartDate = WeekDateHelper.GetCurrentWeekStartDate();
        var item = await dbContext.GroceryItems
            .Include(groceryItem => groceryItem.WeekPlan)
            .FirstOrDefaultAsync(groceryItem =>
                groceryItem.Id == id &&
                groceryItem.WeekPlan.WeekStartDate == weekStartDate);

        if (item is null)
        {
            return false;
        }

        if (item.IsManuallyAdded)
        {
            dbContext.GroceryItems.Remove(item);
        }
        else
        {
            // Generated items are hidden instead of deleted so the next grocery
            // list sync does not immediately recreate something the user removed.
            item.IsHidden = true;
        }

        await dbContext.SaveChangesAsync();

        return true;
    }

    private async Task SyncGeneratedItemsAsync(WeekPlan weekPlan)
    {
        var generatedIngredients = weekPlan.PlannedMeals
            .SelectMany(plannedMeal => plannedMeal.Meal.Ingredients.Select(ingredient => new GeneratedIngredient(
                NormalizeRequiredText(ingredient.Name),
                NormalizeOptionalText(ingredient.Quantity),
                NormalizeOptionalText(ingredient.Unit),
                plannedMeal.MealId)))
            .Where(ingredient => !string.IsNullOrWhiteSpace(ingredient.Name))
            .GroupBy(ingredient => ingredient.Name, StringComparer.OrdinalIgnoreCase)
            .Select(group => new GeneratedIngredient(
                group.First().Name,
                CombineDistinctText(group.Select(ingredient => ingredient.Quantity)),
                CombineDistinctText(group.Select(ingredient => ingredient.Unit)),
                group.First().SourceMealId))
            .ToList();

        var generatedItems = weekPlan.GroceryItems
            .Where(item => !item.IsManuallyAdded)
            .ToList();

        var generatedNames = generatedIngredients
            .Select(ingredient => ingredient.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Generated rows mirror current planned meals. Manual rows are never
        // deleted here; user-entered shopping notes should survive meal changes.
        foreach (var staleItem in generatedItems.Where(item => !generatedNames.Contains(item.Name)))
        {
            dbContext.GroceryItems.Remove(staleItem);
        }

        foreach (var generatedIngredient in generatedIngredients)
        {
            var existingItem = generatedItems.FirstOrDefault(item =>
                string.Equals(item.Name, generatedIngredient.Name, StringComparison.OrdinalIgnoreCase));

            if (existingItem is null)
            {
                weekPlan.GroceryItems.Add(new GroceryItem
                {
                    WeekPlanId = weekPlan.Id,
                    SourceMealId = generatedIngredient.SourceMealId,
                    Name = generatedIngredient.Name,
                    Quantity = generatedIngredient.Quantity,
                    Unit = generatedIngredient.Unit,
                    IsManuallyAdded = false
                });

                continue;
            }

            existingItem.Quantity = generatedIngredient.Quantity;
            existingItem.Unit = generatedIngredient.Unit;
            existingItem.SourceMealId = generatedIngredient.SourceMealId;
        }

        await dbContext.SaveChangesAsync();
    }

    private async Task<WeekPlan> GetOrCreateCurrentWeekPlanAsync()
    {
        var weekStartDate = WeekDateHelper.GetCurrentWeekStartDate();
        var weekPlan = await dbContext.WeekPlans
            .Include(plan => plan.PlannedMeals)
            .ThenInclude(plannedMeal => plannedMeal.Meal)
            .ThenInclude(meal => meal.Ingredients)
            .Include(plan => plan.GroceryItems)
            .FirstOrDefaultAsync(plan => plan.WeekStartDate == weekStartDate);

        if (weekPlan is not null)
        {
            return weekPlan;
        }

        weekPlan = new WeekPlan { WeekStartDate = weekStartDate };

        dbContext.WeekPlans.Add(weekPlan);
        await dbContext.SaveChangesAsync();

        return weekPlan;
    }

    private static GroceryListResponseDto ToListResponseDto(WeekPlan weekPlan)
    {
        return new GroceryListResponseDto
        {
            WeekPlanId = weekPlan.Id,
            WeekStartDate = weekPlan.WeekStartDate,
            Items = weekPlan.GroceryItems
                .Where(item => !item.IsHidden)
                .OrderBy(item => item.IsChecked)
                .ThenBy(item => item.Name)
                .Select(ToItemResponseDto)
                .ToList()
        };
    }

    private static GroceryItemResponseDto ToItemResponseDto(GroceryItem item)
    {
        return new GroceryItemResponseDto
        {
            Id = item.Id,
            Name = item.Name,
            Quantity = item.Quantity,
            Unit = item.Unit,
            Notes = item.Notes,
            IsCompleted = item.IsChecked,
            IsManuallyAdded = item.IsManuallyAdded
        };
    }

    private static string NormalizeRequiredText(string value)
    {
        return value.Trim();
    }

    private static string? NormalizeOptionalText(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }

    private static string? CombineDistinctText(IEnumerable<string?> values)
    {
        var distinctValues = values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return distinctValues.Count == 0 ? null : string.Join(", ", distinctValues);
    }

    private record GeneratedIngredient(string Name, string? Quantity, string? Unit, int SourceMealId);
}
