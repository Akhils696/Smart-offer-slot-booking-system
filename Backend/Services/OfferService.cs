using Microsoft.EntityFrameworkCore;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.Data.Context;
using SmartOfferBookingSystem.DTOs.Offers;
using SmartOfferBookingSystem.Interfaces;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Services;

public sealed class OfferService(
    AppDbContext dbContext,
    IDateTimeProvider clock)
{
    public async Task<PagedResult<OfferSummaryDto>> ListAsync(
        Guid userId,
        UserRole role,
        OfferQueryDto query,
        CancellationToken cancellationToken)
    {
        var offers = dbContext.Offers
            .AsNoTracking()
            .Include(item => item.Business)
            .AsQueryable();

        if (role == UserRole.BusinessOwner)
        {
            offers = offers.Where(item => item.Business.OwnerId == userId);
        }
        else if (role == UserRole.Customer)
        {
            offers = offers.Where(item => item.Status == OfferStatus.Active && item.EndsAt > clock.UtcNow);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLowerInvariant();
            offers = offers.Where(item =>
                item.Title.ToLower().Contains(search) ||
                item.Business.Name.ToLower().Contains(search));
        }

        if (query.BusinessId.HasValue)
        {
            offers = offers.Where(item => item.BusinessId == query.BusinessId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<OfferStatus>(query.Status, true, out var status))
        {
            offers = offers.Where(item => item.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(query.BusinessType) && Enum.TryParse<BusinessType>(query.BusinessType, true, out var bType))
        {
            offers = offers.Where(item => item.Business.BusinessType == bType);
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            var category = query.Category.Trim().ToLowerInvariant();
            offers = offers.Where(item => item.Category.ToLower() == category);
        }

        if (query.MaxPrice.HasValue)
        {
            offers = offers.Where(item => item.OfferPrice <= query.MaxPrice.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Date))
        {
            if (DateTimeOffset.TryParse(query.Date, out var filterDate))
            {
                var filterDateStart = filterDate.Date;
                var filterDateEnd = filterDateStart.AddDays(1);
                offers = offers.Where(item =>
                    item.StartsAt < filterDateEnd &&
                    item.EndsAt >= filterDateStart);
            }
        }

        if (query.AvailableOnly == true)
        {
            offers = offers.Where(item => item.Slots.Any(s => s.Capacity > s.BookedCount && s.EndsAt > clock.UtcNow));
        }

        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 5, 50);
        var totalCount = await offers.CountAsync(cancellationToken);

        var items = await offers
            .OrderByDescending(item => item.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(item => ToSummary(item))
            .ToListAsync(cancellationToken);

        return new PagedResult<OfferSummaryDto>(items, page, pageSize, totalCount);
    }

    public async Task<OfferSummaryDto> CreateAsync(
        Guid userId,
        UserRole role,
        UpsertOfferRequestDto request,
        CancellationToken cancellationToken)
    {
        var business = await dbContext.Businesses.SingleOrDefaultAsync(item => item.Id == request.BusinessId, cancellationToken);
        if (business is null)
        {
            throw new InvalidOperationException("Business not found.");
        }

        if (role == UserRole.BusinessOwner && business.OwnerId != userId)
        {
            throw new InvalidOperationException("You cannot add offers to this business.");
        }

        Enum.TryParse<OfferStatus>(request.Status, true, out var status);

        var now = clock.UtcNow;
        var offer = new Offer
        {
            Id = Guid.NewGuid(),
            BusinessId = business.Id,
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            OriginalPrice = request.OriginalPrice,
            OfferPrice = request.OfferPrice,
            Category = request.Category.Trim(),
            DiscountPercentage = request.OriginalPrice > 0 ? Math.Round((request.OriginalPrice - request.OfferPrice) / request.OriginalPrice * 100, 2) : 0,
            TermsAndConditions = string.IsNullOrWhiteSpace(request.TermsAndConditions) ? null : request.TermsAndConditions.Trim(),
            MaxBookingPerCustomer = request.MaxBookingPerCustomer,
            Status = status,
            StartsAt = request.StartsAt,
            EndsAt = request.EndsAt,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Offers.Add(offer);
        await dbContext.SaveChangesAsync(cancellationToken);

        offer.Business = business;
        return ToSummary(offer);
    }

    public async Task<OfferSummaryDto> UpdateAsync(
        Guid offerId,
        Guid userId,
        UserRole role,
        UpsertOfferRequestDto request,
        CancellationToken cancellationToken)
    {
        var offer = await dbContext.Offers
            .Include(item => item.Business)
            .SingleOrDefaultAsync(item => item.Id == offerId, cancellationToken);

        if (offer is null)
        {
            throw new InvalidOperationException("Offer not found.");
        }

        if (role == UserRole.BusinessOwner && offer.Business.OwnerId != userId)
        {
            throw new InvalidOperationException("You cannot modify this offer.");
        }

        var business = await dbContext.Businesses.SingleOrDefaultAsync(item => item.Id == request.BusinessId, cancellationToken);
        if (business is null)
        {
            throw new InvalidOperationException("Business not found.");
        }

        if (role == UserRole.BusinessOwner && business.OwnerId != userId)
        {
            throw new InvalidOperationException("You cannot move this offer to that business.");
        }

        Enum.TryParse<OfferStatus>(request.Status, true, out var status);

        offer.BusinessId = business.Id;
        offer.Business = business;
        offer.Title = request.Title.Trim();
        offer.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        offer.OriginalPrice = request.OriginalPrice;
        offer.OfferPrice = request.OfferPrice;
        offer.Category = request.Category.Trim();
        offer.DiscountPercentage = request.OriginalPrice > 0 ? Math.Round((request.OriginalPrice - request.OfferPrice) / request.OriginalPrice * 100, 2) : 0;
        offer.TermsAndConditions = string.IsNullOrWhiteSpace(request.TermsAndConditions) ? null : request.TermsAndConditions.Trim();
        offer.MaxBookingPerCustomer = request.MaxBookingPerCustomer;
        offer.StartsAt = request.StartsAt;
        offer.EndsAt = request.EndsAt;
        offer.UpdatedAt = clock.UtcNow;

        if (offer.EndsAt <= clock.UtcNow)
        {
            offer.Status = OfferStatus.Expired;
        }
        else
        {
            offer.Status = status;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToSummary(offer);
    }

    public async Task<OfferSummaryDto> ChangeStatusAsync(
        Guid offerId,
        Guid userId,
        UserRole role,
        OfferStatus status,
        CancellationToken cancellationToken)
    {
        var offer = await dbContext.Offers
            .Include(item => item.Business)
            .SingleOrDefaultAsync(item => item.Id == offerId, cancellationToken);

        if (offer is null)
        {
            throw new InvalidOperationException("Offer not found.");
        }

        if (role == UserRole.BusinessOwner && offer.Business.OwnerId != userId)
        {
            throw new InvalidOperationException("You cannot modify this offer.");
        }

        if (status == OfferStatus.Active && offer.EndsAt <= clock.UtcNow)
        {
            throw new InvalidOperationException("Expired offers cannot be activated.");
        }

        offer.Status = status;
        offer.UpdatedAt = clock.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToSummary(offer);
    }

    public async Task DeleteAsync(
        Guid offerId,
        Guid userId,
        UserRole role,
        CancellationToken cancellationToken)
    {
        var offer = await dbContext.Offers
            .Include(item => item.Business)
            .Include(item => item.Slots)
            .SingleOrDefaultAsync(item => item.Id == offerId, cancellationToken);

        if (offer is null)
        {
            throw new InvalidOperationException("Offer not found.");
        }

        if (role == UserRole.BusinessOwner && offer.Business.OwnerId != userId)
        {
            throw new InvalidOperationException("You cannot delete this offer.");
        }

        if (offer.Slots.Count > 0)
        {
            throw new InvalidOperationException("Offers with slots cannot be deleted.");
        }

        dbContext.Offers.Remove(offer);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
    public async Task<OfferSummaryDto> GetByIdAsync(Guid offerId, CancellationToken cancellationToken)
    {
        var offer = await dbContext.Offers
            .AsNoTracking()
            .Include(item => item.Business)
            .SingleOrDefaultAsync(item => item.Id == offerId, cancellationToken);

        if (offer is null)
        {
            throw new InvalidOperationException("Offer not found.");
        }

        return ToSummary(offer);
    }

    private static OfferSummaryDto ToSummary(Offer offer) =>
        new(
            offer.Id,
            offer.BusinessId,
            offer.Business.Name,
            offer.Title,
            offer.Description,
            offer.OriginalPrice,
            offer.OfferPrice,
            offer.DiscountPercentage,
            offer.Category,
            offer.TermsAndConditions,
            offer.MaxBookingPerCustomer,
            offer.Status.ToString(),
            offer.StartsAt,
            offer.EndsAt,
            offer.UpdatedAt);
}
