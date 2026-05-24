namespace SmartOfferBookingSystem.DTOs;

public sealed record SystemStatusDto(string Service, string Status, DateTimeOffset CheckedAt);
