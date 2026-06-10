namespace FamilyPlanner.Api.Entities;

public class Household
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
    public List<User> Users { get; set; } = [];
    public List<Meal> Meals { get; set; } = [];
    public List<WeekPlan> WeekPlans { get; set; } = [];
    public List<FamilyMember> FamilyMembers { get; set; } = [];
}
