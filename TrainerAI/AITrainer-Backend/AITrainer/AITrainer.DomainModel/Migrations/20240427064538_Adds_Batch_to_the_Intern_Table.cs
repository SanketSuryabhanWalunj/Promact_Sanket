using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class Adds_Batch_to_the_Intern_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BatchId",
                table: "Intern",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Intern_BatchId",
                table: "Intern",
                column: "BatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_Intern_Batch_BatchId",
                table: "Intern",
                column: "BatchId",
                principalTable: "Batch",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Intern_Batch_BatchId",
                table: "Intern");

            migrationBuilder.DropIndex(
                name: "IX_Intern_BatchId",
                table: "Intern");

            migrationBuilder.DropColumn(
                name: "BatchId",
                table: "Intern");
        }
    }
}
