namespace SmartOfferBookingSystem.DTOs.Businesses;

public sealed record BusinessSummaryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? PhoneNumber,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
