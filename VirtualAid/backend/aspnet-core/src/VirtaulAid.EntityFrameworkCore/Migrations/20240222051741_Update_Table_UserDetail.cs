using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTableUserDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BannerImage",
                table: "UserDetails",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "UserDetails",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Designation",
                table: "UserDetails",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PublishData",
                table: "UserDetails",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BannerImage",
                table: "UserDetails");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "UserDetails");

            migrationBuilder.DropColumn(
                name: "Designation",
                table: "UserDetails");

            migrationBuilder.DropColumn(
                name: "PublishData",
                table: "UserDetails");
        }
    }
}
