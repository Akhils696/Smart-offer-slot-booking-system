namespace SmartOfferBookingSystem.Interfaces;

public interface IDateTimeProvider
{
    DateTimeOffset UtcNow { get; }
}
