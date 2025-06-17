using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LakePulse.Migrations
{
    /// <inheritdoc />
    public partial class Change_Log_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "DataHubEditLog",
                newName: "LakePulseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LakePulseId",
                table: "DataHubEditLog",
                newName: "UserId");
        }
    }
}
