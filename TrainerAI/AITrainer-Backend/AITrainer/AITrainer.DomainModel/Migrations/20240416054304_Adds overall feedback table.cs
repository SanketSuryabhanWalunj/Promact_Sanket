using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class Addsoverallfeedbacktable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OverallFeedbacks",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    InternId = table.Column<string>(type: "text", nullable: false),
                    BehaviourPerformance = table.Column<string>(type: "text", nullable: false),
                    TechnicalPerformance = table.Column<string>(type: "text", nullable: false),
                    RightFit = table.Column<string>(type: "text", nullable: false),
                    DetailedFeedback = table.Column<string>(type: "text", nullable: false),
                    CreatedById = table.Column<string>(type: "text", nullable: false),
                    CreatedByName = table.Column<string>(type: "text", nullable: false),
                    UpdatedById = table.Column<string>(type: "text", nullable: false),
                    UpdatedByName = table.Column<string>(type: "text", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    IsNotified = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OverallFeedbacks", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OverallFeedbacks");
        }
    }
}
