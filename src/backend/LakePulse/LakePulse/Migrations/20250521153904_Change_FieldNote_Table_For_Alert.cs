using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LakePulse.Migrations
{
    /// <inheritdoc />
    public partial class Change_FieldNote_Table_For_Alert : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AlertCategorieId",
                table: "FieldNote",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AlertLevelId",
                table: "FieldNote",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAlert",
                table: "FieldNote",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlertCategorieId",
                table: "FieldNote");

            migrationBuilder.DropColumn(
                name: "AlertLevelId",
                table: "FieldNote");

            migrationBuilder.DropColumn(
                name: "IsAlert",
                table: "FieldNote");
        }
    }
}
