using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class Removeunwantedcolumns_PunchRecordRequests_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPunchLogRequest",
                table: "PunchRecords");

            migrationBuilder.DropColumn(
                name: "IsRequest",
                table: "PunchRecords");

            migrationBuilder.DropColumn(
                name: "RequestDate",
                table: "PunchRecords");

            migrationBuilder.DropColumn(
                name: "RequestReason",
                table: "PunchRecords");

            migrationBuilder.DropColumn(
                name: "RequestStatus",
                table: "PunchRecords");

            migrationBuilder.DropColumn(
                name: "PunchLogCategory",
                table: "PunchLogTimes");

            migrationBuilder.DropColumn(
                name: "PunchStatus",
                table: "PunchLogTimes");

            migrationBuilder.RenameColumn(
                name: "IsPunchLogRequest",
                table: "PunchLogTimes",
                newName: "IsPunchLogin");

            migrationBuilder.AddColumn<bool>(
                name: "IsPunchLogOut",
                table: "PunchLogTimes",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPunchLogOut",
                table: "PunchLogTimes");

            migrationBuilder.RenameColumn(
                name: "IsPunchLogin",
                table: "PunchLogTimes",
                newName: "IsPunchLogRequest");

            migrationBuilder.AddColumn<bool>(
                name: "IsPunchLogRequest",
                table: "PunchRecords",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsRequest",
                table: "PunchRecords",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "RequestDate",
                table: "PunchRecords",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestReason",
                table: "PunchRecords",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestStatus",
                table: "PunchRecords",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PunchLogCategory",
                table: "PunchLogTimes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PunchStatus",
                table: "PunchLogTimes",
                type: "text",
                nullable: true);
        }
    }
}
