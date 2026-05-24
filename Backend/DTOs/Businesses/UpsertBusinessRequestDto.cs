namespace SmartOfferBookingSystem.DTOs.Businesses;

public sealed record UpsertBusinessRequestDto(
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
    string ClosingTime);
