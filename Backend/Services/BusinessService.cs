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
                item.CreatedAt,
                item.UpdatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<ApiResponse<BusinessSummaryDto>> CreateAsync(
        Guid userId,
        UpsertBusinessRequestDto request,
        CancellationToken cancellationToken)
    {
        var slug = request.Slug.Trim().ToLowerInvariant();

        var exists = await dbContext.Businesses.AnyAsync(item => item.Slug == slug, cancellationToken);
        if (exists)
        {
            return ApiResponse<BusinessSummaryDto>.Failure("A business with this slug already exists.");
        }

        var now = clock.UtcNow;
        var business = new Business
        {
            Id = Guid.NewGuid(),
            OwnerId = userId,
            Name = request.Name.Trim(),
            Slug = slug,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Businesses.Add(business);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ApiResponse<BusinessSummaryDto>.Success(ToSummary(business), "Business created.");
    }

    public async Task<ApiResponse<BusinessSummaryDto>> UpdateAsync(
        Guid businessId,
        Guid userId,
        UserRole role,
        UpsertBusinessRequestDto request,
        CancellationToken cancellationToken)
    {
        var business = await dbContext.Businesses.SingleOrDefaultAsync(item => item.Id == businessId, cancellationToken);
        if (business is null)
        {
            return ApiResponse<BusinessSummaryDto>.Failure("Business not found.");
        }

        if (role == UserRole.BusinessOwner && business.OwnerId != userId)
        {
            return ApiResponse<BusinessSummaryDto>.Failure("You cannot modify this business.");
        }

        var slug = request.Slug.Trim().ToLowerInvariant();
        var slugTaken = await dbContext.Businesses.AnyAsync(item => item.Id != businessId && item.Slug == slug, cancellationToken);
        if (slugTaken)
        {
            return ApiResponse<BusinessSummaryDto>.Failure("A business with this slug already exists.");
        }

        business.Name = request.Name.Trim();
        business.Slug = slug;
        business.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        business.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        business.UpdatedAt = clock.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ApiResponse<BusinessSummaryDto>.Success(ToSummary(business), "Business updated.");
    }

    private static BusinessSummaryDto ToSummary(Business business) =>
        new(
            business.Id,
            business.Name,
            business.Slug,
            business.Description,
            business.PhoneNumber,
            business.CreatedAt,
            business.UpdatedAt);
}
