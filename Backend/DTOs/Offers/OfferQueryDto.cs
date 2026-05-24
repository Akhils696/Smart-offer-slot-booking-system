namespace SmartOfferBookingSystem.DTOs.Offers;

public sealed class OfferQueryDto
{
    public string? Search { get; init; }
    public string? Status { get; init; }
    public Guid? BusinessId { get; init; }
    public string? BusinessType { get; init; }
    public string? Category { get; init; }
    public string? Date { get; init; }
    public decimal? MaxPrice { get; init; }
    public bool? AvailableOnly { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
