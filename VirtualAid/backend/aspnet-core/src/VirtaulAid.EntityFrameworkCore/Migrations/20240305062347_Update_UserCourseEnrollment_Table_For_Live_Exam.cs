using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserCourseEnrollmentTableForLiveExam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsLiveExamCompleted",
                table: "UserCourseEnrollments",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LiveExamDateApprovedDate",
                table: "UserCourseEnrollments",
                type: "timestamp without time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsLiveExamCompleted",
                table: "UserCourseEnrollments");

            migrationBuilder.DropColumn(
                name: "LiveExamDateApprovedDate",
                table: "UserCourseEnrollments");
        }
    }
}
