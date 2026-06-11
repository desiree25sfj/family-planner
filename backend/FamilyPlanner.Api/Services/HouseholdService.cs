using System.Security.Cryptography;
using System.Text;
using FamilyPlanner.Api.Data;
using FamilyPlanner.Api.DTOs;
using FamilyPlanner.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyPlanner.Api.Services;

public class HouseholdService(
    FamilyPlannerDbContext dbContext,
    CurrentHouseholdContext householdContext,
    IHttpContextAccessor httpContextAccessor)
{
    private static readonly TimeSpan InvitationLifetime = TimeSpan.FromDays(7);

    public async Task<HouseholdResponseDto?> GetCurrentAsync()
    {
        var userId = householdContext.UserId;
        var householdId = householdContext.HouseholdId;
        var membership = await GetMembershipAsync(userId, householdId);

        if (membership is null)
        {
            return null;
        }

        var household = await dbContext.Households
            .AsNoTracking()
            .Include(existingHousehold => existingHousehold.Members)
            .ThenInclude(member => member.User)
            .FirstOrDefaultAsync(existingHousehold => existingHousehold.Id == householdId);

        if (household is null)
        {
            return null;
        }

        return new HouseholdResponseDto
        {
            Id = household.Id,
            Name = household.Name,
            CurrentUserRole = membership.Role.ToString(),
            Members = household.Members
                .OrderByDescending(member => member.Role == HouseholdRole.Owner)
                .ThenBy(member => member.User.DisplayName)
                .Select(member => new HouseholdMemberResponseDto
                {
                    UserId = member.UserId,
                    Email = member.User.Email,
                    DisplayName = member.User.DisplayName,
                    AvatarUrl = member.User.AvatarUrl,
                    Role = member.Role.ToString(),
                    JoinedAtUtc = member.JoinedAtUtc
                })
                .ToList()
        };
    }

    public async Task<CreateHouseholdInvitationResult> CreateInvitationAsync()
    {
        var userId = householdContext.UserId;
        var householdId = householdContext.HouseholdId;
        var membership = await GetMembershipAsync(userId, householdId);

        if (membership?.Role != HouseholdRole.Owner)
        {
            return new CreateHouseholdInvitationResult(null, HouseholdInvitationStatus.Forbidden);
        }

        var token = CreateToken();
        var invitation = new HouseholdInvitation
        {
            HouseholdId = householdId,
            CreatedByUserId = userId,
            TokenHash = HashToken(token),
            ExpiresAtUtc = DateTime.UtcNow.Add(InvitationLifetime)
        };

        dbContext.HouseholdInvitations.Add(invitation);
        await dbContext.SaveChangesAsync();

        return new CreateHouseholdInvitationResult(
            new HouseholdInvitationResponseDto
            {
                InviteUrl = BuildInviteUrl(token),
                ExpiresAtUtc = invitation.ExpiresAtUtc
            },
            HouseholdInvitationStatus.Success);
    }

    public async Task<AcceptHouseholdInvitationResult> AcceptInvitationAsync(string token)
    {
        var normalizedToken = token.Trim();

        if (string.IsNullOrWhiteSpace(normalizedToken))
        {
            return new AcceptHouseholdInvitationResult(null, HouseholdInvitationStatus.Invalid);
        }

        var tokenHash = HashToken(normalizedToken);
        var invitation = await dbContext.HouseholdInvitations
            .Include(existingInvitation => existingInvitation.Household)
            .FirstOrDefaultAsync(existingInvitation => existingInvitation.TokenHash == tokenHash);

        if (invitation is null ||
            invitation.UsedAtUtc is not null ||
            invitation.ExpiresAtUtc <= DateTime.UtcNow)
        {
            return new AcceptHouseholdInvitationResult(null, HouseholdInvitationStatus.Invalid);
        }

        var userId = householdContext.UserId;
        var user = await dbContext.Users.FirstOrDefaultAsync(existingUser => existingUser.Id == userId);

        if (user is null)
        {
            return new AcceptHouseholdInvitationResult(null, HouseholdInvitationStatus.NotFound);
        }

        var existingMembership = await dbContext.HouseholdMembers
            .FirstOrDefaultAsync(member =>
                member.HouseholdId == invitation.HouseholdId &&
                member.UserId == userId);

        var otherMemberships = await dbContext.HouseholdMembers
            .Where(member =>
                member.UserId == userId &&
                member.HouseholdId != invitation.HouseholdId)
            .ToListAsync();
        dbContext.HouseholdMembers.RemoveRange(otherMemberships);

        if (existingMembership is null)
        {
            dbContext.HouseholdMembers.Add(new HouseholdMember
            {
                HouseholdId = invitation.HouseholdId,
                UserId = userId,
                Role = HouseholdRole.Member
            });
        }

        user.HouseholdId = invitation.HouseholdId;
        user.UpdatedAtUtc = DateTime.UtcNow;
        invitation.UsedAtUtc = DateTime.UtcNow;
        invitation.UsedByUserId = userId;

        await dbContext.SaveChangesAsync();

        return new AcceptHouseholdInvitationResult(
            new HouseholdResponseDto
            {
                Id = invitation.HouseholdId,
                Name = invitation.Household.Name,
                CurrentUserRole = (existingMembership?.Role ?? HouseholdRole.Member).ToString()
            },
            HouseholdInvitationStatus.Success);
    }

    private async Task<HouseholdMember?> GetMembershipAsync(int userId, int householdId)
    {
        return await dbContext.HouseholdMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(member =>
                member.UserId == userId &&
                member.HouseholdId == householdId);
    }

    private string BuildInviteUrl(string token)
    {
        var request = httpContextAccessor.HttpContext?.Request;
        var origin = request is null
            ? "http://localhost:5173"
            : $"{request.Scheme}://{request.Host}";

        return $"{origin}/invite/{Uri.EscapeDataString(token)}";
    }

    private static string CreateToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}

public record CreateHouseholdInvitationResult(
    HouseholdInvitationResponseDto? Invitation,
    HouseholdInvitationStatus Status);

public record AcceptHouseholdInvitationResult(
    HouseholdResponseDto? Household,
    HouseholdInvitationStatus Status);

public enum HouseholdInvitationStatus
{
    Success,
    Forbidden,
    Invalid,
    NotFound
}
