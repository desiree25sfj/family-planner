using FamilyPlanner.Api.Data;
using FamilyPlanner.Api.DTOs;
using FamilyPlanner.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyPlanner.Api.Services;

public class WeekPlanService(FamilyPlannerDbContext dbContext)
{
    public async Task<WeekPlanResponseDto> GetCurrentAsync()
    {
        var weekPlan = await GetOrCreateCurrentWeekPlanAsync();
        return ToResponseDto(weekPlan);
    }

    public async Task<PlannedMealOperationResult> CreateCurrentMealAsync(CreatePlannedMealDto dto)
    {
        if (!Enum.IsDefined(dto.DayOfWeek))
        {
            return PlannedMealOperationResult.Validation("DayOfWeek is not valid.");
        }

        if (!await dbContext.Meals.AnyAsync(meal => meal.Id == dto.MealId))
        {
            return PlannedMealOperationResult.Validation("MealId does not match an existing meal.");
        }

        var weekPlan = await GetOrCreateCurrentWeekPlanAsync();

        if (weekPlan.PlannedMeals.Any(meal => meal.DayOfWeek == dto.DayOfWeek))
        {
            return PlannedMealOperationResult.Conflict("That day already has a planned meal.");
        }

        var plannedMeal = new PlannedMeal
        {
            WeekPlanId = weekPlan.Id,
            DayOfWeek = dto.DayOfWeek,
            MealId = dto.MealId,
            AssignedFamilyMemberName = NormalizeOptionalText(dto.AssignedFamilyMemberName)
        };

        dbContext.PlannedMeals.Add(plannedMeal);
        await dbContext.SaveChangesAsync();

        await dbContext.Entry(plannedMeal).Reference(meal => meal.Meal).LoadAsync();

        return PlannedMealOperationResult.Success(ToResponseDto(plannedMeal));
    }

    public async Task<PlannedMealOperationResult> UpdateCurrentMealAsync(int id, UpdatePlannedMealDto dto)
    {
        if (!Enum.IsDefined(dto.DayOfWeek))
        {
            return PlannedMealOperationResult.Validation("DayOfWeek is not valid.");
        }

        if (!await dbContext.Meals.AnyAsync(meal => meal.Id == dto.MealId))
        {
            return PlannedMealOperationResult.Validation("MealId does not match an existing meal.");
        }

        var weekStartDate = GetCurrentWeekStartDate();
        var plannedMeal = await dbContext.PlannedMeals
            .Include(meal => meal.WeekPlan)
            .Include(meal => meal.Meal)
            .FirstOrDefaultAsync(meal => meal.Id == id && meal.WeekPlan.WeekStartDate == weekStartDate);

        if (plannedMeal is null)
        {
            return PlannedMealOperationResult.NotFound();
        }

        var dayAlreadyUsed = await dbContext.PlannedMeals.AnyAsync(meal =>
            meal.WeekPlanId == plannedMeal.WeekPlanId &&
            meal.Id != id &&
            meal.DayOfWeek == dto.DayOfWeek);

        if (dayAlreadyUsed)
        {
            return PlannedMealOperationResult.Conflict("That day already has a planned meal.");
        }

        plannedMeal.DayOfWeek = dto.DayOfWeek;
        plannedMeal.MealId = dto.MealId;
        plannedMeal.AssignedFamilyMemberName = NormalizeOptionalText(dto.AssignedFamilyMemberName);

        await dbContext.SaveChangesAsync();
        await dbContext.Entry(plannedMeal).Reference(meal => meal.Meal).LoadAsync();

        return PlannedMealOperationResult.Success(ToResponseDto(plannedMeal));
    }

    public async Task<bool> DeleteCurrentMealAsync(int id)
    {
        var weekStartDate = GetCurrentWeekStartDate();
        var plannedMeal = await dbContext.PlannedMeals
            .Include(meal => meal.WeekPlan)
            .FirstOrDefaultAsync(meal => meal.Id == id && meal.WeekPlan.WeekStartDate == weekStartDate);

        if (plannedMeal is null)
        {
            return false;
        }

        dbContext.PlannedMeals.Remove(plannedMeal);
        await dbContext.SaveChangesAsync();

        return true;
    }

    private async Task<WeekPlan> GetOrCreateCurrentWeekPlanAsync()
    {
        var weekStartDate = GetCurrentWeekStartDate();
        var weekPlan = await dbContext.WeekPlans
            .Include(plan => plan.PlannedMeals)
            .ThenInclude(plannedMeal => plannedMeal.Meal)
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

    private static WeekPlanResponseDto ToResponseDto(WeekPlan weekPlan)
    {
        var plannedMealsByDay = weekPlan.PlannedMeals.ToDictionary(meal => meal.DayOfWeek);
        var days = new List<DayPlanResponseDto>();

        for (var offset = 0; offset < 7; offset++)
        {
            var date = weekPlan.WeekStartDate.AddDays(offset);
            var dayOfWeek = date.DayOfWeek;
            plannedMealsByDay.TryGetValue(dayOfWeek, out var plannedMeal);

            days.Add(new DayPlanResponseDto
            {
                DayOfWeek = dayOfWeek,
                Date = date,
                PlannedMeal = plannedMeal is null ? null : ToResponseDto(plannedMeal)
            });
        }

        return new WeekPlanResponseDto
        {
            Id = weekPlan.Id,
            WeekStartDate = weekPlan.WeekStartDate,
            Days = days
        };
    }

    private static PlannedMealResponseDto ToResponseDto(PlannedMeal plannedMeal)
    {
        return new PlannedMealResponseDto
        {
            Id = plannedMeal.Id,
            DayOfWeek = plannedMeal.DayOfWeek,
            MealId = plannedMeal.MealId,
            MealName = plannedMeal.Meal.Name,
            AssignedFamilyMemberName = plannedMeal.AssignedFamilyMemberName
        };
    }

    private static DateOnly GetCurrentWeekStartDate()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var daysSinceMonday = ((int)today.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;

        return today.AddDays(-daysSinceMonday);
    }

    private static string? NormalizeOptionalText(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}

public record PlannedMealOperationResult(
    PlannedMealResponseDto? PlannedMeal,
    PlannedMealOperationStatus Status,
    string? Error)
{
    public static PlannedMealOperationResult Success(PlannedMealResponseDto plannedMeal)
    {
        return new PlannedMealOperationResult(plannedMeal, PlannedMealOperationStatus.Success, null);
    }

    public static PlannedMealOperationResult Validation(string error)
    {
        return new PlannedMealOperationResult(null, PlannedMealOperationStatus.ValidationError, error);
    }

    public static PlannedMealOperationResult Conflict(string error)
    {
        return new PlannedMealOperationResult(null, PlannedMealOperationStatus.Conflict, error);
    }

    public static PlannedMealOperationResult NotFound()
    {
        return new PlannedMealOperationResult(null, PlannedMealOperationStatus.NotFound, null);
    }
}

public enum PlannedMealOperationStatus
{
    Success,
    ValidationError,
    Conflict,
    NotFound
}
