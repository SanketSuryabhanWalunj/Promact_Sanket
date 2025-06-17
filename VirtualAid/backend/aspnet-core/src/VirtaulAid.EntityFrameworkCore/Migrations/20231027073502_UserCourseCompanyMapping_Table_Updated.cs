using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class UserCourseCompanyMappingTableUpdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExpirationDate",
                table: "UserCourseCompanyMappings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpirationDateTimeStamp",
                table: "UserCourseCompanyMappings",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "PurchaseDate",
                table: "UserCourseCompanyMappings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "PurchaseDateTimeStamp",
                table: "UserCourseCompanyMappings",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpirationDate",
                table: "UserCourseCompanyMappings");

            migrationBuilder.DropColumn(
                name: "ExpirationDateTimeStamp",
                table: "UserCourseCompanyMappings");

            migrationBuilder.DropColumn(
                name: "PurchaseDate",
                table: "UserCourseCompanyMappings");

            migrationBuilder.DropColumn(
                name: "PurchaseDateTimeStamp",
                table: "UserCourseCompanyMappings");
        }
    }
}
