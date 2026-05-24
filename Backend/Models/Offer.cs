namespace SmartOfferBookingSystem.Models;

public sealed class Offer
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal OfferPrice { get; set; }
    public OfferStatus Status { get; set; } = OfferStatus.Draft;
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset EndsAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Business Business { get; set; } = null!;
    public ICollection<OfferSlot> Slots { get; set; } = [];
}

public enum OfferStatus
{
    Draft = 1,
    Active = 2,
    Paused = 3,
    Expired = 4
}
