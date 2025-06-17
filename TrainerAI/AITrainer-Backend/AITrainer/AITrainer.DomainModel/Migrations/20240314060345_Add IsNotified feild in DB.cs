using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class AddIsNotifiedfeildinDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsNotified",
                table: "JournalFeedbacks",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsNotified",
                table: "Journal",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AlterColumn<bool>(
                name: "isDismissed",
                table: "Internship",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AddColumn<bool>(
                name: "IsEndNotified",
                table: "Internship",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsStartNotified",
                table: "Internship",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsNotified",
                table: "GeneralInternshipFeedbacks",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsNotified",
                table: "AssignmentSubmissions",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsNotified",
                table: "AssignmentFeedback",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsNotified",
                table: "JournalFeedbacks");

            migrationBuilder.DropColumn(
                name: "IsNotified",
                table: "Journal");

            migrationBuilder.DropColumn(
                name: "IsEndNotified",
                table: "Internship");

            migrationBuilder.DropColumn(
                name: "IsStartNotified",
                table: "Internship");

            migrationBuilder.DropColumn(
                name: "IsNotified",
                table: "GeneralInternshipFeedbacks");

            migrationBuilder.DropColumn(
                name: "IsNotified",
                table: "AssignmentSubmissions");

            migrationBuilder.DropColumn(
                name: "IsNotified",
                table: "AssignmentFeedback");

            migrationBuilder.AlterColumn<bool>(
                name: "isDismissed",
                table: "Internship",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);
        }
    }
}
