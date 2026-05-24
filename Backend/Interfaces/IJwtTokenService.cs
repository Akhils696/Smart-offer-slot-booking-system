using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Interfaces;

public interface IJwtTokenService
{
    (string Token, DateTimeOffset ExpiresAt) CreateToken(User user);
}
