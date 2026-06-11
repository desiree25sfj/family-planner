using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace FamilyPlanner.Api.Services;

public class AppClaimsTransformation(UserAccountService userAccountService) : IClaimsTransformation
{
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity?.IsAuthenticated != true ||
            principal.HasClaim(claim => claim.Type == AuthClaimTypes.UserId) ||
            principal.Identity is not ClaimsIdentity identity)
        {
            return principal;
        }

        var email = principal.FindFirstValue(ClaimTypes.Email);

        if (string.IsNullOrWhiteSpace(email))
        {
            return principal;
        }

        var user = await userAccountService.FindByEmailAsync(email);

        if (user is null)
        {
            return principal;
        }

        identity.AddClaim(new Claim(AuthClaimTypes.UserId, user.Id.ToString()));
        identity.AddClaim(new Claim(AuthClaimTypes.HouseholdId, user.HouseholdId.ToString()));

        if (!string.IsNullOrWhiteSpace(user.AvatarUrl) &&
            !principal.HasClaim(claim => claim.Type == AuthClaimTypes.AvatarUrl))
        {
            identity.AddClaim(new Claim(AuthClaimTypes.AvatarUrl, user.AvatarUrl));
        }

        return principal;
    }
}
