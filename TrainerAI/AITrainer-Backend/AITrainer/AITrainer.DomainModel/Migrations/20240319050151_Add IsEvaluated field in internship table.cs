using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class AddIsEvaluatedfieldininternshiptable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsEvaluated",
                table: "Internship",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsEvaluated",
                table: "Internship");
        }
    }
}
