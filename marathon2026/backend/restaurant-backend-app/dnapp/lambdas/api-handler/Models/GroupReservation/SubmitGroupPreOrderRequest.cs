using System.Text.Json.Serialization;

namespace APIHandler.Models.GroupReservation;

public sealed record SubmitGroupPreOrderRequest(
    [property: JsonPropertyName("reservationId")] string ReservationId);
