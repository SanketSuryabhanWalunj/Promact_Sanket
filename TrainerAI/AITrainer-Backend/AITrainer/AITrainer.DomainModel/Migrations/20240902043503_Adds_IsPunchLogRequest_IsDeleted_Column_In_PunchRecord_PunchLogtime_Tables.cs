using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class Adds_IsPunchLogRequest_IsDeleted_Column_In_PunchRecord_PunchLogtime_Tables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPunchLogRequest",
                table: "PunchRecords",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "PunchLogTimes",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPunchLogRequest",
                table: "PunchRecords");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "PunchLogTimes");
        }
    }
}
