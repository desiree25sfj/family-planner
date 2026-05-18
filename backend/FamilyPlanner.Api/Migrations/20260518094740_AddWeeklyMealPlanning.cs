using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyPlanner.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddWeeklyMealPlanning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "PlannedDinners",
                newName: "PlannedMeals");

            migrationBuilder.RenameIndex(
                name: "IX_PlannedDinners_WeekPlanId_DayOfWeek",
                table: "PlannedMeals",
                newName: "IX_PlannedMeals_WeekPlanId_DayOfWeek");

            migrationBuilder.RenameIndex(
                name: "IX_PlannedDinners_MealId",
                table: "PlannedMeals",
                newName: "IX_PlannedMeals_MealId");

            migrationBuilder.DropColumn(
                name: "CustomDinnerName",
                table: "PlannedMeals");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "PlannedMeals");

            migrationBuilder.AlterColumn<int>(
                name: "MealId",
                table: "PlannedMeals",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssignedFamilyMemberName",
                table: "PlannedMeals",
                type: "TEXT",
                maxLength: 80,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedFamilyMemberName",
                table: "PlannedMeals");

            migrationBuilder.AlterColumn<int>(
                name: "MealId",
                table: "PlannedMeals",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<string>(
                name: "CustomDinnerName",
                table: "PlannedMeals",
                type: "TEXT",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "PlannedMeals",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.RenameIndex(
                name: "IX_PlannedMeals_WeekPlanId_DayOfWeek",
                table: "PlannedMeals",
                newName: "IX_PlannedDinners_WeekPlanId_DayOfWeek");

            migrationBuilder.RenameIndex(
                name: "IX_PlannedMeals_MealId",
                table: "PlannedMeals",
                newName: "IX_PlannedDinners_MealId");

            migrationBuilder.RenameTable(
                name: "PlannedMeals",
                newName: "PlannedDinners");
        }
    }
}
