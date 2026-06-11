namespace FamilyPlanner.Api.DTOs;

public class HouseholdResponseDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string CurrentUserRole { get; set; }
    public List<HouseholdMemberResponseDto> Members { get; set; } = [];
}
