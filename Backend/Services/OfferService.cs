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

        var now = clock.UtcNow;
        var offer = new Offer
        {
            Id = Guid.NewGuid(),
            BusinessId = business.Id,
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            OriginalPrice = request.OriginalPrice,
            OfferPrice = request.OfferPrice,
            Status = OfferStatus.Draft,
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

        offer.BusinessId = business.Id;
        offer.Business = business;
        offer.Title = request.Title.Trim();
        offer.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        offer.OriginalPrice = request.OriginalPrice;
        offer.OfferPrice = request.OfferPrice;
        offer.StartsAt = request.StartsAt;
        offer.EndsAt = request.EndsAt;
        offer.UpdatedAt = clock.UtcNow;

        if (offer.EndsAt <= clock.UtcNow)
        {
            offer.Status = OfferStatus.Expired;
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

    private static OfferSummaryDto ToSummary(Offer offer) =>
        new(
            offer.Id,
            offer.BusinessId,
            offer.Business.Name,
            offer.Title,
            offer.Description,
            offer.OriginalPrice,
            offer.OfferPrice,
            offer.Status.ToString(),
            offer.StartsAt,
            offer.EndsAt,
            offer.UpdatedAt);
}
