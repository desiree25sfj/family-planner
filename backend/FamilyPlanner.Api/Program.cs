using FamilyPlanner.Api.Data;
using FamilyPlanner.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Services stay explicit while the app is small. This keeps the MVP easy to
// debug for a beginner before introducing larger architectural patterns.
builder.Services.AddDbContext<FamilyPlannerDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<MealService>();
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/", () => Results.Ok(new { app = "Family Planner API" }));
app.MapControllers();

app.Run();
