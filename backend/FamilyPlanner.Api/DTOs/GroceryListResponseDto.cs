namespace FamilyPlanner.Api.DTOs;

public class GroceryListResponseDto
{
    public int WeekPlanId { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public List<GroceryItemResponseDto> Items { get; set; } = [];
}
