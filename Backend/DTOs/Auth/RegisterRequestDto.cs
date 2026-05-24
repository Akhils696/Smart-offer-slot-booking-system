namespace SmartOfferBookingSystem.DTOs.Auth;

public sealed record RegisterRequestDto(
    string FullName,
    string Email,
    string Password,
    string Role);
