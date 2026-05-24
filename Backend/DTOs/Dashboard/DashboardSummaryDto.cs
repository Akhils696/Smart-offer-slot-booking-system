using SmartOfferBookingSystem.DTOs.Bookings;

namespace SmartOfferBookingSystem.DTOs.Dashboard;

public sealed record DashboardSummaryDto(
    int TotalOffers,
    int ActiveOffers,
    int TotalBookings,
    int TodayBookings,
    int TotalCapacity,
    int BookedSeats,
    int AvailableSeats,
    double ConversionRate,
    IReadOnlyCollection<BookingSummaryDto> RecentBookings
);
