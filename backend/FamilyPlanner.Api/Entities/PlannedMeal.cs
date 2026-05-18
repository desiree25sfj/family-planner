namespace FamilyPlanner.Api.Entities;

public class PlannedMeal
{
    public int Id { get; set; }
    public int WeekPlanId { get; set; }
    public WeekPlan WeekPlan { get; set; } = null!;
    public DayOfWeek DayOfWeek { get; set; }
    public int MealId { get; set; }
    public Meal Meal { get; set; } = null!;
    public string? AssignedFamilyMemberName { get; set; }
}
