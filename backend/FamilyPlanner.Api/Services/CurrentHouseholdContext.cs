namespace FamilyPlanner.Api.Services;

public class CurrentHouseholdContext(IHttpContextAccessor httpContextAccessor)
{
    public const int DefaultHouseholdId = 1;

    public int UserId
    {
        get
        {
            var user = httpContextAccessor.HttpContext?.User;
            var userIdClaim = user?.FindFirst(AuthClaimTypes.UserId)?.Value;

            if (int.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }

            throw new InvalidOperationException("Authenticated user is missing a user claim.");
        }
    }

    public int HouseholdId
    {
        get
        {
            var user = httpContextAccessor.HttpContext?.User;
            var householdIdClaim = user?.FindFirst(AuthClaimTypes.HouseholdId)?.Value;

            if (int.TryParse(householdIdClaim, out var householdId))
            {
                return householdId;
            }

            if (user?.Identity?.IsAuthenticated == true)
            {
                throw new InvalidOperationException("Authenticated user is missing a household claim.");
            }

            return DefaultHouseholdId;
        }
    }
}
