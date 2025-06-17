using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VirtaulAid.Migrations
{
    /// <inheritdoc />
    public partial class changesinpurhaseDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InvoiceId",
                table: "PurchaseDetails",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InvoiceMasterLink",
                table: "PurchaseDetails",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InvoicePdfLink",
                table: "PurchaseDetails",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvoiceId",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "InvoiceMasterLink",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "InvoicePdfLink",
                table: "PurchaseDetails");
        }
    }
}
