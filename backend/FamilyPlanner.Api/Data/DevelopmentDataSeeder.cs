using FamilyPlanner.Api.Common;
using FamilyPlanner.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyPlanner.Api.Data;

public static class DevelopmentDataSeeder
{
    public static async Task SeedAsync(FamilyPlannerDbContext dbContext)
    {
        if (!await dbContext.FamilyMembers.AnyAsync())
        {
            dbContext.FamilyMembers.AddRange(
                new FamilyMember { Name = "Alex", ColorHex = "#2563eb", DisplayOrder = 1 },
                new FamilyMember { Name = "Sam", ColorHex = "#16a34a", DisplayOrder = 2 },
                new FamilyMember { Name = "Taylor", ColorHex = "#dc2626", DisplayOrder = 3 });
        }

        if (!await dbContext.Meals.AnyAsync())
        {
            dbContext.Meals.AddRange(
                new Meal
                {
                    Name = "Taco Bowls",
                    RecipeInstructions = "Cook rice, season beans, chop vegetables, and serve with salsa.",
                    Ingredients =
                    [
                        new MealIngredient { Name = "Rice" },
                        new MealIngredient { Name = "Black beans" },
                        new MealIngredient { Name = "Tomatoes" },
                        new MealIngredient { Name = "Salsa" }
                    ]
                },
                new Meal
                {
                    Name = "Pasta with Tomato Sauce",
                    RecipeInstructions = "Boil pasta, warm sauce, and finish with grated cheese.",
                    Ingredients =
                    [
                        new MealIngredient { Name = "Pasta" },
                        new MealIngredient { Name = "Tomato sauce" },
                        new MealIngredient { Name = "Parmesan" }
                    ]
                },
                new Meal
                {
                    Name = "Sheet Pan Salmon",
                    RecipeInstructions = "Bake salmon and vegetables together until cooked through.",
                    Ingredients =
                    [
                        new MealIngredient { Name = "Salmon" },
                        new MealIngredient { Name = "Potatoes" },
                        new MealIngredient { Name = "Broccoli" },
                        new MealIngredient { Name = "Lemon" }
                    ]
                });
        }

        await dbContext.SaveChangesAsync();

        var weekStartDate = WeekDateHelper.GetCurrentWeekStartDate();
        var currentWeekPlan = await dbContext.WeekPlans
            .Include(plan => plan.PlannedMeals)
            .FirstOrDefaultAsync(plan => plan.WeekStartDate == weekStartDate);

        if (currentWeekPlan is null)
        {
            currentWeekPlan = new WeekPlan { WeekStartDate = weekStartDate };
            dbContext.WeekPlans.Add(currentWeekPlan);
        }

        if (currentWeekPlan.PlannedMeals.Count == 0)
        {
            var meals = await dbContext.Meals.OrderBy(meal => meal.Id).Take(3).ToListAsync();

            if (meals.Count >= 3)
            {
                currentWeekPlan.PlannedMeals.AddRange(
                [
                    new PlannedMeal { DayOfWeek = DayOfWeek.Monday, MealId = meals[0].Id, AssignedFamilyMemberName = "Alex" },
                    new PlannedMeal { DayOfWeek = DayOfWeek.Wednesday, MealId = meals[1].Id, AssignedFamilyMemberName = "Sam" },
                    new PlannedMeal { DayOfWeek = DayOfWeek.Friday, MealId = meals[2].Id, AssignedFamilyMemberName = "Taylor" }
                ]);
            }
        }

        await dbContext.SaveChangesAsync();
    }
}
