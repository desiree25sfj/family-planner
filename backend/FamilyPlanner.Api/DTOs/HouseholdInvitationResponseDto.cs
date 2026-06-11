namespace FamilyPlanner.Api.DTOs;

public class HouseholdInvitationResponseDto
{
    public required string InviteUrl { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
}
