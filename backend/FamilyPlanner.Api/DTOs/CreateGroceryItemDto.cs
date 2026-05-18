using System.ComponentModel.DataAnnotations;

namespace FamilyPlanner.Api.DTOs;

public class CreateGroceryItemDto
{
    [Required]
    [StringLength(120, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(40)]
    public string? Quantity { get; set; }

    [StringLength(40)]
    public string? Unit { get; set; }

    [StringLength(250)]
    public string? Notes { get; set; }
}
