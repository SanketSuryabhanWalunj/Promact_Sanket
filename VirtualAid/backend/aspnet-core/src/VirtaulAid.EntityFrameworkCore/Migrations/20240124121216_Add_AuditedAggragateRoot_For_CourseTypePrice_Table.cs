using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditedAggragateRootForCourseTypePriceTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ConcurrencyStamp",
                table: "CourseTypePrices",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreationTime",
                table: "CourseTypePrices",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatorId",
                table: "CourseTypePrices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExtraProperties",
                table: "CourseTypePrices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModificationTime",
                table: "CourseTypePrices",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LastModifierId",
                table: "CourseTypePrices",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConcurrencyStamp",
                table: "CourseTypePrices");

            migrationBuilder.DropColumn(
                name: "CreationTime",
                table: "CourseTypePrices");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "CourseTypePrices");

            migrationBuilder.DropColumn(
                name: "ExtraProperties",
                table: "CourseTypePrices");

            migrationBuilder.DropColumn(
                name: "LastModificationTime",
                table: "CourseTypePrices");

            migrationBuilder.DropColumn(
                name: "LastModifierId",
                table: "CourseTypePrices");
        }
    }
}
