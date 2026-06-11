using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace FamilyPlanner.Api.Services;

public class AppClaimsTransformation(UserAccountService userAccountService) : IClaimsTransformation
{
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity?.IsAuthenticated != true ||
            principal.Identity is not ClaimsIdentity identity)
        {
            return principal;
        }

        var user = await FindUserAsync(principal);

        if (user is null)
        {
            return principal;
        }

        ReplaceClaim(identity, AuthClaimTypes.UserId, user.Id.ToString());
        ReplaceClaim(identity, AuthClaimTypes.HouseholdId, user.HouseholdId.ToString());

        if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
        {
            ReplaceClaim(identity, AuthClaimTypes.AvatarUrl, user.AvatarUrl);
        }

        return principal;
    }

    private async Task<Entities.User?> FindUserAsync(ClaimsPrincipal principal)
    {
        var userIdClaim = principal.FindFirstValue(AuthClaimTypes.UserId);

        if (int.TryParse(userIdClaim, out var userId))
        {
            var user = await userAccountService.FindByIdAsync(userId);

            if (user is not null)
            {
                return user;
            }
        }

        var email = principal.FindFirstValue(ClaimTypes.Email);

        return string.IsNullOrWhiteSpace(email)
            ? null
            : await userAccountService.FindByEmailAsync(email);
    }

    private static void ReplaceClaim(ClaimsIdentity identity, string claimType, string value)
    {
        foreach (var existingClaim in identity.FindAll(claimType).ToList())
        {
            identity.RemoveClaim(existingClaim);
        }

        identity.AddClaim(new Claim(claimType, value));
    }
}
