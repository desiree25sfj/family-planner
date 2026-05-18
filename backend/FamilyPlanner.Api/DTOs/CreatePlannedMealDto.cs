using System.ComponentModel.DataAnnotations;

namespace FamilyPlanner.Api.DTOs;

public class CreatePlannedMealDto
{
    public DayOfWeek DayOfWeek { get; set; }

    [Range(1, int.MaxValue)]
    public int MealId { get; set; }

    [StringLength(80)]
    public string? AssignedFamilyMemberName { get; set; }
}
