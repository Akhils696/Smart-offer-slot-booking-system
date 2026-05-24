using Microsoft.EntityFrameworkCore;
using SmartOfferBookingSystem.Data.Context;
using SmartOfferBookingSystem.DTOs.Bookings;
using SmartOfferBookingSystem.DTOs.Dashboard;
using SmartOfferBookingSystem.Interfaces;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Services;

public sealed class DashboardService(
    AppDbContext dbContext,
    IDateTimeProvider clock)
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(Guid userId, UserRole role, CancellationToken cancellationToken)
    {
        var offersQuery = dbContext.Offers.AsNoTracking();
        var bookingsQuery = dbContext.Bookings.AsNoTracking();
        var slotsQuery = dbContext.OfferSlots.AsNoTracking();

        if (role == UserRole.BusinessOwner)
        {
            offersQuery = offersQuery.Where(o => o.Business.OwnerId == userId);
            bookingsQuery = bookingsQuery.Where(b => b.OfferSlot.Offer.Business.OwnerId == userId);
            slotsQuery = slotsQuery.Where(s => s.Offer.Business.OwnerId == userId);
        }

        var totalOffers = await offersQuery.CountAsync(cancellationToken);
        var activeOffers = await offersQuery.CountAsync(o => o.Status == OfferStatus.Active, cancellationToken);
        
        var totalBookings = await bookingsQuery.CountAsync(cancellationToken);
        
        var todayStart = clock.UtcNow.Date;
        var todayBookings = await bookingsQuery.CountAsync(b => b.CreatedAt >= todayStart, cancellationToken);

        var totalCapacity = await slotsQuery.SumAsync(s => s.Capacity, cancellationToken);
        
        // BookedSeats is the sum of PeopleCount for active (non-cancelled) bookings
        var bookedSeats = await bookingsQuery
            .Where(b => b.Status != BookingStatus.Cancelled)
            .SumAsync(b => b.PeopleCount, cancellationToken);

        var availableSeats = Math.Max(totalCapacity - bookedSeats, 0);

        var conversionRate = totalCapacity > 0 
            ? Math.Round((double)bookedSeats / totalCapacity * 100, 2) 
            : 0;

        var recentBookingsRaw = await bookingsQuery
            .Include(b => b.OfferSlot)
            .ThenInclude(s => s.Offer)
            .ThenInclude(o => o.Business)
            .OrderByDescending(b => b.CreatedAt)
            .Take(10)
            .ToListAsync(cancellationToken);

        var recentBookings = recentBookingsRaw.Select(b => new BookingSummaryDto(
            b.Id,
            b.UserId,
            b.OfferSlotId,
            b.CustomerName,
            b.CustomerEmail,
            b.CustomerPhone,
            b.PeopleCount,
            b.SpecialNote,
            b.ReferenceCode,
            b.Status.ToString(),
            b.OfferSlot.StartsAt,
            b.OfferSlot.EndsAt,
            b.OfferSlot.Offer.Title,
            b.OfferSlot.Offer.Business.Name,
            b.CreatedAt
        )).ToList();

        return new DashboardSummaryDto(
            totalOffers,
            activeOffers,
            totalBookings,
            todayBookings,
            totalCapacity,
            bookedSeats,
            availableSeats,
            conversionRate,
            recentBookings
        );
    }
}
