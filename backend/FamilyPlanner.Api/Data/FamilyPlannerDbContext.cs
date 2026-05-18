using FamilyPlanner.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyPlanner.Api.Data;

public class FamilyPlannerDbContext(DbContextOptions<FamilyPlannerDbContext> options) : DbContext(options)
{
    public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
    public DbSet<Meal> Meals => Set<Meal>();
    public DbSet<MealIngredient> MealIngredients => Set<MealIngredient>();
    public DbSet<WeekPlan> WeekPlans => Set<WeekPlan>();
    public DbSet<PlannedMeal> PlannedMeals => Set<PlannedMeal>();
    public DbSet<GroceryItem> GroceryItems => Set<GroceryItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // The MVP is single-household, so there is no Household table yet.
        // If multi-household support appears later, these entities can gain a
        // HouseholdId without changing the beginner-friendly shape of the app.
        modelBuilder.Entity<FamilyMember>(entity =>
        {
            entity.Property(member => member.Name).HasMaxLength(80);
            entity.Property(member => member.ColorHex).HasMaxLength(7);
        });

        modelBuilder.Entity<Meal>(entity =>
        {
            entity.Property(meal => meal.Name).HasMaxLength(120);
            entity.Property(meal => meal.RecipeInstructions).HasMaxLength(4000);
            entity.HasIndex(meal => meal.Name).IsUnique();
        });

        modelBuilder.Entity<MealIngredient>(entity =>
        {
            entity.Property(ingredient => ingredient.Name).HasMaxLength(120);
            entity.Property(ingredient => ingredient.Quantity).HasMaxLength(40);
            entity.Property(ingredient => ingredient.Unit).HasMaxLength(40);
            entity.Property(ingredient => ingredient.Notes).HasMaxLength(250);

            entity.HasOne(ingredient => ingredient.Meal)
                .WithMany(meal => meal.Ingredients)
                .HasForeignKey(ingredient => ingredient.MealId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WeekPlan>(entity =>
        {
            entity.HasIndex(plan => plan.WeekStartDate).IsUnique();
            entity.Property(plan => plan.Notes).HasMaxLength(500);
        });

        modelBuilder.Entity<PlannedMeal>(entity =>
        {
            entity.Property(plannedMeal => plannedMeal.AssignedFamilyMemberName).HasMaxLength(80);

            // One planned meal per day keeps the weekly planner predictable and
            // maps directly to the MVP screen: seven weekday slots, no calendar gymnastics.
            entity.HasIndex(plannedMeal => new { plannedMeal.WeekPlanId, plannedMeal.DayOfWeek }).IsUnique();

            entity.HasOne(plannedMeal => plannedMeal.WeekPlan)
                .WithMany(plan => plan.PlannedMeals)
                .HasForeignKey(plannedMeal => plannedMeal.WeekPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(plannedMeal => plannedMeal.Meal)
                .WithMany(meal => meal.PlannedMeals)
                .HasForeignKey(plannedMeal => plannedMeal.MealId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<GroceryItem>(entity =>
        {
            entity.Property(item => item.Name).HasMaxLength(120);
            entity.Property(item => item.Quantity).HasMaxLength(40);
            entity.Property(item => item.Unit).HasMaxLength(40);
            entity.Property(item => item.Notes).HasMaxLength(250);

            entity.HasOne(item => item.WeekPlan)
                .WithMany(plan => plan.GroceryItems)
                .HasForeignKey(item => item.WeekPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(item => item.SourceMeal)
                .WithMany()
                .HasForeignKey(item => item.SourceMealId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
