namespace FamilyPlanner.Api.Entities;

public class PlannedDinner
{
    public int Id { get; set; }
    public int WeekPlanId { get; set; }
    public WeekPlan WeekPlan { get; set; } = null!;
    public DayOfWeek DayOfWeek { get; set; }
    public int? MealId { get; set; }
    public Meal? Meal { get; set; }
    public string? CustomDinnerName { get; set; }
    public string? Notes { get; set; }
}
