using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LakePulse.Migrations
{
    /// <inheritdoc />
    public partial class Change_Lake_Subsciption_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "variantId",
                table: "LakeSubscription",
                newName: "VariantId");

            migrationBuilder.RenameColumn(
                name: "userId",
                table: "LakeSubscription",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "totalPrice",
                table: "LakeSubscription",
                newName: "TotalPrice");

            migrationBuilder.RenameColumn(
                name: "subscriptionEndDate",
                table: "LakeSubscription",
                newName: "SubscriptionEndDate");

            migrationBuilder.RenameColumn(
                name: "productPrice",
                table: "LakeSubscription",
                newName: "ProductPrice");

            migrationBuilder.RenameColumn(
                name: "productName",
                table: "LakeSubscription",
                newName: "ProductName");

            migrationBuilder.RenameColumn(
                name: "productId",
                table: "LakeSubscription",
                newName: "ProductId");

            migrationBuilder.RenameColumn(
                name: "orderId",
                table: "LakeSubscription",
                newName: "OrderId");

            migrationBuilder.RenameColumn(
                name: "lakeId",
                table: "LakeSubscription",
                newName: "LakeId");

            migrationBuilder.RenameColumn(
                name: "customerEmail",
                table: "LakeSubscription",
                newName: "CustomerEmail");

            migrationBuilder.RenameColumn(
                name: "currency",
                table: "LakeSubscription",
                newName: "Currency");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "VariantId",
                table: "LakeSubscription",
                newName: "variantId");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "LakeSubscription",
                newName: "userId");

            migrationBuilder.RenameColumn(
                name: "TotalPrice",
                table: "LakeSubscription",
                newName: "totalPrice");

            migrationBuilder.RenameColumn(
                name: "SubscriptionEndDate",
                table: "LakeSubscription",
                newName: "subscriptionEndDate");

            migrationBuilder.RenameColumn(
                name: "ProductPrice",
                table: "LakeSubscription",
                newName: "productPrice");

            migrationBuilder.RenameColumn(
                name: "ProductName",
                table: "LakeSubscription",
                newName: "productName");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                table: "LakeSubscription",
                newName: "productId");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "LakeSubscription",
                newName: "orderId");

            migrationBuilder.RenameColumn(
                name: "LakeId",
                table: "LakeSubscription",
                newName: "lakeId");

            migrationBuilder.RenameColumn(
                name: "CustomerEmail",
                table: "LakeSubscription",
                newName: "customerEmail");

            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "LakeSubscription",
                newName: "currency");
        }
    }
}
