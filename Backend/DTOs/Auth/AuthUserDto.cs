namespace SmartOfferBookingSystem.DTOs.Auth;

public sealed record AuthUserDto(Guid Id, string FullName, string Email, string Role);
