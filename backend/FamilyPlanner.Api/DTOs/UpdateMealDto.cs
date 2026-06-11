using System.ComponentModel.DataAnnotations;

namespace FamilyPlanner.Api.DTOs;

public class UpdateMealDto
{
    [Required]
    [StringLength(120, MinimumLength = 1)]
    [RegularExpression(@"\S+", ErrorMessage = "Meal name is required.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? RecipeInstructions { get; set; }

    public List<string>? Ingredients { get; set; } = [];
}
