using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.DTOs.Bookings;
using SmartOfferBookingSystem.Helpers;
using SmartOfferBookingSystem.Services;

namespace SmartOfferBookingSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class BookingsController(BookingService bookingService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,BusinessOwner")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<BookingSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<BookingSummaryDto>>>> List(CancellationToken cancellationToken)
    {
        var bookings = await bookingService.ListAsync(User.GetRequiredUserId(), User.GetRequiredRole(), cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<BookingSummaryDto>>.Success(bookings));
    }

    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<BookingSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<BookingSummaryDto>>> Create(
        [FromBody] CreateBookingRequestDto request,
        CancellationToken cancellationToken)
    {
        Guid? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            userId = User.GetRequiredUserId();
        }

        var result = await bookingService.CreateAsync(request, userId, cancellationToken);
        return Ok(ApiResponse<BookingSummaryDto>.Success(result, "Booking reservation confirmed."));
    }

    [HttpPut("{bookingId:guid}/status")]
    [Authorize(Roles = "Admin,BusinessOwner")]
    [ProducesResponseType(typeof(ApiResponse<BookingSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<BookingSummaryDto>>> UpdateStatus(
        Guid bookingId,
        [FromBody] UpdateBookingStatusDto request,
        CancellationToken cancellationToken)
    {
        var result = await bookingService.UpdateStatusAsync(bookingId, User.GetRequiredUserId(), User.GetRequiredRole(), request, cancellationToken);
        return Ok(ApiResponse<BookingSummaryDto>.Success(result, "Booking status updated successfully."));
    }
}
