using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class AddPriceTableAndAddExamTypeTotalAmountPlanTypeToCourseSubscriptionMappingTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExamType",
                table: "CourseSubscriptionMappings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PlanType",
                table: "CourseSubscriptionMappings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "TotalAmount",
                table: "CourseSubscriptionMappings",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExamType",
                table: "CourseSubscriptionMappings");

            migrationBuilder.DropColumn(
                name: "PlanType",
                table: "CourseSubscriptionMappings");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "CourseSubscriptionMappings");
        }
    }
}
