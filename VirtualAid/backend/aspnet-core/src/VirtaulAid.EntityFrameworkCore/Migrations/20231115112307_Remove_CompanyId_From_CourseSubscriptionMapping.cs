using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCompanyIdFromCourseSubscriptionMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseSubscriptionMappings_Companies_CompanyId",
                table: "CourseSubscriptionMappings");

            migrationBuilder.DropIndex(
                name: "IX_CourseSubscriptionMappings_CompanyId",
                table: "CourseSubscriptionMappings");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "CourseSubscriptionMappings");

            migrationBuilder.AddColumn<Guid>(
                name: "CompanysId",
                table: "CourseSubscriptionMappings",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseSubscriptionMappings_CompanysId",
                table: "CourseSubscriptionMappings",
                column: "CompanysId");

            migrationBuilder.AddForeignKey(
                name: "FK_CourseSubscriptionMappings_Companies_CompanysId",
                table: "CourseSubscriptionMappings",
                column: "CompanysId",
                principalTable: "Companies",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseSubscriptionMappings_Companies_CompanysId",
                table: "CourseSubscriptionMappings");

            migrationBuilder.DropIndex(
                name: "IX_CourseSubscriptionMappings_CompanysId",
                table: "CourseSubscriptionMappings");

            migrationBuilder.DropColumn(
                name: "CompanysId",
                table: "CourseSubscriptionMappings");

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyId",
                table: "CourseSubscriptionMappings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_CourseSubscriptionMappings_CompanyId",
                table: "CourseSubscriptionMappings",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_CourseSubscriptionMappings_Companies_CompanyId",
                table: "CourseSubscriptionMappings",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
