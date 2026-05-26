namespace FamilyPlanner.Api.Common;

public static class WeekDateHelper
{
    public static DateOnly GetCurrentWeekStartDate()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var daysSinceMonday = ((int)today.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;

        return today.AddDays(-daysSinceMonday);
    }
}
