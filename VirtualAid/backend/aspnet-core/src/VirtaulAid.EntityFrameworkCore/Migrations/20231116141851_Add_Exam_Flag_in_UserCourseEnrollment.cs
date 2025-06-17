using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class AddExamFlaginUserCourseEnrollment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "Progress",
                table: "UserCourseEnrollments",
                type: "double precision",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<Guid>(
                name: "CurrentLessonId",
                table: "UserCourseEnrollments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CurrentModuleId",
                table: "UserCourseEnrollments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "CurrentModulePorgress",
                table: "UserCourseEnrollments",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<bool>(
                name: "IsExamConducted",
                table: "UserCourseEnrollments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ContentTitle",
                table: "Contents",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentLessonId",
                table: "UserCourseEnrollments");

            migrationBuilder.DropColumn(
                name: "CurrentModuleId",
                table: "UserCourseEnrollments");

            migrationBuilder.DropColumn(
                name: "CurrentModulePorgress",
                table: "UserCourseEnrollments");

            migrationBuilder.DropColumn(
                name: "IsExamConducted",
                table: "UserCourseEnrollments");

            migrationBuilder.DropColumn(
                name: "ContentTitle",
                table: "Contents");

            migrationBuilder.AlterColumn<int>(
                name: "Progress",
                table: "UserCourseEnrollments",
                type: "integer",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "double precision");
        }
    }
}
