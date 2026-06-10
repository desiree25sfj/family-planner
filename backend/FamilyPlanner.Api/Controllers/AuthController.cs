using FamilyPlanner.Api.DTOs;
using FamilyPlanner.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyPlanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IConfiguration configuration,
    UserAccountService userAccountService) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("login")]
    public IActionResult Login([FromQuery] string? returnUrl = null)
    {
        if (string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientId"]) ||
            string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientSecret"]))
        {
            return Problem(
                title: "Google Sign-In is not configured.",
                detail: "Set Authentication:Google:ClientId and Authentication:Google:ClientSecret on the backend.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(Complete), new { returnUrl = GetSafeReturnUrl(returnUrl) })
        };

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("complete")]
    public IActionResult Complete([FromQuery] string? returnUrl = null)
    {
        return Redirect(GetSafeReturnUrl(returnUrl));
    }

    [HttpGet("me")]
    public async Task<ActionResult<AuthUserResponseDto>> GetCurrentUser()
    {
        var user = await userAccountService.GetCurrentUserAsync(User);

        return user is null ? Unauthorized() : Ok(user);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        return NoContent();
    }

    private string GetSafeReturnUrl(string? returnUrl)
    {
        var allowedOrigins = configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>()
            ?? ["http://localhost:5173", "http://127.0.0.1:5173"];

        var fallbackOrigin = allowedOrigins
            .Select(origin => origin.Trim().TrimEnd('/'))
            .FirstOrDefault(origin => !string.IsNullOrWhiteSpace(origin))
            ?? "http://localhost:5173";

        if (string.IsNullOrWhiteSpace(returnUrl) ||
            !Uri.TryCreate(returnUrl, UriKind.Absolute, out var parsedReturnUrl))
        {
            return fallbackOrigin;
        }

        var requestedOrigin = $"{parsedReturnUrl.Scheme}://{parsedReturnUrl.Authority}";
        var isAllowedOrigin = allowedOrigins
            .Select(origin => origin.Trim().TrimEnd('/'))
            .Any(origin => string.Equals(origin, requestedOrigin, StringComparison.OrdinalIgnoreCase));

        return isAllowedOrigin ? returnUrl : fallbackOrigin;
    }
}
