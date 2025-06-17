﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITrainer.Migrations
{
    /// <inheritdoc />
    public partial class AdjustsInternCareerPathRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CareerPath",
                table: "Intern",
                newName: "CareerPathId");

            migrationBuilder.CreateIndex(
                name: "IX_Intern_CareerPathId",
                table: "Intern",
                column: "CareerPathId");

            migrationBuilder.AddForeignKey(
                name: "FK_Intern_CareerPaths_CareerPathId",
                table: "Intern",
                column: "CareerPathId",
                principalTable: "CareerPaths",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Intern_CareerPaths_CareerPathId",
                table: "Intern");

            migrationBuilder.DropIndex(
                name: "IX_Intern_CareerPathId",
                table: "Intern");

            migrationBuilder.RenameColumn(
                name: "CareerPathId",
                table: "Intern",
                newName: "CareerPath");
        }
    }
}
