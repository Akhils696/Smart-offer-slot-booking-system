using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.DTOs.Offers;
using SmartOfferBookingSystem.Helpers;
using SmartOfferBookingSystem.Models;
using SmartOfferBookingSystem.Services;

namespace SmartOfferBookingSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,BusinessOwner")]
public sealed class OffersController(OfferService offerService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<OfferSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<OfferSummaryDto>>>> List(
        [FromQuery] OfferQueryDto query,
        CancellationToken cancellationToken)
    {
        var offers = await offerService.ListAsync(User.GetRequiredUserId(), User.GetRequiredRole(), query, cancellationToken);
        return Ok(ApiResponse<PagedResult<OfferSummaryDto>>.Success(offers));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<OfferSummaryDto>>> Create(
        [FromBody] UpsertOfferRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await offerService.CreateAsync(User.GetRequiredUserId(), User.GetRequiredRole(), request, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{offerId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<OfferSummaryDto>>> Update(
        Guid offerId,
        [FromBody] UpsertOfferRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await offerService.UpdateAsync(offerId, User.GetRequiredUserId(), User.GetRequiredRole(), request, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{offerId:guid}/activate")]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<OfferSummaryDto>>> Activate(Guid offerId, CancellationToken cancellationToken)
    {
        var result = await offerService.ChangeStatusAsync(offerId, User.GetRequiredUserId(), User.GetRequiredRole(), OfferStatus.Active, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{offerId:guid}/pause")]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<OfferSummaryDto>>> Pause(Guid offerId, CancellationToken cancellationToken)
    {
        var result = await offerService.ChangeStatusAsync(offerId, User.GetRequiredUserId(), User.GetRequiredRole(), OfferStatus.Paused, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{offerId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid offerId, CancellationToken cancellationToken)
    {
        var result = await offerService.DeleteAsync(offerId, User.GetRequiredUserId(), User.GetRequiredRole(), cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
