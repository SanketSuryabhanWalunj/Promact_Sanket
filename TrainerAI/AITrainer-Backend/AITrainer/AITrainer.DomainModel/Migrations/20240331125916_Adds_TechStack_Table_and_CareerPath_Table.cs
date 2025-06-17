using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class Adds_TechStack_Table_and_CareerPath_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Designation",
                table: "Admin",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AdminProjectManagers",
                columns: table => new
                {
                    AdminId = table.Column<string>(type: "text", nullable: false),
                    ProjectManagersId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminProjectManagers", x => new { x.AdminId, x.ProjectManagersId });
                    table.ForeignKey(
                        name: "FK_AdminProjectManagers_Admin_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Admin",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AdminProjectManagers_Admin_ProjectManagersId",
                        column: x => x.ProjectManagersId,
                        principalTable: "Admin",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CareerPaths",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareerPaths", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TechStacks",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechStacks", x => x.Id);
                });

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

            migrationBuilder.CreateTable(
                name: "AdminTechStack",
                columns: table => new
                {
                    AdminsId = table.Column<string>(type: "text", nullable: false),
                    TechStacksId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminTechStack", x => new { x.AdminsId, x.TechStacksId });
                    table.ForeignKey(
                        name: "FK_AdminTechStack_Admin_AdminsId",
                        column: x => x.AdminsId,
                        principalTable: "Admin",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AdminTechStack_TechStacks_TechStacksId",
                        column: x => x.TechStacksId,
                        principalTable: "TechStacks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminCareerPath_CareerPathsId",
                table: "AdminCareerPath",
                column: "CareerPathsId");

            migrationBuilder.CreateIndex(
                name: "IX_AdminProjectManagers_ProjectManagersId",
                table: "AdminProjectManagers",
                column: "ProjectManagersId");

            migrationBuilder.CreateIndex(
                name: "IX_AdminTechStack_TechStacksId",
                table: "AdminTechStack",
                column: "TechStacksId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminCareerPath");

            migrationBuilder.DropTable(
                name: "AdminProjectManagers");

            migrationBuilder.DropTable(
                name: "AdminTechStack");

            migrationBuilder.DropTable(
                name: "CareerPaths");

            migrationBuilder.DropTable(
                name: "TechStacks");

            migrationBuilder.DropColumn(
                name: "Designation",
                table: "Admin");
        }
    }
}
