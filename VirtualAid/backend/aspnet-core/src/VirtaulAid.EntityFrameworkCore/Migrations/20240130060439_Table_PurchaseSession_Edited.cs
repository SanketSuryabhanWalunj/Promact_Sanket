using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class TablePurchaseSessionEdited : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "PurchaseSessions");

            migrationBuilder.DropColumn(
                name: "CourseId",
                table: "PurchaseSessions");

            migrationBuilder.DropColumn(
                name: "ExamType",
                table: "PurchaseSessions");

            migrationBuilder.DropColumn(
                name: "NoOfCourses",
                table: "PurchaseSessions");

            migrationBuilder.DropColumn(
                name: "PlanType",
                table: "PurchaseSessions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "PurchaseSessions");

            migrationBuilder.CreateTable(
                name: "PurchaseSessionDetail",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    CourseId = table.Column<string>(type: "text", nullable: false),
                    ExamType = table.Column<string>(type: "text", nullable: false),
                    CourseName = table.Column<string>(type: "text", nullable: false),
                    CourseDescription = table.Column<string>(type: "text", nullable: false),
                    UnitAmount = table.Column<double>(type: "double precision", nullable: false),
                    PlanType = table.Column<string>(type: "text", nullable: false),
                    PurchaseSessionId = table.Column<string>(type: "text", nullable: true),
                    ExtraProperties = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseSessionDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseSessionDetail_PurchaseSessions_PurchaseSessionId",
                        column: x => x.PurchaseSessionId,
                        principalTable: "PurchaseSessions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseSessionDetail_PurchaseSessionId",
                table: "PurchaseSessionDetail",
                column: "PurchaseSessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PurchaseSessionDetail");

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyId",
                table: "PurchaseSessions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CourseId",
                table: "PurchaseSessions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "ExamType",
                table: "PurchaseSessions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "NoOfCourses",
                table: "PurchaseSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PlanType",
                table: "PurchaseSessions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "PurchaseSessions",
                type: "uuid",
                nullable: true);
        }
    }
}
