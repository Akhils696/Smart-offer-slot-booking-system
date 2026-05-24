using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartOfferBookingSystem.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOfferSlotConcurrencyToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "offer_slots",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "xmin",
                table: "offer_slots");
        }
    }
}
