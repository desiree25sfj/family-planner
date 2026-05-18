namespace FamilyPlanner.Api.Entities;

public class WeekPlan
{
    public int Id { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public string? Notes { get; set; }
    public List<PlannedDinner> PlannedDinners { get; set; } = [];
    public List<GroceryItem> GroceryItems { get; set; } = [];
}
