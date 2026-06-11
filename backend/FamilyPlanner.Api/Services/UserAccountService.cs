using System.Security.Claims;
using FamilyPlanner.Api.Data;
using FamilyPlanner.Api.DTOs;
using FamilyPlanner.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyPlanner.Api.Services;

public class UserAccountService(FamilyPlannerDbContext dbContext)
{
    public async Task<User> EnsureGoogleUserAsync(string email, string displayName, string? avatarUrl)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var normalizedDisplayName = string.IsNullOrWhiteSpace(displayName)
            ? normalizedEmail
            : displayName.Trim();
        var normalizedAvatarUrl = NormalizeOptionalText(avatarUrl);

        var user = await dbContext.Users
            .Include(existingUser => existingUser.Household)
            .FirstOrDefaultAsync(existingUser => existingUser.Email == normalizedEmail);

        if (user is not null)
        {
            user.DisplayName = normalizedDisplayName;
            user.AvatarUrl = normalizedAvatarUrl;
            user.UpdatedAtUtc = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();

            return user;
        }

        var household = new Household
        {
            Name = $"{normalizedDisplayName}'s Household"
        };

        user = new User
        {
            Email = normalizedEmail,
            DisplayName = normalizedDisplayName,
            AvatarUrl = normalizedAvatarUrl,
            Household = household,
            HouseholdMemberships =
            [
                new HouseholdMember
                {
                    Household = household,
                    Role = HouseholdRole.Owner
                }
            ]
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        return user;
    }

    public async Task<AuthUserResponseDto?> GetCurrentUserAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        var userIdClaim = principal.FindFirstValue(AuthClaimTypes.UserId);

        if (int.TryParse(userIdClaim, out var userId))
        {
            var userById = await dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(existingUser => existingUser.Id == userId);

            if (userById is not null)
            {
                return ToResponseDto(userById);
            }
        }

        var email = principal.FindFirstValue(ClaimTypes.Email);

        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        var userByEmail = await FindByEmailAsync(email);

        return userByEmail is null ? null : ToResponseDto(userByEmail);
    }

    public async Task<User?> FindByEmailAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        return await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(existingUser => existingUser.Email == normalizedEmail);
    }

    public async Task<User?> FindByIdAsync(int id)
    {
        return await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(existingUser => existingUser.Id == id);
    }

    public static AuthUserResponseDto ToResponseDto(User user)
    {
        return new AuthUserResponseDto
        {
            Id = user.Id,
            HouseholdId = user.HouseholdId,
            Email = user.Email,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl
        };
    }

    private static string? NormalizeOptionalText(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}
