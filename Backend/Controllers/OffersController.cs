using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.DTOs.Offers;
using SmartOfferBookingSystem.Helpers;
using SmartOfferBookingSystem.Models;
using SmartOfferBookingSystem.Services;

namespace SmartOfferBookingSystem.Controllers;

[ApiController]
[Route("api/offers")]
[Route("api/offer")]
[Authorize(Roles = "Admin,BusinessOwner")]
public sealed class OffersController(OfferService offerService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<OfferSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResult<OfferSummaryDto>>>> List(
        [FromQuery] OfferQueryDto query,
        CancellationToken cancellationToken)
    {
        var userId = Guid.Empty;
        var role = UserRole.Customer;

        if (User.Identity?.IsAuthenticated == true)
        {
            userId = User.GetRequiredUserId();
            role = User.GetRequiredRole();
        }

        var offers = await offerService.ListAsync(userId, role, query, cancellationToken);
        return Ok(ApiResponse<PagedResult<OfferSummaryDto>>.Success(offers));
    }

    [HttpGet("{offerId:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<OfferSummaryDto>>> Get(Guid offerId, CancellationToken cancellationToken)
    {
        var result = await offerService.GetByIdAsync(offerId, cancellationToken);
        return Ok(ApiResponse<OfferSummaryDto>.Success(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<OfferSummaryDto>>> Create(
        [FromBody] UpsertOfferRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await offerService.CreateAsync(User.GetRequiredUserId(), User.GetRequiredRole(), request, cancellationToken);
        return Ok(ApiResponse<OfferSummaryDto>.Success(result, "Offer created."));
    }

    [HttpPut("{offerId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<OfferSummaryDto>>> Update(
        Guid offerId,
        [FromBody] UpsertOfferRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await offerService.UpdateAsync(offerId, User.GetRequiredUserId(), User.GetRequiredRole(), request, cancellationToken);
        return Ok(ApiResponse<OfferSummaryDto>.Success(result, "Offer updated."));
    }

    [HttpPost("{offerId:guid}/activate")]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<OfferSummaryDto>>> Activate(Guid offerId, CancellationToken cancellationToken)
    {
        var result = await offerService.ChangeStatusAsync(offerId, User.GetRequiredUserId(), User.GetRequiredRole(), OfferStatus.Active, cancellationToken);
        return Ok(ApiResponse<OfferSummaryDto>.Success(result, "Offer activated."));
    }

    [HttpPost("{offerId:guid}/pause")]
    [ProducesResponseType(typeof(ApiResponse<OfferSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<OfferSummaryDto>>> Pause(Guid offerId, CancellationToken cancellationToken)
    {
        var result = await offerService.ChangeStatusAsync(offerId, User.GetRequiredUserId(), User.GetRequiredRole(), OfferStatus.Paused, cancellationToken);
        return Ok(ApiResponse<OfferSummaryDto>.Success(result, "Offer paused."));
    }

    [HttpDelete("{offerId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid offerId, CancellationToken cancellationToken)
    {
        await offerService.DeleteAsync(offerId, User.GetRequiredUserId(), User.GetRequiredRole(), cancellationToken);
        return Ok(ApiResponse<object>.Success(new { }, "Offer deleted."));
    }
}
