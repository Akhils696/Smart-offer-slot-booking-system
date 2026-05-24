namespace SmartOfferBookingSystem.DTOs.Bookings;

public sealed record BookingSummaryDto(
    Guid Id,
    Guid? UserId,
    Guid OfferSlotId,
    string CustomerName,
    string CustomerEmail,
    string ReferenceCode,
    string Status,
    DateTimeOffset SlotStartsAt,
    DateTimeOffset SlotEndsAt,
    string OfferTitle,
    string BusinessName,
    DateTimeOffset CreatedAt
);
