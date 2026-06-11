using FamilyPlanner.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyPlanner.Api.Data;

public class FamilyPlannerDbContext(DbContextOptions<FamilyPlannerDbContext> options) : DbContext(options)
{
    public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
    public DbSet<Household> Households => Set<Household>();
    public DbSet<HouseholdInvitation> HouseholdInvitations => Set<HouseholdInvitation>();
    public DbSet<HouseholdMember> HouseholdMembers => Set<HouseholdMember>();
    public DbSet<Meal> Meals => Set<Meal>();
    public DbSet<MealIngredient> MealIngredients => Set<MealIngredient>();
    public DbSet<WeekPlan> WeekPlans => Set<WeekPlan>();
    public DbSet<PlannedMeal> PlannedMeals => Set<PlannedMeal>();
    public DbSet<GroceryItem> GroceryItems => Set<GroceryItem>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Household>(entity =>
        {
            entity.Property(household => household.Name).HasMaxLength(120);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(user => user.Email).HasMaxLength(254);
            entity.Property(user => user.DisplayName).HasMaxLength(120);
            entity.Property(user => user.AvatarUrl).HasMaxLength(1000);
            entity.HasIndex(user => user.Email).IsUnique();

            entity.HasOne(user => user.Household)
                .WithMany(household => household.Users)
                .HasForeignKey(user => user.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<HouseholdMember>(entity =>
        {
            entity.HasIndex(member => new { member.HouseholdId, member.UserId }).IsUnique();
            entity.HasIndex(member => member.UserId);

            entity.HasOne(member => member.Household)
                .WithMany(household => household.Members)
                .HasForeignKey(member => member.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(member => member.User)
                .WithMany(user => user.HouseholdMemberships)
                .HasForeignKey(member => member.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<HouseholdInvitation>(entity =>
        {
            entity.Property(invitation => invitation.TokenHash).HasMaxLength(128);
            entity.HasIndex(invitation => invitation.TokenHash).IsUnique();
            entity.HasIndex(invitation => new { invitation.HouseholdId, invitation.ExpiresAtUtc });

            entity.HasOne(invitation => invitation.Household)
                .WithMany(household => household.Invitations)
                .HasForeignKey(invitation => invitation.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(invitation => invitation.CreatedByUser)
                .WithMany(user => user.CreatedInvitations)
                .HasForeignKey(invitation => invitation.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(invitation => invitation.UsedByUser)
                .WithMany(user => user.UsedInvitations)
                .HasForeignKey(invitation => invitation.UsedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<FamilyMember>(entity =>
        {
            entity.Property(member => member.Name).HasMaxLength(80);
            entity.Property(member => member.ColorHex).HasMaxLength(7);

            entity.HasOne(member => member.Household)
                .WithMany(household => household.FamilyMembers)
                .HasForeignKey(member => member.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Meal>(entity =>
        {
            entity.Property(meal => meal.Name).HasMaxLength(120);
            entity.Property(meal => meal.RecipeInstructions).HasMaxLength(4000);
            entity.HasIndex(meal => new { meal.HouseholdId, meal.Name }).IsUnique();

            entity.HasOne(meal => meal.Household)
                .WithMany(household => household.Meals)
                .HasForeignKey(meal => meal.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);
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
            entity.HasIndex(plan => new { plan.HouseholdId, plan.WeekStartDate }).IsUnique();
            entity.Property(plan => plan.Notes).HasMaxLength(500);

            entity.HasOne(plan => plan.Household)
                .WithMany(household => household.WeekPlans)
                .HasForeignKey(plan => plan.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);
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
            entity.Property(item => item.IsHidden).HasDefaultValue(false);

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
