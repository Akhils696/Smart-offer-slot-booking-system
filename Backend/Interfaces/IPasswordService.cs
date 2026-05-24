using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Interfaces;

public interface IPasswordService
{
    string HashPassword(User user, string password);
    bool VerifyPassword(User user, string hashedPassword, string providedPassword);
}
