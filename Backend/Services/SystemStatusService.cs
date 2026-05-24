using SmartOfferBookingSystem.DTOs;
using SmartOfferBookingSystem.Interfaces;

namespace SmartOfferBookingSystem.Services;

public sealed class SystemStatusService(IDateTimeProvider clock)
{
    public Task<SystemStatusDto> GetAsync(CancellationToken cancellationToken)
    {
        var status = new SystemStatusDto("Smart Offer Booking API", "ready", clock.UtcNow);
        return Task.FromResult(status);
    }
}
