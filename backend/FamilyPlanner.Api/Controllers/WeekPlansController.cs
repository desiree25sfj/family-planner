using FamilyPlanner.Api.DTOs;
using FamilyPlanner.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FamilyPlanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeekPlansController(WeekPlanService weekPlanService) : ControllerBase
{
    [HttpGet("current")]
    public async Task<ActionResult<WeekPlanResponseDto>> GetCurrentWeekPlan()
    {
        var weekPlan = await weekPlanService.GetCurrentAsync();
        return Ok(weekPlan);
    }

    [HttpPost("current/meals")]
    public async Task<ActionResult<PlannedMealResponseDto>> CreateCurrentWeekMeal(CreatePlannedMealDto dto)
    {
        var result = await weekPlanService.CreateCurrentMealAsync(dto);

        return ToActionResult(result, created: true);
    }

    [HttpPut("current/meals/{id:int}")]
    public async Task<ActionResult<PlannedMealResponseDto>> UpdateCurrentWeekMeal(int id, UpdatePlannedMealDto dto)
    {
        var result = await weekPlanService.UpdateCurrentMealAsync(id, dto);

        return ToActionResult(result, created: false);
    }

    [HttpDelete("current/meals/{id:int}")]
    public async Task<IActionResult> DeleteCurrentWeekMeal(int id)
    {
        var deleted = await weekPlanService.DeleteCurrentMealAsync(id);

        return deleted ? NoContent() : NotFound();
    }

    private ActionResult<PlannedMealResponseDto> ToActionResult(PlannedMealOperationResult result, bool created)
    {
        return result.Status switch
        {
            PlannedMealOperationStatus.Success when created =>
                CreatedAtAction(nameof(GetCurrentWeekPlan), result.PlannedMeal),
            PlannedMealOperationStatus.Success => Ok(result.PlannedMeal),
            PlannedMealOperationStatus.ValidationError => BadRequest(new { message = result.Error }),
            PlannedMealOperationStatus.Conflict => Conflict(new { message = result.Error }),
            PlannedMealOperationStatus.NotFound => NotFound(),
            _ => BadRequest()
        };
    }
}
