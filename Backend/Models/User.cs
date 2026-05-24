namespace SmartOfferBookingSystem.Models;

public sealed class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<Business> Businesses { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
}

public enum UserRole
{
    Customer = 1,
    BusinessOwner = 2,
    Admin = 3
}
