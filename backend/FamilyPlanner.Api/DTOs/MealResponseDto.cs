namespace FamilyPlanner.Api.DTOs;

public class MealResponseDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? RecipeInstructions { get; set; }
    public bool IsDraft { get; set; }
    public List<string> Ingredients { get; set; } = [];
}
