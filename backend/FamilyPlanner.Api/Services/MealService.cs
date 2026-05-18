using FamilyPlanner.Api.Data;
using FamilyPlanner.Api.DTOs;
using FamilyPlanner.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyPlanner.Api.Services;

public class MealService(FamilyPlannerDbContext dbContext)
{
    public async Task<IReadOnlyList<MealResponseDto>> GetAllAsync()
    {
        return await dbContext.Meals
            .AsNoTracking()
            .Include(meal => meal.Ingredients)
            .OrderBy(meal => meal.Name)
            .Select(meal => ToResponseDto(meal))
            .ToListAsync();
    }

    public async Task<MealResponseDto?> GetByIdAsync(int id)
    {
        var meal = await dbContext.Meals
            .AsNoTracking()
            .Include(meal => meal.Ingredients)
            .FirstOrDefaultAsync(meal => meal.Id == id);

        return meal is null ? null : ToResponseDto(meal);
    }

    public async Task<CreateMealResult> CreateAsync(CreateMealDto dto)
    {
        var name = NormalizeRequiredText(dto.Name);

        if (await MealNameExistsAsync(name))
        {
            return new CreateMealResult(null, "A meal with that name already exists.");
        }

        var meal = new Meal
        {
            Name = name,
            RecipeInstructions = NormalizeOptionalText(dto.RecipeInstructions),
            Ingredients = ToIngredientEntities(dto.Ingredients)
        };

        dbContext.Meals.Add(meal);
        await dbContext.SaveChangesAsync();

        return new CreateMealResult(ToResponseDto(meal), null);
    }

    public async Task<UpdateMealResult> UpdateAsync(int id, UpdateMealDto dto)
    {
        var meal = await dbContext.Meals
            .Include(meal => meal.Ingredients)
            .FirstOrDefaultAsync(meal => meal.Id == id);

        if (meal is null)
        {
            return new UpdateMealResult(null, false, null);
        }

        var name = NormalizeRequiredText(dto.Name);

        if (await MealNameExistsAsync(name, id))
        {
            return new UpdateMealResult(null, true, "A meal with that name already exists.");
        }

        meal.Name = name;
        meal.RecipeInstructions = NormalizeOptionalText(dto.RecipeInstructions);
        meal.UpdatedAtUtc = DateTime.UtcNow;

        // For the MVP, ingredients are edited as one simple list. Replacing the
        // child rows keeps the code obvious and avoids premature diff logic.
        meal.Ingredients.Clear();
        meal.Ingredients.AddRange(ToIngredientEntities(dto.Ingredients));

        await dbContext.SaveChangesAsync();

        return new UpdateMealResult(ToResponseDto(meal), true, null);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var meal = await dbContext.Meals.FindAsync(id);

        if (meal is null)
        {
            return false;
        }

        dbContext.Meals.Remove(meal);
        await dbContext.SaveChangesAsync();

        return true;
    }

    private async Task<bool> MealNameExistsAsync(string name, int? exceptMealId = null)
    {
        var normalizedName = name.ToLower();

        return await dbContext.Meals.AnyAsync(meal =>
            meal.Name.ToLower() == normalizedName &&
            (!exceptMealId.HasValue || meal.Id != exceptMealId.Value));
    }

    private static MealResponseDto ToResponseDto(Meal meal)
    {
        return new MealResponseDto
        {
            Id = meal.Id,
            Name = meal.Name,
            RecipeInstructions = meal.RecipeInstructions,
            Ingredients = meal.Ingredients
                .OrderBy(ingredient => ingredient.Id)
                .Select(ingredient => ingredient.Name)
                .ToList()
        };
    }

    private static List<MealIngredient> ToIngredientEntities(IEnumerable<string> ingredients)
    {
        return ingredients
            .Select(NormalizeOptionalText)
            .Where(ingredient => ingredient is not null)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(ingredient => new MealIngredient { Name = ingredient! })
            .ToList();
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
}

public record CreateMealResult(MealResponseDto? Meal, string? Error);

public record UpdateMealResult(MealResponseDto? Meal, bool Found, string? Error);
