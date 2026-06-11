namespace FamilyPlanner.Api.Entities;

public class Meal
{
    public int Id { get; set; }
    public int HouseholdId { get; set; }
    public Household Household { get; set; } = null!;
    public required string Name { get; set; }
    public string? RecipeInstructions { get; set; }
    public bool IsDraft { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
    public List<MealIngredient> Ingredients { get; set; } = [];
    public List<PlannedMeal> PlannedMeals { get; set; } = [];
}
