using System.ComponentModel.DataAnnotations;

namespace FamilyPlanner.Api.DTOs;

public class CreateMealDto
{
    [Required]
    [StringLength(120, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? RecipeInstructions { get; set; }

    public List<string> Ingredients { get; set; } = [];
}
