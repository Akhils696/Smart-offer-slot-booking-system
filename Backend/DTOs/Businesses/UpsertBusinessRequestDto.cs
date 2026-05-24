namespace SmartOfferBookingSystem.DTOs.Businesses;

public sealed record UpsertBusinessRequestDto(
    string Name,
    string Slug,
    string? Description,
    string? PhoneNumber);
