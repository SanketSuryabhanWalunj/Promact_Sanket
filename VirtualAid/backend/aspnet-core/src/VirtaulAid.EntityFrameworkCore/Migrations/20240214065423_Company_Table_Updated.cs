using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class CompanyTableUpdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BannerImage",
                table: "Companies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Companies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoOfEmployees",
                table: "Companies",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PublishData",
                table: "Companies",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Slogan",
                table: "Companies",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BannerImage",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "NoOfEmployees",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "PublishData",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Slogan",
                table: "Companies");
        }
    }
}
