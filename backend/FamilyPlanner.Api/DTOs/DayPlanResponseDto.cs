namespace FamilyPlanner.Api.DTOs;

public class DayPlanResponseDto
{
    public DayOfWeek DayOfWeek { get; set; }
    public DateOnly Date { get; set; }
    public PlannedMealResponseDto? PlannedMeal { get; set; }
}
