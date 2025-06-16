using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LakePulse.Migrations
{
    /// <inheritdoc />
    public partial class Add_feature_table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "features",
                columns: table => new
                {
                    feature_id = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: true),
                    order_in_category = table.Column<int>(type: "integer", nullable: true),
                    label = table.Column<string>(type: "text", nullable: true),
                    units = table.Column<string>(type: "text", nullable: true),
                    data_type = table.Column<string>(type: "text", nullable: true),
                    data_source = table.Column<string>(type: "text", nullable: true),
                    measurement_characteristic_id = table.Column<string>(type: "text", nullable: true),
                    field_id = table.Column<string>(type: "text", nullable: true),
                    editable = table.Column<int>(type: "integer", nullable: true),
                    lower_limit = table.Column<double>(type: "double precision", nullable: true),
                    upper_limit = table.Column<double>(type: "double precision", nullable: true),
                    bound_type = table.Column<char>(type: "character(1)", nullable: true),
                    lower_bound = table.Column<double>(type: "double precision", nullable: true),
                    upper_bound = table.Column<double>(type: "double precision", nullable: true),
                    allowed_categories = table.Column<string>(type: "text", nullable: true),
                    decimal_rounding = table.Column<int>(type: "integer", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_features", x => x.feature_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "features");
        }
    }
}
