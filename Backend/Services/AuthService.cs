using Microsoft.EntityFrameworkCore;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.Data.Context;
using SmartOfferBookingSystem.DTOs.Auth;
using SmartOfferBookingSystem.Interfaces;

namespace SmartOfferBookingSystem.Services;

public sealed class AuthService(
    AppDbContext dbContext,
    IJwtTokenService jwtTokenService,
    IPasswordService passwordService)
{
    public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Email == normalizedEmail, cancellationToken);

        if (user is null || !passwordService.VerifyPassword(user, user.PasswordHash, request.Password))
        {
            return ApiResponse<LoginResponseDto>.Failure("Invalid email or password.");
        }

        var (token, expiresAt) = jwtTokenService.CreateToken(user);

        var response = new LoginResponseDto(
            token,
            expiresAt,
            new AuthUserDto(user.Id, user.FullName, user.Email, user.Role.ToString()));

        return ApiResponse<LoginResponseDto>.Success(response);
    }
}
