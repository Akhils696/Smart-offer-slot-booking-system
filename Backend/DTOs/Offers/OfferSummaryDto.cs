namespace SmartOfferBookingSystem.DTOs.Offers;

public sealed record OfferSummaryDto(
    Guid Id,
    Guid BusinessId,
    string BusinessName,
    string Title,
    string? Description,
    decimal OriginalPrice,
    decimal OfferPrice,
    string Status,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    DateTimeOffset UpdatedAt);
