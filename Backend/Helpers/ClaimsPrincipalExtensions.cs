using System.Security.Claims;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Helpers;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetRequiredUserId(this ClaimsPrincipal principal)
    {
        var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub");

        return Guid.TryParse(subject, out var userId)
            ? userId
            : throw new InvalidOperationException("Authenticated user id is missing.");
    }

    public static UserRole GetRequiredRole(this ClaimsPrincipal principal)
    {
        var role = principal.FindFirstValue(ClaimTypes.Role);

        return Enum.TryParse<UserRole>(role, out var parsedRole)
            ? parsedRole
            : throw new InvalidOperationException("Authenticated role is missing.");
    }
}
