using System.Net;
using System.Text.Json;
using FluentValidation;
using SmartOfferBookingSystem.Common;

namespace SmartOfferBookingSystem.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.BadRequest, "Validation failed.", exception.Errors.Select(error => error.ErrorMessage));
        }
        catch (BadHttpRequestException exception)
        {
            await WriteErrorAsync(context, (HttpStatusCode)exception.StatusCode, exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.BadRequest, exception.Message);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled API exception");
            await WriteErrorAsync(context, HttpStatusCode.InternalServerError, "An unexpected error occurred.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, HttpStatusCode statusCode, string message, IEnumerable<string>? errors = null)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse<object>.Failure(message, errors?.ToArray());

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}
