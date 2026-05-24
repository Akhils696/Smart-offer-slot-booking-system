using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.DTOs.Slots;
using SmartOfferBookingSystem.Helpers;
using SmartOfferBookingSystem.Services;

namespace SmartOfferBookingSystem.Controllers;

[ApiController]
[Route("api/slots")]
[Route("api/slot")]
public sealed class SlotsController(SlotService slotService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<SlotSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<SlotSummaryDto>>>> ListAll(
        [FromQuery] Guid? offerId,
        CancellationToken cancellationToken)
    {
        if (offerId.HasValue)
        {
            var slotsForOffer = await slotService.ListAsync(offerId.Value, cancellationToken);
            return Ok(ApiResponse<IReadOnlyCollection<SlotSummaryDto>>.Success(slotsForOffer));
        }
        return Ok(ApiResponse<IReadOnlyCollection<SlotSummaryDto>>.Success([]));
    }

    [HttpGet("offers/{offerId:guid}")]
    [HttpGet("/api/offers/{offerId:guid}/slots")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<SlotSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<SlotSummaryDto>>>> List(
        Guid offerId,
        CancellationToken cancellationToken)
    {
        var slots = await slotService.ListAsync(offerId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<SlotSummaryDto>>.Success(slots));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,BusinessOwner")]
    [ProducesResponseType(typeof(ApiResponse<SlotSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<SlotSummaryDto>>> Create(
        [FromBody] UpsertSlotRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await slotService.CreateAsync(User.GetRequiredUserId(), User.GetRequiredRole(), request, cancellationToken);
        return Ok(ApiResponse<SlotSummaryDto>.Success(result, "Slot created successfully."));
    }

    [HttpPut("{slotId:guid}")]
    [Authorize(Roles = "Admin,BusinessOwner")]
    [ProducesResponseType(typeof(ApiResponse<SlotSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<SlotSummaryDto>>> Update(
        Guid slotId,
        [FromBody] UpsertSlotRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await slotService.UpdateAsync(slotId, User.GetRequiredUserId(), User.GetRequiredRole(), request, cancellationToken);
        return Ok(ApiResponse<SlotSummaryDto>.Success(result, "Slot updated successfully."));
    }

    [HttpDelete("{slotId:guid}")]
    [Authorize(Roles = "Admin,BusinessOwner")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(
        Guid slotId,
        CancellationToken cancellationToken)
    {
        await slotService.DeleteAsync(slotId, User.GetRequiredUserId(), User.GetRequiredRole(), cancellationToken);
        return Ok(ApiResponse<object>.Success(new { }, "Slot deleted successfully."));
    }
}
