using SmartOfferBookingSystem.Interfaces;

namespace SmartOfferBookingSystem.Helpers;

public sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
