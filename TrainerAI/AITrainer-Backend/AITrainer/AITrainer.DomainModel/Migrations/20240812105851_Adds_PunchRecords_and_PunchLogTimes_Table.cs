using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class Adds_PunchRecords_and_PunchLogTimes_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PunchRecords",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    InternId = table.Column<string>(type: "text", nullable: false),
                    PunchDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsPunch = table.Column<bool>(type: "boolean", nullable: false),
                    Comments = table.Column<string>(type: "text", nullable: true),
                    approvedBy = table.Column<string>(type: "text", nullable: true),
                    approvedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsRequest = table.Column<bool>(type: "boolean", nullable: false),
                    RequestDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RequestStatus = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    RequestReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PunchRecords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PunchLogTimes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PunchIn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PunchOut = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalTimeSpan = table.Column<TimeSpan>(type: "interval", nullable: false),
                    IsPunchLog = table.Column<bool>(type: "boolean", nullable: false),
                    PunchRecordId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PunchLogTimes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PunchLogTimes_PunchRecords_PunchRecordId",
                        column: x => x.PunchRecordId,
                        principalTable: "PunchRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PunchLogTimes_PunchRecordId",
                table: "PunchLogTimes",
                column: "PunchRecordId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PunchLogTimes");

            migrationBuilder.DropTable(
                name: "PunchRecords");
        }
    }
}
