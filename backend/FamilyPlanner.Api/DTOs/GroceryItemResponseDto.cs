namespace FamilyPlanner.Api.DTOs;

public class GroceryItemResponseDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Quantity { get; set; }
    public string? Unit { get; set; }
    public string? Notes { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsManuallyAdded { get; set; }
}
