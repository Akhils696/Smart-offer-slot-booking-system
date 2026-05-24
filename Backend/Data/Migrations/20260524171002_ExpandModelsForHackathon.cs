using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartOfferBookingSystem.Data.Migrations
{
    /// <inheritdoc />
    public partial class ExpandModelsForHackathon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "offers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPercentage",
                table: "offers",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "MaxBookingPerCustomer",
                table: "offers",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "TermsAndConditions",
                table: "offers",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BookedCount",
                table: "offer_slots",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "businesses",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BusinessType",
                table: "businesses",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "businesses",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ClosingTime",
                table: "businesses",
                type: "character varying(5)",
                maxLength: 5,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "businesses",
                type: "character varying(220)",
                maxLength: 220,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "businesses",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OpeningTime",
                table: "businesses",
                type: "character varying(5)",
                maxLength: 5,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OwnerName",
                table: "businesses",
                type: "character varying(180)",
                maxLength: 180,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "businesses",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "CustomerEmail",
                table: "bookings",
                type: "character varying(220)",
                maxLength: 220,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(220)",
                oldMaxLength: 220);

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                table: "bookings",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PeopleCount",
                table: "bookings",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "SpecialNote",
                table: "bookings",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_bookings_CustomerEmail_OfferSlotId_CreatedAt",
                table: "bookings",
                columns: new[] { "CustomerEmail", "OfferSlotId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_bookings_CustomerPhone_OfferSlotId",
                table: "bookings",
                columns: new[] { "CustomerPhone", "OfferSlotId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_bookings_CustomerEmail_OfferSlotId_CreatedAt",
                table: "bookings");

            migrationBuilder.DropIndex(
                name: "IX_bookings_CustomerPhone_OfferSlotId",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "offers");

            migrationBuilder.DropColumn(
                name: "DiscountPercentage",
                table: "offers");

            migrationBuilder.DropColumn(
                name: "MaxBookingPerCustomer",
                table: "offers");

            migrationBuilder.DropColumn(
                name: "TermsAndConditions",
                table: "offers");

            migrationBuilder.DropColumn(
                name: "BookedCount",
                table: "offer_slots");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "BusinessType",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "City",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "ClosingTime",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "OpeningTime",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "OwnerName",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "PeopleCount",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "SpecialNote",
                table: "bookings");

            migrationBuilder.AlterColumn<string>(
                name: "CustomerEmail",
                table: "bookings",
                type: "character varying(220)",
                maxLength: 220,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(220)",
                oldMaxLength: 220,
                oldNullable: true);
        }
    }
}
