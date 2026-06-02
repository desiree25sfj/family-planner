using FamilyPlanner.Api.Common;
using FamilyPlanner.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyPlanner.Api.Data;

public static class DevelopmentDataSeeder
{
    private const string StarterWeekPlanNotes = "Starter week plan for first-user testing.";

    public static async Task SeedAsync(FamilyPlannerDbContext dbContext)
    {
        if (!await dbContext.FamilyMembers.AnyAsync())
        {
            dbContext.FamilyMembers.AddRange(
                new FamilyMember { Name = "Alex", ColorHex = "#2563eb", DisplayOrder = 1 },
                new FamilyMember { Name = "Sam", ColorHex = "#16a34a", DisplayOrder = 2 },
                new FamilyMember { Name = "Taylor", ColorHex = "#dc2626", DisplayOrder = 3 });
        }

        var starterMeals = GetStarterMeals();
        var existingMealNames = await dbContext.Meals
            .Select(meal => meal.Name)
            .ToListAsync();
        var existingMealNamesSet = existingMealNames.ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var starterMeal in starterMeals.Where(meal => !existingMealNamesSet.Contains(meal.Name)))
        {
            dbContext.Meals.Add(ToMeal(starterMeal));
        }

        await dbContext.SaveChangesAsync();

        var weekStartDate = WeekDateHelper.GetCurrentWeekStartDate();
        var currentWeekPlan = await dbContext.WeekPlans
            .Include(plan => plan.PlannedMeals)
            .Include(plan => plan.GroceryItems)
            .FirstOrDefaultAsync(plan => plan.WeekStartDate == weekStartDate);

        if (currentWeekPlan is null)
        {
            currentWeekPlan = new WeekPlan
            {
                WeekStartDate = weekStartDate,
                Notes = StarterWeekPlanNotes
            };
            dbContext.WeekPlans.Add(currentWeekPlan);
        }

        // Seed a full week only for empty or old thin starter data. Once a tester
        // has a richer plan, startup should not quietly re-add dinners they removed.
        if (currentWeekPlan.PlannedMeals.Count < 5)
        {
            await AddStarterWeekPlanAsync(dbContext, currentWeekPlan);
            AddStarterGroceryItems(currentWeekPlan);
            currentWeekPlan.Notes ??= StarterWeekPlanNotes;
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task AddStarterWeekPlanAsync(FamilyPlannerDbContext dbContext, WeekPlan weekPlan)
    {
        var starterMealNames = StarterWeekPlan
            .Select(plan => plan.MealName)
            .ToList();
        var mealsByName = await dbContext.Meals
            .Where(meal => starterMealNames.Contains(meal.Name))
            .ToDictionaryAsync(meal => meal.Name, StringComparer.OrdinalIgnoreCase);
        var plannedDays = weekPlan.PlannedMeals
            .Select(plannedMeal => plannedMeal.DayOfWeek)
            .ToHashSet();

        foreach (var starterPlan in StarterWeekPlan)
        {
            if (plannedDays.Contains(starterPlan.DayOfWeek) ||
                !mealsByName.TryGetValue(starterPlan.MealName, out var meal))
            {
                continue;
            }

            weekPlan.PlannedMeals.Add(new PlannedMeal
            {
                DayOfWeek = starterPlan.DayOfWeek,
                MealId = meal.Id,
                AssignedFamilyMemberName = starterPlan.AssignedFamilyMemberName
            });
        }
    }

    private static void AddStarterGroceryItems(WeekPlan weekPlan)
    {
        var manualItemNames = weekPlan.GroceryItems
            .Where(item => item.IsManuallyAdded)
            .Select(item => item.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var itemName in new[] { "Milk", "Coffee", "Apples" })
        {
            if (manualItemNames.Contains(itemName))
            {
                continue;
            }

            weekPlan.GroceryItems.Add(new GroceryItem
            {
                WeekPlanId = weekPlan.Id,
                Name = itemName,
                IsManuallyAdded = true
            });
        }
    }

    private static Meal ToMeal(StarterMeal starterMeal)
    {
        return new Meal
        {
            Name = starterMeal.Name,
            RecipeInstructions = starterMeal.RecipeInstructions,
            Ingredients = starterMeal.Ingredients
                .Select(ingredient => new MealIngredient { Name = ingredient })
                .ToList()
        };
    }

    private static List<StarterMeal> GetStarterMeals()
    {
        return
        [
            new StarterMeal(
                "Taco Bowls",
                "Cook rice, warm black beans with taco seasoning, chop vegetables, and serve with salsa and yogurt.",
                ["Rice", "Black beans", "Cherry tomatoes", "Corn", "Salsa", "Greek yogurt"]),
            new StarterMeal(
                "Pasta with Tomato Sauce",
                "Boil pasta, simmer tomato sauce with garlic, and finish with parmesan and basil.",
                ["Pasta", "Tomato sauce", "Garlic", "Parmesan", "Basil"]),
            new StarterMeal(
                "Sheet Pan Salmon",
                "Bake salmon with potatoes and broccoli until the fish flakes easily.",
                ["Salmon", "Potatoes", "Broccoli", "Lemon", "Olive oil"]),
            new StarterMeal(
                "Chicken Stir-Fry",
                "Cook chicken strips, add vegetables, toss with soy sauce, and serve over rice.",
                ["Chicken breast", "Rice", "Bell peppers", "Carrots", "Soy sauce", "Ginger"]),
            new StarterMeal(
                "Vegetable Chili",
                "Simmer beans, tomatoes, vegetables, and spices until thick. Serve with toppings.",
                ["Kidney beans", "Black beans", "Crushed tomatoes", "Bell peppers", "Onion", "Cheddar"]),
            new StarterMeal(
                "Turkey Meatballs with Couscous",
                "Bake turkey meatballs and serve with couscous, cucumber salad, and yogurt sauce.",
                ["Ground turkey", "Couscous", "Cucumber", "Greek yogurt", "Parsley"]),
            new StarterMeal(
                "Baked Potato Bar",
                "Bake potatoes and set out toppings so everyone can build their own dinner.",
                ["Potatoes", "Cheddar", "Sour cream", "Broccoli", "Green onions"]),
            new StarterMeal(
                "Breakfast-for-Dinner Frittata",
                "Bake eggs with vegetables and cheese, then serve with toast and fruit.",
                ["Eggs", "Spinach", "Cheddar", "Bread", "Mixed berries"])
        ];
    }

    private static readonly StarterWeekPlanItem[] StarterWeekPlan =
    [
        new(DayOfWeek.Monday, "Chicken Stir-Fry", "Alex"),
        new(DayOfWeek.Tuesday, "Taco Bowls", "Sam"),
        new(DayOfWeek.Wednesday, "Pasta with Tomato Sauce", "Taylor"),
        new(DayOfWeek.Thursday, "Vegetable Chili", "Alex"),
        new(DayOfWeek.Friday, "Sheet Pan Salmon", "Sam"),
        new(DayOfWeek.Saturday, "Baked Potato Bar", null),
        new(DayOfWeek.Sunday, "Breakfast-for-Dinner Frittata", null)
    ];

    private record StarterMeal(string Name, string RecipeInstructions, string[] Ingredients);

    private record StarterWeekPlanItem(
        DayOfWeek DayOfWeek,
        string MealName,
        string? AssignedFamilyMemberName);
}
