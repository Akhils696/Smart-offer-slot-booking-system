using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Data.Configurations;

public sealed class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("bookings");
        builder.HasKey(booking => booking.Id);

        builder.Property(booking => booking.ReferenceCode).HasMaxLength(32).IsRequired();
        builder.Property(booking => booking.Status).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.Property(booking => booking.CreatedAt).IsRequired();
        builder.Property(booking => booking.UpdatedAt).IsRequired();

        builder.HasIndex(booking => booking.ReferenceCode).IsUnique();
        builder.HasIndex(booking => new { booking.UserId, booking.OfferSlotId });

        builder.HasOne(booking => booking.User)
            .WithMany(user => user.Bookings)
            .HasForeignKey(booking => booking.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(booking => booking.OfferSlot)
            .WithMany(slot => slot.Bookings)
            .HasForeignKey(booking => booking.OfferSlotId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
