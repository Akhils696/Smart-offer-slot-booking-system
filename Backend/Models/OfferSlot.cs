namespace SmartOfferBookingSystem.Models;

public sealed class OfferSlot
{
    public Guid Id { get; set; }
    public Guid OfferId { get; set; }
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset EndsAt { get; set; }
    public int Capacity { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public Offer Offer { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = [];
}
