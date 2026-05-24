using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.DTOs.Businesses;
using SmartOfferBookingSystem.Helpers;
using SmartOfferBookingSystem.Services;

namespace SmartOfferBookingSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,BusinessOwner")]
public sealed class BusinessesController(BusinessService businessService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyCollection<BusinessSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyCollection<BusinessSummaryDto>>>> List(CancellationToken cancellationToken)
    {
        var businesses = await businessService.ListAsync(User.GetRequiredUserId(), User.GetRequiredRole(), cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<BusinessSummaryDto>>.Success(businesses));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<BusinessSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<BusinessSummaryDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<BusinessSummaryDto>>> Create(
        [FromBody] UpsertBusinessRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await businessService.CreateAsync(User.GetRequiredUserId(), request, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{businessId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<BusinessSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<BusinessSummaryDto>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<BusinessSummaryDto>>> Update(
        Guid businessId,
        [FromBody] UpsertBusinessRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await businessService.UpdateAsync(businessId, User.GetRequiredUserId(), User.GetRequiredRole(), request, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
