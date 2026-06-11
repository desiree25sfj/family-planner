using FamilyPlanner.Api.Data;
using FamilyPlanner.Api.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var allowedFrontendOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?? ["http://localhost:5173", "http://127.0.0.1:5173"];
allowedFrontendOrigins = allowedFrontendOrigins
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin.Trim().TrimEnd('/'))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();
var googleClientId = builder.Configuration["Authentication__Google__ClientId"];
var googleClientSecret = builder.Configuration["Authentication__Google__ClientSecret"];
var isGoogleAuthConfigured =
    !string.IsNullOrWhiteSpace(googleClientId) &&
    !string.IsNullOrWhiteSpace(googleClientSecret);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Services stay explicit while the app is small. This keeps the MVP easy to
// debug for a beginner before introducing larger architectural patterns.
builder.Services.AddDbContext<FamilyPlannerDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<MealService>();
builder.Services.AddScoped<WeekPlanService>();
builder.Services.AddScoped<GroceryListService>();
builder.Services.AddScoped<CurrentHouseholdContext>();
builder.Services.AddScoped<UserAccountService>();
var authenticationBuilder = builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    })
    .AddCookie(options =>
    {
        options.Cookie.Name = "FamilyPlanner.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = builder.Environment.IsDevelopment()
            ? SameSiteMode.Lax
            : SameSiteMode.None;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

if (isGoogleAuthConfigured)
{
    authenticationBuilder.AddGoogle(options =>
    {
        options.ClientId = googleClientId!;
        options.ClientSecret = googleClientSecret!;
        options.Scope.Clear();
        options.Scope.Add("openid");
        options.Scope.Add("email");
        options.Scope.Add("profile");
        options.SaveTokens = false;
        options.Events.OnCreatingTicket = async context =>
        {
            var email = context.Principal?.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrWhiteSpace(email))
            {
                context.Fail("Google did not return an email address.");
                return;
            }

            if (context.User.TryGetProperty("email_verified", out var emailVerifiedElement) &&
                emailVerifiedElement.ValueKind == System.Text.Json.JsonValueKind.False)
            {
                context.Fail("Google email address is not verified.");
                return;
            }

            var displayName =
                context.Principal?.FindFirstValue(ClaimTypes.Name) ??
                context.Principal?.FindFirstValue(ClaimTypes.GivenName) ??
                email;
            var avatarUrl = context.User.TryGetProperty("picture", out var pictureElement)
                ? pictureElement.GetString()
                : null;
            var userAccountService = context.HttpContext.RequestServices.GetRequiredService<UserAccountService>();
            var user = await userAccountService.EnsureGoogleUserAsync(email, displayName, avatarUrl);
            var identity = (ClaimsIdentity)context.Principal!.Identity!;

            identity.AddClaim(new Claim(AuthClaimTypes.UserId, user.Id.ToString()));
            identity.AddClaim(new Claim(AuthClaimTypes.HouseholdId, user.HouseholdId.ToString()));
            if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
            {
                identity.AddClaim(new Claim(AuthClaimTypes.AvatarUrl, user.AvatarUrl));
            }
        };
    });
}
builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendClient", policy =>
    {
        // Browsers only allow the Vercel app to call this API when its exact
        // origin is listed here. Railway can provide these values through env vars.
        policy.WithOrigins(allowedFrontendOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // DayOfWeek as "Monday" is much friendlier for a React client than raw enum numbers.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FamilyPlannerDbContext>();
    // For this SQLite MVP, applying migrations on startup keeps Railway test
    // deployments usable without a separate database migration job.
    await dbContext.Database.MigrateAsync();

    if (app.Environment.IsDevelopment())
    {
        await DevelopmentDataSeeder.SeedAsync(dbContext);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("FrontendClient");
app.Use(async (context, next) =>
{
    var isStateChangingApiRequest =
        context.Request.Path.StartsWithSegments("/api") &&
        !HttpMethods.IsGet(context.Request.Method) &&
        !HttpMethods.IsHead(context.Request.Method) &&
        !HttpMethods.IsOptions(context.Request.Method);
    var origin = context.Request.Headers.Origin.ToString().TrimEnd('/');

    if (isStateChangingApiRequest &&
        !string.IsNullOrWhiteSpace(origin) &&
        !allowedFrontendOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return;
    }

    await next();
});
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new { app = "Family Planner API" }));
app.MapControllers().RequireAuthorization(new AuthorizeAttribute());

app.Run();
