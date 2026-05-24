namespace SmartOfferBookingSystem.DTOs.Offers;

public sealed record UpsertOfferRequestDto(
    Guid BusinessId,
    string Title,
    string? Description,
    decimal OriginalPrice,
    decimal OfferPrice,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt);
