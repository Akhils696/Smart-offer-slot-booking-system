namespace SmartOfferBookingSystem.DTOs.Auth;

public sealed record LoginResponseDto(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    AuthUserDto User);
