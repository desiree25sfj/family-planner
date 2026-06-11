namespace FamilyPlanner.Api.Entities;

public class HouseholdMember
{
    public int Id { get; set; }
    public int HouseholdId { get; set; }
    public Household Household { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public HouseholdRole Role { get; set; } = HouseholdRole.Member;
    public DateTime JoinedAtUtc { get; set; } = DateTime.UtcNow;
}
