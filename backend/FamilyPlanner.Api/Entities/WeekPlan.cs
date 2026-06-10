namespace FamilyPlanner.Api.Entities;

public class WeekPlan
{
    public int Id { get; set; }
    public int HouseholdId { get; set; }
    public Household Household { get; set; } = null!;
    public DateOnly WeekStartDate { get; set; }
    public string? Notes { get; set; }
    public List<PlannedMeal> PlannedMeals { get; set; } = [];
    public List<GroceryItem> GroceryItems { get; set; } = [];
}
