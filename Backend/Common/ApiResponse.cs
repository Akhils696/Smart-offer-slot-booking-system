namespace SmartOfferBookingSystem.Common;

public sealed record ApiResponse<T>(bool Succeeded, T? Data, string? Message, IReadOnlyCollection<string> Errors)
{
    public static ApiResponse<T> Success(T data, string? message = null) => new(true, data, message, []);

    public static ApiResponse<T> Failure(string message, IReadOnlyCollection<string>? errors = null) =>
        new(false, default, message, errors ?? []);
}
