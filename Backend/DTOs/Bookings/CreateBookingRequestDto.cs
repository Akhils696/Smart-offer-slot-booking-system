namespace SmartOfferBookingSystem.DTOs.Bookings;

public sealed record CreateBookingRequestDto(
    Guid OfferSlotId,
    string CustomerName,
    string CustomerEmail
);
