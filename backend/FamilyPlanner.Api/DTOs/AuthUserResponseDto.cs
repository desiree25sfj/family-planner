namespace FamilyPlanner.Api.DTOs;

public class AuthUserResponseDto
{
    public int Id { get; set; }
    public int HouseholdId { get; set; }
    public required string Email { get; set; }
    public required string DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
}
