using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class AddValidityInYearsfieldinCourseTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ValidityInYears",
                table: "Courses",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidityInYears",
                table: "Courses");
        }
    }
}
