using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class Addbehaviourtableandbehaviourcategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BehaviourTemplateId",
                table: "Internship",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BehaviourCategoryId",
                table: "GeneralInternshipFeedbacks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "GeneralInternshipFeedbacks",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "ReceivedMarks",
                table: "GeneralInternshipFeedbacks",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "GeneralInternshipFeedbacks",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BehaviourTemplates",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    TemplateName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BehaviourTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BehaviourCategories",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    BehaviourTemplateId = table.Column<string>(type: "text", nullable: false),
                    CategoryName = table.Column<string>(type: "text", nullable: false),
                    TotalMarks = table.Column<double>(type: "double precision", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BehaviourCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BehaviourCategories_BehaviourTemplates_BehaviourTemplateId",
                        column: x => x.BehaviourTemplateId,
                        principalTable: "BehaviourTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Internship_BehaviourTemplateId",
                table: "Internship",
                column: "BehaviourTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralInternshipFeedbacks_BehaviourCategoryId",
                table: "GeneralInternshipFeedbacks",
                column: "BehaviourCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_BehaviourCategories_BehaviourTemplateId",
                table: "BehaviourCategories",
                column: "BehaviourTemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_GeneralInternshipFeedbacks_BehaviourCategories_BehaviourCat~",
                table: "GeneralInternshipFeedbacks",
                column: "BehaviourCategoryId",
                principalTable: "BehaviourCategories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Internship_BehaviourTemplates_BehaviourTemplateId",
                table: "Internship",
                column: "BehaviourTemplateId",
                principalTable: "BehaviourTemplates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GeneralInternshipFeedbacks_BehaviourCategories_BehaviourCat~",
                table: "GeneralInternshipFeedbacks");

            migrationBuilder.DropForeignKey(
                name: "FK_Internship_BehaviourTemplates_BehaviourTemplateId",
                table: "Internship");

            migrationBuilder.DropTable(
                name: "BehaviourCategories");

            migrationBuilder.DropTable(
                name: "BehaviourTemplates");

            migrationBuilder.DropIndex(
                name: "IX_Internship_BehaviourTemplateId",
                table: "Internship");

            migrationBuilder.DropIndex(
                name: "IX_GeneralInternshipFeedbacks_BehaviourCategoryId",
                table: "GeneralInternshipFeedbacks");

            migrationBuilder.DropColumn(
                name: "BehaviourTemplateId",
                table: "Internship");

            migrationBuilder.DropColumn(
                name: "BehaviourCategoryId",
                table: "GeneralInternshipFeedbacks");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "GeneralInternshipFeedbacks");

            migrationBuilder.DropColumn(
                name: "ReceivedMarks",
                table: "GeneralInternshipFeedbacks");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "GeneralInternshipFeedbacks");
        }
    }
}
