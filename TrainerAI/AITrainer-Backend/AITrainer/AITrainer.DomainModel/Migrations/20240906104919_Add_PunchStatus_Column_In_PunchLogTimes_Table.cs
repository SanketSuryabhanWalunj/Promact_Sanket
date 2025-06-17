using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class Add_PunchStatus_Column_In_PunchLogTimes_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PunchStatus",
                table: "PunchLogTimes",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PunchStatus",
                table: "PunchLogTimes");
        }
    }
}
