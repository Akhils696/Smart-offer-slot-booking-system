namespace SmartOfferBookingSystem.Common;

public sealed record ErrorResponse(string TraceId, string Message, IReadOnlyCollection<string> Errors);
