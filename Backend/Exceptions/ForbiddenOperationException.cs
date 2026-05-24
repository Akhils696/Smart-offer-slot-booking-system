namespace SmartOfferBookingSystem.Exceptions;

/// <summary>
/// Thrown when the authenticated user lacks permission for the operation. Maps to HTTP 403.
/// </summary>
public sealed class ForbiddenOperationException(string message) : Exception(message);
