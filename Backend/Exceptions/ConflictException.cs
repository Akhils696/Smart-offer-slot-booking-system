namespace SmartOfferBookingSystem.Exceptions;

/// <summary>
/// Thrown when a state conflict prevents the operation. Maps to HTTP 409.
/// </summary>
public sealed class ConflictException(string message) : Exception(message);
