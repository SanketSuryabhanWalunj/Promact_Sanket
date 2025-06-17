using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LakePulse.Migrations
{
    /// <inheritdoc />
    public partial class Add_FieldNoteLikes_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FieldNoteId",
                table: "FieldNote",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsReplay",
                table: "FieldNote",
                type: "boolean",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FieldNoteLike",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    FieldNoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldNoteLike", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FieldNoteLike_FieldNote_FieldNoteId",
                        column: x => x.FieldNoteId,
                        principalTable: "FieldNote",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FieldNote_FieldNoteId",
                table: "FieldNote",
                column: "FieldNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldNoteLike_FieldNoteId",
                table: "FieldNoteLike",
                column: "FieldNoteId");

            migrationBuilder.AddForeignKey(
                name: "FK_FieldNote_FieldNote_FieldNoteId",
                table: "FieldNote",
                column: "FieldNoteId",
                principalTable: "FieldNote",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FieldNote_FieldNote_FieldNoteId",
                table: "FieldNote");

            migrationBuilder.DropTable(
                name: "FieldNoteLike");

            migrationBuilder.DropIndex(
                name: "IX_FieldNote_FieldNoteId",
                table: "FieldNote");

            migrationBuilder.DropColumn(
                name: "FieldNoteId",
                table: "FieldNote");

            migrationBuilder.DropColumn(
                name: "IsReplay",
                table: "FieldNote");
        }
    }
}
