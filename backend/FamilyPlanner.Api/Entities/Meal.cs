namespace FamilyPlanner.Api.Entities;

public class Meal
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? RecipeInstructions { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
    public List<MealIngredient> Ingredients { get; set; } = [];
    public List<PlannedDinner> PlannedDinners { get; set; } = [];
}
