using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Data.Configurations;

public sealed class BusinessConfiguration : IEntityTypeConfiguration<Business>
{
    public void Configure(EntityTypeBuilder<Business> builder)
    {
        builder.ToTable("businesses");
        builder.HasKey(business => business.Id);

        builder.Property(business => business.Name).HasMaxLength(180).IsRequired();
        builder.Property(business => business.Slug).HasMaxLength(220).IsRequired();
        builder.Property(business => business.Description).HasMaxLength(1200);
        builder.Property(business => business.PhoneNumber).HasMaxLength(40);
        builder.Property(business => business.CreatedAt).IsRequired();
        builder.Property(business => business.UpdatedAt).IsRequired();

        builder.HasIndex(business => business.Slug).IsUnique();

        builder.HasOne(business => business.Owner)
            .WithMany(user => user.Businesses)
            .HasForeignKey(business => business.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
