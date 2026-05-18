using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyPlanner.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FamilyMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    ColorHex = table.Column<string>(type: "TEXT", maxLength: 7, nullable: true),
                    DisplayOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyMembers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Meals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    RecipeInstructions = table.Column<string>(type: "TEXT", maxLength: 4000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meals", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WeekPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WeekStartDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeekPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MealIngredients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MealId = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Quantity = table.Column<string>(type: "TEXT", maxLength: 40, nullable: true),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 40, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealIngredients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealIngredients_Meals_MealId",
                        column: x => x.MealId,
                        principalTable: "Meals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GroceryItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WeekPlanId = table.Column<int>(type: "INTEGER", nullable: false),
                    SourceMealId = table.Column<int>(type: "INTEGER", nullable: true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Quantity = table.Column<string>(type: "TEXT", maxLength: 40, nullable: true),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 40, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 250, nullable: true),
                    IsChecked = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsManuallyAdded = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroceryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroceryItems_Meals_SourceMealId",
                        column: x => x.SourceMealId,
                        principalTable: "Meals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GroceryItems_WeekPlans_WeekPlanId",
                        column: x => x.WeekPlanId,
                        principalTable: "WeekPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlannedDinners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WeekPlanId = table.Column<int>(type: "INTEGER", nullable: false),
                    DayOfWeek = table.Column<int>(type: "INTEGER", nullable: false),
                    MealId = table.Column<int>(type: "INTEGER", nullable: true),
                    CustomDinnerName = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlannedDinners", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlannedDinners_Meals_MealId",
                        column: x => x.MealId,
                        principalTable: "Meals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PlannedDinners_WeekPlans_WeekPlanId",
                        column: x => x.WeekPlanId,
                        principalTable: "WeekPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GroceryItems_SourceMealId",
                table: "GroceryItems",
                column: "SourceMealId");

            migrationBuilder.CreateIndex(
                name: "IX_GroceryItems_WeekPlanId",
                table: "GroceryItems",
                column: "WeekPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_MealIngredients_MealId",
                table: "MealIngredients",
                column: "MealId");

            migrationBuilder.CreateIndex(
                name: "IX_Meals_Name",
                table: "Meals",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlannedDinners_MealId",
                table: "PlannedDinners",
                column: "MealId");

            migrationBuilder.CreateIndex(
                name: "IX_PlannedDinners_WeekPlanId_DayOfWeek",
                table: "PlannedDinners",
                columns: new[] { "WeekPlanId", "DayOfWeek" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WeekPlans_WeekStartDate",
                table: "WeekPlans",
                column: "WeekStartDate",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FamilyMembers");

            migrationBuilder.DropTable(
                name: "GroceryItems");

            migrationBuilder.DropTable(
                name: "MealIngredients");

            migrationBuilder.DropTable(
                name: "PlannedDinners");

            migrationBuilder.DropTable(
                name: "Meals");

            migrationBuilder.DropTable(
                name: "WeekPlans");
        }
    }
}
