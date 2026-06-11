using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyPlanner.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMealDraftFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "Meals",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("""
                UPDATE Meals
                SET IsDraft = 1
                WHERE RecipeInstructions IS NULL
                   OR TRIM(RecipeInstructions) = ''
                   OR NOT EXISTS (
                       SELECT 1
                       FROM MealIngredients
                       WHERE MealIngredients.MealId = Meals.Id
                   );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDraft",
                table: "Meals");
        }
    }
}
