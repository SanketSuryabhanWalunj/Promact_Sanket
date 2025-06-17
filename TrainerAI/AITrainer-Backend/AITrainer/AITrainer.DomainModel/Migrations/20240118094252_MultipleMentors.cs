using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class MultipleMentors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Internship_AspNetUsers_MentorId",
                table: "Internship");

            migrationBuilder.DropIndex(
                name: "IX_Internship_MentorId",
                table: "Internship");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Internship_MentorId",
                table: "Internship",
                column: "MentorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Internship_AspNetUsers_MentorId",
                table: "Internship",
                column: "MentorId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
