using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyPlanner.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHouseholdOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Households",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Households", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Households",
                columns: new[] { "Id", "Name", "CreatedAtUtc", "UpdatedAtUtc" },
                values: new object[] { 1, "Default Household", new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.DropIndex(
                name: "IX_WeekPlans_WeekStartDate",
                table: "WeekPlans");

            migrationBuilder.DropIndex(
                name: "IX_Meals_Name",
                table: "Meals");

            migrationBuilder.AddColumn<int>(
                name: "HouseholdId",
                table: "WeekPlans",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "HouseholdId",
                table: "Meals",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "HouseholdId",
                table: "FamilyMembers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 254, nullable: false),
                    DisplayName = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    AvatarUrl = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    HouseholdId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalTable: "Households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "DisplayName", "AvatarUrl", "HouseholdId", "CreatedAtUtc", "UpdatedAtUtc" },
                values: new object[] { 1, "demo@familyplanner.local", "Demo User", null, 1, new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.CreateIndex(
                name: "IX_WeekPlans_HouseholdId_WeekStartDate",
                table: "WeekPlans",
                columns: new[] { "HouseholdId", "WeekStartDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Meals_HouseholdId_Name",
                table: "Meals",
                columns: new[] { "HouseholdId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FamilyMembers_HouseholdId",
                table: "FamilyMembers",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_HouseholdId",
                table: "Users",
                column: "HouseholdId");

            migrationBuilder.AddForeignKey(
                name: "FK_FamilyMembers_Households_HouseholdId",
                table: "FamilyMembers",
                column: "HouseholdId",
                principalTable: "Households",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Meals_Households_HouseholdId",
                table: "Meals",
                column: "HouseholdId",
                principalTable: "Households",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WeekPlans_Households_HouseholdId",
                table: "WeekPlans",
                column: "HouseholdId",
                principalTable: "Households",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FamilyMembers_Households_HouseholdId",
                table: "FamilyMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_Meals_Households_HouseholdId",
                table: "Meals");

            migrationBuilder.DropForeignKey(
                name: "FK_WeekPlans_Households_HouseholdId",
                table: "WeekPlans");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Households");

            migrationBuilder.DropIndex(
                name: "IX_WeekPlans_HouseholdId_WeekStartDate",
                table: "WeekPlans");

            migrationBuilder.DropIndex(
                name: "IX_Meals_HouseholdId_Name",
                table: "Meals");

            migrationBuilder.DropIndex(
                name: "IX_FamilyMembers_HouseholdId",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "HouseholdId",
                table: "WeekPlans");

            migrationBuilder.DropColumn(
                name: "HouseholdId",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "HouseholdId",
                table: "FamilyMembers");

            migrationBuilder.CreateIndex(
                name: "IX_WeekPlans_WeekStartDate",
                table: "WeekPlans",
                column: "WeekStartDate",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Meals_Name",
                table: "Meals",
                column: "Name",
                unique: true);
        }
    }
}
