namespace SmartOfferBookingSystem.Models;

public sealed class Booking
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public Guid OfferSlotId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; } // Made optional as per requirements
    
    // Hackathon required fields
    public string CustomerPhone { get; set; } = string.Empty;
    public int PeopleCount { get; set; } = 1;
    public string? SpecialNote { get; set; }
    
    public string ReferenceCode { get; set; } = string.Empty;
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public User? User { get; set; }
    public OfferSlot OfferSlot { get; set; } = null!;
}

public enum BookingStatus
{
    Pending = 1,
    Confirmed = 2,
    Cancelled = 3,
    Completed = 4,
    NoShow = 5,
    Expired = 6
}
