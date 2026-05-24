using Microsoft.EntityFrameworkCore;
using SmartOfferBookingSystem.Data.Context;
using SmartOfferBookingSystem.Interfaces;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Data.Seed;

public sealed class DevelopmentDataSeeder(
    AppDbContext dbContext,
    IPasswordService passwordService,
    IDateTimeProvider clock,
    ILogger<DevelopmentDataSeeder> logger)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.Database.MigrateAsync(cancellationToken);

        if (await dbContext.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var now = clock.UtcNow;
        var admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Platform Admin",
            Email = "admin@smartoffer.local",
            Role = UserRole.Admin,
            CreatedAt = now,
            UpdatedAt = now
        };

        admin.PasswordHash = passwordService.HashPassword(admin, "Admin@12345");

        dbContext.Users.Add(admin);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Seeded development admin user {Email}", admin.Email);
    }
}
