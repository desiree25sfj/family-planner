namespace FamilyPlanner.Api.Entities;

public class MealIngredient
{
    public int Id { get; set; }
    public int MealId { get; set; }
    public Meal Meal { get; set; } = null!;
    public required string Name { get; set; }
    public string? Quantity { get; set; }
    public string? Unit { get; set; }
    public string? Notes { get; set; }
}
