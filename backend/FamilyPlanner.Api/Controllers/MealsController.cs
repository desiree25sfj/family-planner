using FamilyPlanner.Api.DTOs;
using FamilyPlanner.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FamilyPlanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MealsController(MealService mealService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MealResponseDto>>> GetMeals()
    {
        var meals = await mealService.GetAllAsync();
        return Ok(meals);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MealResponseDto>> GetMeal(int id)
    {
        var meal = await mealService.GetByIdAsync(id);

        return meal is null ? NotFound() : Ok(meal);
    }

    [HttpPost]
    public async Task<ActionResult<MealResponseDto>> CreateMeal(CreateMealDto dto)
    {
        var result = await mealService.CreateAsync(dto);

        if (result.Error is not null)
        {
            return Conflict(new { message = result.Error });
        }

        return CreatedAtAction(nameof(GetMeal), new { id = result.Meal!.Id }, result.Meal);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<MealResponseDto>> UpdateMeal(int id, UpdateMealDto dto)
    {
        var result = await mealService.UpdateAsync(id, dto);

        if (!result.Found)
        {
            return NotFound();
        }

        if (result.Error is not null)
        {
            return Conflict(new { message = result.Error });
        }

        return Ok(result.Meal);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteMeal(int id)
    {
        var deleted = await mealService.DeleteAsync(id);

        return deleted ? NoContent() : NotFound();
    }
}
