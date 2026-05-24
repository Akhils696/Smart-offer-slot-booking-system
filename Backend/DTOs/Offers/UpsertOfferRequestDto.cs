namespace SmartOfferBookingSystem.DTOs.Offers;

public sealed record UpsertOfferRequestDto(
    Guid BusinessId,
    string Title,
    string? Description,
    decimal OriginalPrice,
    decimal OfferPrice,
    string Category,
    string? TermsAndConditions,
    int MaxBookingPerCustomer,
    string Status,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt);
