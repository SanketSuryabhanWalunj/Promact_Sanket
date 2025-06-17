using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class AddOnlineExamRealatedColumnsInEnrollmentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExamType",
                table: "UserCourseEnrollments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLiveExamDateApproved",
                table: "UserCourseEnrollments",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LiveExamDate",
                table: "UserCourseEnrollments",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "LiveExamMarkes",
                table: "UserCourseEnrollments",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExamType",
                table: "UserCourseEnrollments");

            migrationBuilder.DropColumn(
                name: "IsLiveExamDateApproved",
                table: "UserCourseEnrollments");

            migrationBuilder.DropColumn(
                name: "LiveExamDate",
                table: "UserCourseEnrollments");

            migrationBuilder.DropColumn(
                name: "LiveExamMarkes",
                table: "UserCourseEnrollments");
        }
    }
}
