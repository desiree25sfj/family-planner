namespace FamilyPlanner.Api.DTOs;

public class HouseholdMemberResponseDto
{
    public int UserId { get; set; }
    public required string Email { get; set; }
    public required string DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public required string Role { get; set; }
    public DateTime JoinedAtUtc { get; set; }
}
