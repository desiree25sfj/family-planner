namespace FamilyPlanner.Api.Entities;

public class FamilyMember
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? ColorHex { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
