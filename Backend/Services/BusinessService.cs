using Microsoft.EntityFrameworkCore;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.Data.Context;
using SmartOfferBookingSystem.DTOs.Businesses;
using SmartOfferBookingSystem.Interfaces;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Services;

public sealed class BusinessService(
    AppDbContext dbContext,
    IDateTimeProvider clock)
{
    public async Task<IReadOnlyCollection<BusinessSummaryDto>> ListAsync(Guid userId, UserRole role, CancellationToken cancellationToken)
    {
        var query = dbContext.Businesses.AsNoTracking();

        if (role == UserRole.BusinessOwner)
        {
            query = query.Where(item => item.OwnerId == userId);
        }

        return await query
            .OrderBy(item => item.Name)
            .Select(item => new BusinessSummaryDto(
                item.Id,
                item.Name,
                item.Slug,
                item.Description,
                item.PhoneNumber,
                item.BusinessType.ToString(),
                item.OwnerName,
                item.Phone,
                item.Email,
                item.Address,
                item.City,
                item.LogoUrl,
                item.OpeningTime,
                item.ClosingTime,
                item.CreatedAt,
                item.UpdatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<BusinessSummaryDto> CreateAsync(
        Guid userId,
        UpsertBusinessRequestDto request,
        CancellationToken cancellationToken)
    {
        var slug = request.Slug.Trim().ToLowerInvariant();

        var exists = await dbContext.Businesses.AnyAsync(item => item.Slug == slug, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("A business with this slug already exists.");
        }

        Enum.TryParse<BusinessType>(request.BusinessType, true, out var businessType);

        var now = clock.UtcNow;
        var business = new Business
        {
            Id = Guid.NewGuid(),
            OwnerId = userId,
            Name = request.Name.Trim(),
            Slug = slug,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
            BusinessType = businessType,
            OwnerName = request.OwnerName.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Address = request.Address.Trim(),
            City = request.City.Trim(),
            LogoUrl = string.IsNullOrWhiteSpace(request.LogoUrl) ? null : request.LogoUrl.Trim(),
            OpeningTime = request.OpeningTime.Trim(),
            ClosingTime = request.ClosingTime.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Businesses.Add(business);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToSummary(business);
    }

    public async Task<BusinessSummaryDto> UpdateAsync(
        Guid businessId,
        Guid userId,
        UserRole role,
        UpsertBusinessRequestDto request,
        CancellationToken cancellationToken)
    {
        var business = await dbContext.Businesses.SingleOrDefaultAsync(item => item.Id == businessId, cancellationToken);
        if (business is null)
        {
            throw new InvalidOperationException("Business not found.");
        }

        if (role == UserRole.BusinessOwner && business.OwnerId != userId)
        {
            throw new InvalidOperationException("You cannot modify this business.");
        }

        var slug = request.Slug.Trim().ToLowerInvariant();
        var slugTaken = await dbContext.Businesses.AnyAsync(item => item.Id != businessId && item.Slug == slug, cancellationToken);
        if (slugTaken)
        {
            throw new InvalidOperationException("A business with this slug already exists.");
        }

        Enum.TryParse<BusinessType>(request.BusinessType, true, out var businessType);

        business.Name = request.Name.Trim();
        business.Slug = slug;
        business.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        business.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        business.BusinessType = businessType;
        business.OwnerName = request.OwnerName.Trim();
        business.Phone = request.Phone.Trim();
        business.Email = request.Email.Trim().ToLowerInvariant();
        business.Address = request.Address.Trim();
        business.City = request.City.Trim();
        business.LogoUrl = string.IsNullOrWhiteSpace(request.LogoUrl) ? null : request.LogoUrl.Trim();
        business.OpeningTime = request.OpeningTime.Trim();
        business.ClosingTime = request.ClosingTime.Trim();
        business.UpdatedAt = clock.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        return ToSummary(business);
    }

    public async Task DeleteAsync(
        Guid businessId,
        Guid userId,
        UserRole role,
        CancellationToken cancellationToken)
    {
        var business = await dbContext.Businesses
            .Include(b => b.Offers)
            .SingleOrDefaultAsync(b => b.Id == businessId, cancellationToken);

        if (business is null)
        {
            throw new SmartOfferBookingSystem.Exceptions.NotFoundException("Business not found.");
        }

        if (role == UserRole.BusinessOwner && business.OwnerId != userId)
        {
            throw new InvalidOperationException("You cannot delete this business.");
        }

        if (business.Offers.Count > 0)
        {
            throw new InvalidOperationException("Businesses with active offers cannot be deleted. Please delete or archive offers first.");
        }

        dbContext.Businesses.Remove(business);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static BusinessSummaryDto ToSummary(Business business) =>
        new(
            business.Id,
            business.Name,
            business.Slug,
            business.Description,
            business.PhoneNumber,
            business.BusinessType.ToString(),
            business.OwnerName,
            business.Phone,
            business.Email,
            business.Address,
            business.City,
            business.LogoUrl,
            business.OpeningTime,
            business.ClosingTime,
            business.CreatedAt,
            business.UpdatedAt);
}
