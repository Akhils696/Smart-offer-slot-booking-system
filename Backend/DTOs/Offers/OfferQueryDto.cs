namespace SmartOfferBookingSystem.DTOs.Offers;

public sealed class OfferQueryDto
{
    public string? Search { get; init; }
    public string? Status { get; init; }
    public Guid? BusinessId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
