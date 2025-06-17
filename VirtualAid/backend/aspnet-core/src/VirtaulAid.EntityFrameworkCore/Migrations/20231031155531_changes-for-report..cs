using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class changesforreport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CreatedDate",
                table: "CourseSubscriptionMappings",
                newName: "PurchasedDate");

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpirationDate",
                table: "CourseSubscriptionMappings",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpirationDate",
                table: "CourseSubscriptionMappings");

            migrationBuilder.RenameColumn(
                name: "PurchasedDate",
                table: "CourseSubscriptionMappings",
                newName: "CreatedDate");
        }
    }
}
