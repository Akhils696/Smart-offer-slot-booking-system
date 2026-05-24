namespace SmartOfferBookingSystem.DTOs.Slots;

public sealed record SlotSummaryDto(
    Guid Id,
    Guid OfferId,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    int Capacity,
    int BookedCount,
    int AvailableCount,
    string Status
);
