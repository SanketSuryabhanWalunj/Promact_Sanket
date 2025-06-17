using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LakePulse.Migrations
{
    /// <inheritdoc />
    public partial class Change_AlertPreference_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserEmail",
                table: "AlertPreferences",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserEmail",
                table: "AlertPreferences");
        }
    }
}
