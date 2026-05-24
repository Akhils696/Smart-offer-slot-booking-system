using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Data.Configurations;

public sealed class OfferSlotConfiguration : IEntityTypeConfiguration<OfferSlot>
{
    public void Configure(EntityTypeBuilder<OfferSlot> builder)
    {
        builder.ToTable("offer_slots");
        builder.HasKey(slot => slot.Id);

        builder.Property(slot => slot.StartsAt).IsRequired();
        builder.Property(slot => slot.EndsAt).IsRequired();
        builder.Property(slot => slot.Capacity).IsRequired();
        builder.Property(slot => slot.CreatedAt).IsRequired();
        builder.Property(slot => slot.UpdatedAt).IsRequired();

        builder.HasIndex(slot => new { slot.OfferId, slot.StartsAt });

        builder.HasOne(slot => slot.Offer)
            .WithMany(offer => offer.Slots)
            .HasForeignKey(slot => slot.OfferId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
