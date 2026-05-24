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
        var customerEmail = string.IsNullOrWhiteSpace(request.CustomerEmail) ? null : request.CustomerEmail.Trim().ToLowerInvariant();
        var customerPhone = request.CustomerPhone.Trim();

        // 1. Idempotency Protection: Check for rapid duplicate bookings (2-minute window)
        var recentCutoff = clock.UtcNow.AddMinutes(-2);
        var duplicateExists = await dbContext.Bookings.AnyAsync(b =>
            (customerEmail != null && b.CustomerEmail == customerEmail || b.CustomerPhone == customerPhone) &&
            b.OfferSlotId == request.OfferSlotId &&
            b.Status != BookingStatus.Cancelled &&
            b.CreatedAt >= recentCutoff,
            cancellationToken);

        if (duplicateExists)
        {
            logger.LogWarning("Duplicate booking attempt rejected for {Phone} / {Email} on slot {SlotId}", customerPhone, customerEmail, request.OfferSlotId);
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

            if (slot.EndsAt <= clock.UtcNow || slot.Offer.EndsAt <= clock.UtcNow)
            {
                throw new InvalidOperationException("This slot has expired and cannot be reserved.");
            }

            if (slot.Offer.Status != OfferStatus.Active)
            {
                throw new InvalidOperationException("Bookings can only be made on active offers.");
            }

            // Enforce max bookings limit per customer phone number
            var activeBookingsForPhone = await dbContext.Bookings
                .CountAsync(b =>
                    b.CustomerPhone == customerPhone &&
                    b.OfferSlot.OfferId == slot.OfferId &&
                    b.Status != BookingStatus.Cancelled,
                    cancellationToken);

            if (activeBookingsForPhone >= slot.Offer.MaxBookingPerCustomer)
            {
                throw new InvalidOperationException($"You have reached the maximum booking limit of {slot.Offer.MaxBookingPerCustomer} for this offer.");
            }

            var activeBookingsCount = slot.Bookings.Where(b => b.Status != BookingStatus.Cancelled).Sum(b => b.PeopleCount);
            var available = slot.Capacity - activeBookingsCount;

            if (available < request.PeopleCount)
            {
                throw new InvalidOperationException($"This slot does not have enough remaining capacity. Requested: {request.PeopleCount}, Available: {available}.");
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
                CustomerPhone = customerPhone,
                PeopleCount = request.PeopleCount,
                SpecialNote = string.IsNullOrWhiteSpace(request.SpecialNote) ? null : request.SpecialNote.Trim(),
                ReferenceCode = referenceCode,
                Status = BookingStatus.Confirmed,
                CreatedAt = now,
                UpdatedAt = now
            };

            // Increment slot booked count
            slot.BookedCount += request.PeopleCount;
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

    public async Task<BookingSummaryDto> GetByIdAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        var booking = await dbContext.Bookings
            .AsNoTracking()
            .Include(b => b.OfferSlot)
            .ThenInclude(s => s.Offer)
            .ThenInclude(o => o.Business)
            .SingleOrDefaultAsync(b => b.Id == bookingId, cancellationToken);

        if (booking is null)
        {
            throw new SmartOfferBookingSystem.Exceptions.NotFoundException("Booking not found.");
        }

        return ToSummary(booking);
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

            var oldStatus = booking.Status;
            booking.Status = parsedStatus;
            booking.UpdatedAt = clock.UtcNow;

            // Handle BookedCount adjustments on slot based on status transition
            if (parsedStatus == BookingStatus.Cancelled && oldStatus != BookingStatus.Cancelled)
            {
                booking.OfferSlot.BookedCount = Math.Max(0, booking.OfferSlot.BookedCount - booking.PeopleCount);
            }
            else if (oldStatus == BookingStatus.Cancelled && parsedStatus != BookingStatus.Cancelled)
            {
                booking.OfferSlot.BookedCount += booking.PeopleCount;
            }

            booking.OfferSlot.UpdatedAt = clock.UtcNow;
            dbContext.OfferSlots.Update(booking.OfferSlot);

            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            logger.LogInformation("Booking status updated from {OldStatus} to {Status} for booking {Id}", oldStatus, parsedStatus, bookingId);
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
        var bytes = new byte[length];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }
        return new string(bytes.Select(b => chars[b % chars.Length]).ToArray());
    }

    private BookingSummaryDto ToSummary(Booking booking) =>
        new(
            booking.Id,
            booking.UserId,
            booking.OfferSlotId,
            booking.CustomerName,
            booking.CustomerEmail,
            booking.CustomerPhone,
            booking.PeopleCount,
            booking.SpecialNote,
            booking.ReferenceCode,
            booking.Status.ToString(),
            booking.OfferSlot.StartsAt,
            booking.OfferSlot.EndsAt,
            booking.OfferSlot.Offer.Title,
            booking.OfferSlot.Offer.Business.Name,
            booking.CreatedAt
        );
}
