using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdColumnInPurchaseDetailTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseDetails_Companies_CompanyId",
                table: "PurchaseDetails");

            migrationBuilder.AlterColumn<Guid>(
                name: "CompanyId",
                table: "PurchaseDetails",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "PurchaseDetails",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseDetails_UserId",
                table: "PurchaseDetails",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseDetails_Companies_CompanyId",
                table: "PurchaseDetails",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseDetails_UserDetails_UserId",
                table: "PurchaseDetails",
                column: "UserId",
                principalTable: "UserDetails",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseDetails_Companies_CompanyId",
                table: "PurchaseDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseDetails_UserDetails_UserId",
                table: "PurchaseDetails");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseDetails_UserId",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "PurchaseDetails");

            migrationBuilder.AlterColumn<Guid>(
                name: "CompanyId",
                table: "PurchaseDetails",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseDetails_Companies_CompanyId",
                table: "PurchaseDetails",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
