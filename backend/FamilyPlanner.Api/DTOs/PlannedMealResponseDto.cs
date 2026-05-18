namespace FamilyPlanner.Api.DTOs;

public class PlannedMealResponseDto
{
    public int Id { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public int MealId { get; set; }
    public required string MealName { get; set; }
    public string? AssignedFamilyMemberName { get; set; }
}
