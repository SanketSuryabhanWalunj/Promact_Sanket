using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class Removes_BatchId_from_Internship_table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Internship_Batch_BatchId",
                table: "Internship");

            migrationBuilder.DropIndex(
                name: "IX_Internship_BatchId",
                table: "Internship");

            migrationBuilder.DropColumn(
                name: "BatchId",
                table: "Internship");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BatchId",
                table: "Internship",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Internship_BatchId",
                table: "Internship",
                column: "BatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_Internship_Batch_BatchId",
                table: "Internship",
                column: "BatchId",
                principalTable: "Batch",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
