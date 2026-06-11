using FamilyPlanner.Api.DTOs;
using FamilyPlanner.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FamilyPlanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HouseholdsController(HouseholdService householdService) : ControllerBase
{
    [HttpGet("current")]
    public async Task<ActionResult<HouseholdResponseDto>> GetCurrentHousehold()
    {
        var household = await householdService.GetCurrentAsync();

        return household is null ? Forbid() : Ok(household);
    }

    [HttpPost("current/invitations")]
    public async Task<ActionResult<HouseholdInvitationResponseDto>> CreateInvitation()
    {
        var result = await householdService.CreateInvitationAsync();

        return result.Status switch
        {
            HouseholdInvitationStatus.Success => Ok(result.Invitation),
            HouseholdInvitationStatus.Forbidden => Forbid(),
            _ => BadRequest()
        };
    }

    [HttpPost("invitations/accept")]
    public async Task<ActionResult<HouseholdResponseDto>> AcceptInvitation(
        AcceptHouseholdInvitationDto dto)
    {
        var result = await householdService.AcceptInvitationAsync(dto.Token);

        return result.Status switch
        {
            HouseholdInvitationStatus.Success => Ok(result.Household),
            HouseholdInvitationStatus.Invalid => BadRequest(new { message = "Invitation is invalid, expired, or already used." }),
            HouseholdInvitationStatus.NotFound => NotFound(),
            _ => BadRequest()
        };
    }
}
