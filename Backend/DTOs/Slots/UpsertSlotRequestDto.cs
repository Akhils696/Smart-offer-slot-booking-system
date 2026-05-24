namespace SmartOfferBookingSystem.DTOs.Slots;

public sealed record UpsertSlotRequestDto(
    Guid OfferId,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    int Capacity
);
