namespace FamilyPlanner.Api.Entities;

public class GroceryItem
{
    public int Id { get; set; }
    public int WeekPlanId { get; set; }
    public WeekPlan WeekPlan { get; set; } = null!;
    public int? SourceMealId { get; set; }
    public Meal? SourceMeal { get; set; }
    public required string Name { get; set; }
    public string? Quantity { get; set; }
    public string? Unit { get; set; }
    public string? Notes { get; set; }
    public bool IsChecked { get; set; }
    public bool IsManuallyAdded { get; set; }
    public bool IsHidden { get; set; }
}
