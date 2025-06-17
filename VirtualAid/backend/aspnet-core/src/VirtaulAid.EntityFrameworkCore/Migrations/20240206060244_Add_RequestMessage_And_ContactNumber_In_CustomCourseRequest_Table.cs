using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class AddRequestMessageAndContactNumberInCustomCourseRequestTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactNumber",
                table: "CustomCourseRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestMessage",
                table: "CustomCourseRequests",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactNumber",
                table: "CustomCourseRequests");

            migrationBuilder.DropColumn(
                name: "RequestMessage",
                table: "CustomCourseRequests");
        }
    }
}
