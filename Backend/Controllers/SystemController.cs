using Microsoft.AspNetCore.Mvc;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.DTOs;
using SmartOfferBookingSystem.Services;

namespace SmartOfferBookingSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SystemController(SystemStatusService systemStatusService) : ControllerBase
{
    [HttpGet("status")]
    [ProducesResponseType(typeof(ApiResponse<SystemStatusDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<SystemStatusDto>>> GetStatus(CancellationToken cancellationToken)
    {
        var status = await systemStatusService.GetAsync(cancellationToken);
        return Ok(ApiResponse<SystemStatusDto>.Success(status));
    }
}
