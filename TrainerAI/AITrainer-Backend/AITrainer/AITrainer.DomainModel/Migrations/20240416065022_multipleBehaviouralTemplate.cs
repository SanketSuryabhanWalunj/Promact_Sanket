using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class multipleBehaviouralTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Internship_BehaviourTemplates_BehaviourTemplateId",
                table: "Internship");

            migrationBuilder.DropIndex(
                name: "IX_Internship_BehaviourTemplateId",
                table: "Internship");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Internship_BehaviourTemplateId",
                table: "Internship",
                column: "BehaviourTemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Internship_BehaviourTemplates_BehaviourTemplateId",
                table: "Internship",
                column: "BehaviourTemplateId",
                principalTable: "BehaviourTemplates",
                principalColumn: "Id");
        }
    }
}
