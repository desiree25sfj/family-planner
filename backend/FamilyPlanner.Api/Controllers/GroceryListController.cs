using FamilyPlanner.Api.DTOs;
using FamilyPlanner.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FamilyPlanner.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroceryListController(GroceryListService groceryListService) : ControllerBase
{
    [HttpGet("current")]
    public async Task<ActionResult<GroceryListResponseDto>> GetCurrentGroceryList()
    {
        var groceryList = await groceryListService.GetCurrentAsync();
        return Ok(groceryList);
    }

    [HttpPost("current/items")]
    public async Task<ActionResult<GroceryItemResponseDto>> AddCurrentGroceryItem(CreateGroceryItemDto dto)
    {
        var item = await groceryListService.AddManualItemAsync(dto);
        return CreatedAtAction(nameof(GetCurrentGroceryList), item);
    }

    [HttpPut("current/items/{id:int}")]
    public async Task<ActionResult<GroceryItemResponseDto>> UpdateCurrentGroceryItem(int id, UpdateGroceryItemDto dto)
    {
        var item = await groceryListService.UpdateCurrentItemAsync(id, dto);

        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("current/items/{id:int}")]
    public async Task<IActionResult> DeleteCurrentGroceryItem(int id)
    {
        var deleted = await groceryListService.DeleteCurrentItemAsync(id);

        return deleted ? NoContent() : NotFound();
    }
}
