using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class TablePurchaseSessionDetailAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseSessionDetail_PurchaseSessions_PurchaseSessionId",
                table: "PurchaseSessionDetail");

            migrationBuilder.DropTable(
                name: "PurchaseSessions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PurchaseSessionDetail",
                table: "PurchaseSessionDetail");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseSessionDetail_PurchaseSessionId",
                table: "PurchaseSessionDetail");

            migrationBuilder.DropColumn(
                name: "PurchaseSessionId",
                table: "PurchaseSessionDetail");

            migrationBuilder.RenameTable(
                name: "PurchaseSessionDetail",
                newName: "PurchaseSessionDetails");

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "PurchaseSessionDetails",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SessionId",
                table: "PurchaseSessionDetails",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PurchaseSessionDetails",
                table: "PurchaseSessionDetails",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PurchaseSessionDetails",
                table: "PurchaseSessionDetails");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "PurchaseSessionDetails");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "PurchaseSessionDetails");

            migrationBuilder.RenameTable(
                name: "PurchaseSessionDetails",
                newName: "PurchaseSessionDetail");

            migrationBuilder.AddColumn<string>(
                name: "PurchaseSessionId",
                table: "PurchaseSessionDetail",
                type: "text",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PurchaseSessionDetail",
                table: "PurchaseSessionDetail",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "PurchaseSessions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uuid", nullable: true),
                    DeleterId = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ExtraProperties = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LastModificationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uuid", nullable: true),
                    SessionId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseSessions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseSessionDetail_PurchaseSessionId",
                table: "PurchaseSessionDetail",
                column: "PurchaseSessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseSessionDetail_PurchaseSessions_PurchaseSessionId",
                table: "PurchaseSessionDetail",
                column: "PurchaseSessionId",
                principalTable: "PurchaseSessions",
                principalColumn: "Id");
        }
    }
}
