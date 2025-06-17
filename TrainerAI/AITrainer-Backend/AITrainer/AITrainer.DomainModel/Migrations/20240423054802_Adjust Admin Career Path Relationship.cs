using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class AdjustAdminCareerPathRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminCareerPath");

            migrationBuilder.AddColumn<string>(
                name: "CareerPathId",
                table: "Admin",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admin_CareerPathId",
                table: "Admin",
                column: "CareerPathId");

            migrationBuilder.AddForeignKey(
                name: "FK_Admin_CareerPaths_CareerPathId",
                table: "Admin",
                column: "CareerPathId",
                principalTable: "CareerPaths",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Admin_CareerPaths_CareerPathId",
                table: "Admin");

            migrationBuilder.DropIndex(
                name: "IX_Admin_CareerPathId",
                table: "Admin");

            migrationBuilder.DropColumn(
                name: "CareerPathId",
                table: "Admin");

            migrationBuilder.CreateTable(
                name: "AdminCareerPath",
                columns: table => new
                {
                    AdminsId = table.Column<string>(type: "text", nullable: false),
                    CareerPathsId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminCareerPath", x => new { x.AdminsId, x.CareerPathsId });
                    table.ForeignKey(
                        name: "FK_AdminCareerPath_Admin_AdminsId",
                        column: x => x.AdminsId,
                        principalTable: "Admin",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AdminCareerPath_CareerPaths_CareerPathsId",
                        column: x => x.CareerPathsId,
                        principalTable: "CareerPaths",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminCareerPath_CareerPathsId",
                table: "AdminCareerPath",
                column: "CareerPathsId");
        }
    }
}
