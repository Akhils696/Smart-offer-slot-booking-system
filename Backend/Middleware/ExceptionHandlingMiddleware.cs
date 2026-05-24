using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.Exceptions;

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
            logger.LogWarning("Validation failed: {Errors}", string.Join("; ", exception.Errors.Select(e => e.ErrorMessage)));
            await WriteErrorAsync(context, HttpStatusCode.UnprocessableEntity, "Validation failed.", exception.Errors.Select(e => e.ErrorMessage));
        }
        catch (NotFoundException exception)
        {
            logger.LogWarning("Resource not found: {Message}", exception.Message);
            await WriteErrorAsync(context, HttpStatusCode.NotFound, exception.Message);
        }
        catch (ConflictException exception)
        {
            logger.LogWarning("Conflict detected: {Message}", exception.Message);
            await WriteErrorAsync(context, HttpStatusCode.Conflict, exception.Message);
        }
        catch (ForbiddenOperationException exception)
        {
            logger.LogWarning("Forbidden operation: {Message}", exception.Message);
            await WriteErrorAsync(context, HttpStatusCode.Forbidden, exception.Message);
        }
        catch (DbUpdateConcurrencyException exception)
        {
            logger.LogWarning(exception, "Database concurrency conflict detected.");
            await WriteErrorAsync(context, HttpStatusCode.Conflict, "This slot was just reserved by another customer. Please choose a different slot or refresh and try again.");
        }
        catch (InvalidOperationException exception)
        {
            logger.LogWarning("Operational failure: {Message}", exception.Message);
            await WriteErrorAsync(context, HttpStatusCode.UnprocessableEntity, exception.Message);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled exception in request pipeline at {Path}", context.Request.Path);
            await WriteErrorAsync(context, HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.");
        }
    }

    private static async Task WriteErrorAsync(
        HttpContext context,
        HttpStatusCode statusCode,
        string message,
        IEnumerable<string>? errors = null)
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
