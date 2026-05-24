namespace SmartOfferBookingSystem.DTOs.Businesses;

public sealed record BusinessSummaryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? PhoneNumber,
    string BusinessType,
    string OwnerName,
    string Phone,
    string Email,
    string Address,
    string City,
    string? LogoUrl,
    string OpeningTime,
    string ClosingTime,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
