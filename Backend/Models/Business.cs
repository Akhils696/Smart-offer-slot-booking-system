namespace SmartOfferBookingSystem.Models;

public enum BusinessType
{
    Restaurant = 1,
    Gym = 2,
    Salon = 3,
    Clinic = 4,
    Coaching = 5,
    Turf = 6,
    Other = 7
}

public sealed class Business
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? PhoneNumber { get; set; } // Keep existing for compatibility
    
    // Hackathon required fields
    public BusinessType BusinessType { get; set; } = BusinessType.Other;
    public string OwnerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string OpeningTime { get; set; } = "09:00";
    public string ClosingTime { get; set; } = "22:00";
    
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public User Owner { get; set; } = null!;
    public ICollection<Offer> Offers { get; set; } = [];
}
