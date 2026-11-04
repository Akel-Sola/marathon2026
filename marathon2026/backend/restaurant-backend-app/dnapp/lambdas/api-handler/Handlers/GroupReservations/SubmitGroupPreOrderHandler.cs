using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using APIHandler.Exceptions;
using APIHandler.Helpers;
using APIHandler.Models.GroupReservation;
using APIHandler.Services.GuestSessions;
using System.Text.Json;
using System.Threading.Tasks;

namespace APIHandler.Handlers.GroupReservations;

public sealed class SubmitGroupPreOrderHandler(IGuestSessionService service) : IApiRequestHandler
{
    public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
    {
        if (!request.TryGetPathValue("groupReservationId", out string? groupId))
            return ResponseBuilder.CreateErrorResponse(400, "Missing group reservation id.", context.Logger);
        var userId = UserContextHelper.GetAuthenticatedUserId(request);
        if (userId is null)
            return ResponseBuilder.CreateErrorResponse(401, "Unauthorized.", context.Logger);
        SubmitGroupPreOrderRequest? body;
        try { body = JsonSerializer.Deserialize<SubmitGroupPreOrderRequest>(request.Body ?? string.Empty); }
        catch (JsonException) { body = null; }
        if (body is null || string.IsNullOrWhiteSpace(body.ReservationId))
            return ResponseBuilder.CreateErrorResponse(400, "ReservationId is required.", context.Logger);
        try { return ResponseBuilder.CreateJsonResponse(200, await service.SubmitGroupPreOrderAsync(userId, groupId, body.ReservationId)); }
        catch (GroupReservationNotFoundException ex) { return ResponseBuilder.CreateErrorResponse(404, ex.Message, context.Logger); }
        catch (ReservationNotFoundException ex) { return ResponseBuilder.CreateErrorResponse(404, ex.Message, context.Logger); }
        catch (ActionForbiddenException ex) { return ResponseBuilder.CreateErrorResponse(403, ex.Message, context.Logger); }
        catch (ValidationException ex) { return ResponseBuilder.CreateErrorResponse(400, ex.Message, context.Logger); }
    }
}
