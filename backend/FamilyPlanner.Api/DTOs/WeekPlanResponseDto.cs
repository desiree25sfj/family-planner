namespace FamilyPlanner.Api.DTOs;

public class WeekPlanResponseDto
{
    public int Id { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public List<DayPlanResponseDto> Days { get; set; } = [];
}
