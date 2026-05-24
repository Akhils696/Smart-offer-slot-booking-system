using Microsoft.EntityFrameworkCore;
using SmartOfferBookingSystem.Data.Context;
using SmartOfferBookingSystem.DTOs.Bookings;
using SmartOfferBookingSystem.Interfaces;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Services;

public sealed class BookingService(
    AppDbContext dbContext,
    IDateTimeProvider clock,
    ILogger<BookingService> logger)
{
    public async Task<IReadOnlyCollection<BookingSummaryDto>> ListAsync(
        Guid userId,
        UserRole role,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Bookings
            .AsNoTracking()
            .Include(b => b.OfferSlot)
            .ThenInclude(s => s.Offer)
            .ThenInclude(o => o.Business)
            .AsQueryable();

        if (role == UserRole.BusinessOwner)
        {
            query = query.Where(b => b.OfferSlot.Offer.Business.OwnerId == userId);
        }

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);

        return items.Select(b => ToSummary(b)).ToList();
    }

    public async Task<BookingSummaryDto> CreateAsync(
        CreateBookingRequestDto request,
        Guid? userId,
        CancellationToken cancellationToken)
    {
        var customerEmail = request.CustomerEmail.Trim().ToLowerInvariant();

        // 1. Idempotency Protection: Check for rapid duplicate bookings (2-minute window)
        var recentCutoff = clock.UtcNow.AddMinutes(-2);
        var duplicateExists = await dbContext.Bookings.AnyAsync(b =>
            b.CustomerEmail == customerEmail &&
            b.OfferSlotId == request.OfferSlotId &&
            b.Status != BookingStatus.Cancelled &&
            b.CreatedAt >= recentCutoff,
            cancellationToken);

        if (duplicateExists)
        {
            logger.LogWarning("Duplicate booking attempt rejected for {Email} on slot {SlotId}", customerEmail, request.OfferSlotId);
            throw new InvalidOperationException("A duplicate booking attempt was detected. Please wait 2 minutes before retrying.");
        }

        // 2. Transaction Boundary for Concurrency Verification
        using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var slot = await dbContext.OfferSlots
                .Include(s => s.Bookings)
                .Include(s => s.Offer)
                .ThenInclude(o => o.Business)
                .SingleOrDefaultAsync(s => s.Id == request.OfferSlotId, cancellationToken);

            if (slot is null)
            {
                throw new InvalidOperationException("Offer slot not found.");
            }

            if (slot.EndsAt <= clock.UtcNow)
            {
                throw new InvalidOperationException("This slot has expired and cannot be reserved.");
            }

            if (slot.Offer.Status != OfferStatus.Active)
            {
                throw new InvalidOperationException("Bookings can only be made on active offers.");
            }

            var activeBookingsCount = slot.Bookings.Count(b => b.Status != BookingStatus.Cancelled);
            var available = slot.Capacity - activeBookingsCount;

            if (available < 1)
            {
                throw new InvalidOperationException("This slot is fully booked. Please choose a different slot.");
            }

            var now = clock.UtcNow;
            var referenceCode = $"REF-{GenerateRandomCode(8)}";

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                OfferSlotId = slot.Id,
                CustomerName = request.CustomerName.Trim(),
                CustomerEmail = customerEmail,
                ReferenceCode = referenceCode,
                Status = BookingStatus.Confirmed,
                CreatedAt = now,
                UpdatedAt = now
            };

            // 3. Concurrency-Safe Trigger: Explicitly modify and update slot updated timestamp
            // This forces EF Core to issue an UPDATE slot query checking the rowversion token.
            slot.UpdatedAt = now;
            dbContext.OfferSlots.Update(slot);

            dbContext.Bookings.Add(booking);

            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            logger.LogInformation("Booking successfully created with reference {Ref} for slot {SlotId}", referenceCode, slot.Id);

            booking.OfferSlot = slot;
            return ToSummary(booking);
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(cancellationToken);
            logger.LogWarning("Concurrency collision detected on slot reservation for {SlotId}", request.OfferSlotId);
            throw new InvalidOperationException("This slot was just reserved by another customer. Please choose a different slot.");
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<BookingSummaryDto> UpdateStatusAsync(
        Guid bookingId,
        Guid userId,
        UserRole role,
        UpdateBookingStatusDto request,
        CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<BookingStatus>(request.Status, true, out var parsedStatus))
        {
            throw new InvalidOperationException("Invalid booking status provided.");
        }

        using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var booking = await dbContext.Bookings
                .Include(b => b.OfferSlot)
                .ThenInclude(s => s.Offer)
                .ThenInclude(o => o.Business)
                .SingleOrDefaultAsync(b => b.Id == bookingId, cancellationToken);

            if (booking is null)
            {
                throw new InvalidOperationException("Booking record not found.");
            }

            if (role == UserRole.BusinessOwner && booking.OfferSlot.Offer.Business.OwnerId != userId)
            {
                throw new InvalidOperationException("You do not have permission to modify this booking.");
            }

            booking.Status = parsedStatus;
            booking.UpdatedAt = clock.UtcNow;

            // Trigger inventory synchronization: Update slot updated timestamp when cancelling
            booking.OfferSlot.UpdatedAt = clock.UtcNow;
            dbContext.OfferSlots.Update(booking.OfferSlot);

            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            logger.LogInformation("Booking status updated to {Status} for booking {Id}", parsedStatus, bookingId);
            return ToSummary(booking);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private static string GenerateRandomCode(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    private BookingSummaryDto ToSummary(Booking booking) =>
        new(
            booking.Id,
            booking.UserId,
            booking.OfferSlotId,
            booking.CustomerName,
            booking.CustomerEmail,
            booking.ReferenceCode,
            booking.Status.ToString(),
            booking.OfferSlot.StartsAt,
            booking.OfferSlot.EndsAt,
            booking.OfferSlot.Offer.Title,
            booking.OfferSlot.Offer.Business.Name,
            booking.CreatedAt
        );
}
