using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class Add_PunchRecordRequests_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PunchRecordRequests",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    InternId = table.Column<string>(type: "text", nullable: false),
                    RequestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RequestPunches = table.Column<string>(type: "text", nullable: false),
                    RequestReason = table.Column<string>(type: "text", nullable: true),
                    RequestedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PunchRecordRequests", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PunchRecordRequests");
        }
    }
}
