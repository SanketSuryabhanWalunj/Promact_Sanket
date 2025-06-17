using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class AddVRRelatedFieldsInOtpTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VirtualRealityOtpCode",
                table: "Otps",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VirtualRealityOtpCodeCreationTime",
                table: "Otps",
                type: "timestamp without time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VirtualRealityOtpCode",
                table: "Otps");

            migrationBuilder.DropColumn(
                name: "VirtualRealityOtpCodeCreationTime",
                table: "Otps");
        }
    }
}
