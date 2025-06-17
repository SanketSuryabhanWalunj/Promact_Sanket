using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class AddExpiredColumnInUserCourseEnrollmentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Expired",
                table: "UserCourseEnrollments",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Expired",
                table: "UserCourseEnrollments");
        }
    }
}
