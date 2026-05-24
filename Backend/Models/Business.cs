namespace SmartOfferBookingSystem.Models;

public sealed class Business
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public User Owner { get; set; } = null!;
    public ICollection<Offer> Offers { get; set; } = [];
}
