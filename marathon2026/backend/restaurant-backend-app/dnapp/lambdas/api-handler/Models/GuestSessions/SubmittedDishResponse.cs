using System.Text.Json.Serialization;

namespace APIHandler.Models.GuestSessions;

public sealed record SubmittedDishResponse(
    [property: JsonPropertyName("dishId")] string DishId,
    [property: JsonPropertyName("quantity")] int Quantity);
