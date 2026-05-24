using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Data.Configurations;

public sealed class OfferConfiguration : IEntityTypeConfiguration<Offer>
{
    public void Configure(EntityTypeBuilder<Offer> builder)
    {
        builder.ToTable("offers");
        builder.HasKey(offer => offer.Id);

                builder.Property(offer => offer.Title).HasMaxLength(220).IsRequired();
        builder.Property(offer => offer.Description).HasMaxLength(1600);
        builder.Property(offer => offer.OriginalPrice).HasPrecision(10, 2);
        builder.Property(offer => offer.OfferPrice).HasPrecision(10, 2);
        
        // New Hackathon fields
        builder.Property(offer => offer.Category).HasMaxLength(100).IsRequired();
        builder.Property(offer => offer.DiscountPercentage).HasPrecision(5, 2).IsRequired();
        builder.Property(offer => offer.TermsAndConditions).HasMaxLength(2000);
        builder.Property(offer => offer.MaxBookingPerCustomer).HasDefaultValue(1).IsRequired();

        builder.Property(offer => offer.Status).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.Property(offer => offer.StartsAt).IsRequired();
        builder.Property(offer => offer.EndsAt).IsRequired();
        builder.Property(offer => offer.CreatedAt).IsRequired();
        builder.Property(offer => offer.UpdatedAt).IsRequired();

        builder.HasOne(offer => offer.Business)
            .WithMany(business => business.Offers)
            .HasForeignKey(offer => offer.BusinessId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
