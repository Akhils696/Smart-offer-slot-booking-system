using Microsoft.EntityFrameworkCore;
using SmartOfferBookingSystem.Data.Context;
using SmartOfferBookingSystem.DTOs.Slots;
using SmartOfferBookingSystem.Interfaces;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Services;

public sealed class SlotService(
    AppDbContext dbContext,
    IDateTimeProvider clock)
{
    public async Task<IReadOnlyCollection<SlotSummaryDto>> ListAsync(Guid offerId, CancellationToken cancellationToken)
    {
        var offerExists = await dbContext.Offers.AnyAsync(o => o.Id == offerId, cancellationToken);
        if (!offerExists)
        {
            throw new InvalidOperationException("Offer not found.");
        }

        var slots = await dbContext.OfferSlots
            .AsNoTracking()
            .Where(slot => slot.OfferId == offerId)
            .Include(slot => slot.Bookings)
            .OrderBy(slot => slot.StartsAt)
            .ToListAsync(cancellationToken);

        return slots.Select(slot => ToSummary(slot)).ToList();
    }

    public async Task<SlotSummaryDto> CreateAsync(
        Guid userId,
        UserRole role,
        UpsertSlotRequestDto request,
        CancellationToken cancellationToken)
    {
        var offer = await dbContext.Offers
            .Include(o => o.Business)
            .SingleOrDefaultAsync(o => o.Id == request.OfferId, cancellationToken);

        if (offer is null)
        {
            throw new InvalidOperationException("Offer not found.");
        }

        if (role == UserRole.BusinessOwner && offer.Business.OwnerId != userId)
        {
            throw new InvalidOperationException("You do not have permission to manage slots for this offer.");
        }

        // Integrity Rule: Must fit inside Offer lifetime range
        if (request.StartsAt < offer.StartsAt || request.EndsAt > offer.EndsAt)
        {
            throw new InvalidOperationException($"Slot time must be within parent offer range ({offer.StartsAt:g} to {offer.EndsAt:g}).");
        }

        var now = clock.UtcNow;
        var slot = new OfferSlot
        {
            Id = Guid.NewGuid(),
            OfferId = offer.Id,
            StartsAt = request.StartsAt,
            EndsAt = request.EndsAt,
            Capacity = request.Capacity,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.OfferSlots.Add(slot);
        await dbContext.SaveChangesAsync(cancellationToken);

        slot.Offer = offer;
        return ToSummary(slot);
    }

    public async Task<SlotSummaryDto> UpdateAsync(
        Guid slotId,
        Guid userId,
        UserRole role,
        UpsertSlotRequestDto request,
        CancellationToken cancellationToken)
    {
        var slot = await dbContext.OfferSlots
            .Include(s => s.Bookings)
            .Include(s => s.Offer)
            .ThenInclude(o => o.Business)
            .SingleOrDefaultAsync(s => s.Id == slotId, cancellationToken);

        if (slot is null)
        {
            throw new InvalidOperationException("Slot not found.");
        }

        if (role == UserRole.BusinessOwner && slot.Offer.Business.OwnerId != userId)
        {
            throw new InvalidOperationException("You do not have permission to modify this slot.");
        }

        // Integrity Rule: Must fit inside Offer lifetime range
        if (request.StartsAt < slot.Offer.StartsAt || request.EndsAt > slot.Offer.EndsAt)
        {
            throw new InvalidOperationException($"Slot time must be within parent offer range ({slot.Offer.StartsAt:g} to {slot.Offer.EndsAt:g}).");
        }

        var activeBookingsCount = slot.Bookings.Count(b => b.Status != BookingStatus.Cancelled);

        // Integrity Rule: Cannot reduce capacity below reserved seat counts
        if (request.Capacity < activeBookingsCount)
        {
            throw new InvalidOperationException($"Cannot reduce capacity below currently active booked seats ({activeBookingsCount}).");
        }

        slot.StartsAt = request.StartsAt;
        slot.EndsAt = request.EndsAt;
        slot.Capacity = request.Capacity;
        slot.UpdatedAt = clock.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToSummary(slot);
    }

    public async Task DeleteAsync(
        Guid slotId,
        Guid userId,
        UserRole role,
        CancellationToken cancellationToken)
    {
        var slot = await dbContext.OfferSlots
            .Include(s => s.Bookings)
            .Include(s => s.Offer)
            .ThenInclude(o => o.Business)
            .SingleOrDefaultAsync(s => s.Id == slotId, cancellationToken);

        if (slot is null)
        {
            throw new InvalidOperationException("Slot not found.");
        }

        if (role == UserRole.BusinessOwner && slot.Offer.Business.OwnerId != userId)
        {
            throw new InvalidOperationException("You do not have permission to delete this slot.");
        }

        var activeBookingsCount = slot.Bookings.Count(b => b.Status != BookingStatus.Cancelled);

        // Integrity Guard: Cannot delete slots with active reservations
        if (activeBookingsCount > 0)
        {
            throw new InvalidOperationException($"Cannot delete a slot with active customer bookings.");
        }

        dbContext.OfferSlots.Remove(slot);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private SlotSummaryDto ToSummary(OfferSlot slot)
    {
        var activeBookings = slot.Bookings?.Count(b => b.Status != BookingStatus.Cancelled) ?? 0;
        var available = Math.Max(slot.Capacity - activeBookings, 0);

        string status = "Active";
        if (slot.EndsAt <= clock.UtcNow)
        {
            status = "Expired";
        }
        else if (available == 0)
        {
            status = "Full";
        }

        return new SlotSummaryDto(
            slot.Id,
            slot.OfferId,
            slot.StartsAt,
            slot.EndsAt,
            slot.Capacity,
            activeBookings,
            available,
            status
        );
    }
}
