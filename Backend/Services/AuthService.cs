using Microsoft.AspNetCore.Http;
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
    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Email == normalizedEmail, cancellationToken);

        if (user is null || !passwordService.VerifyPassword(user, user.PasswordHash, request.Password))
        {
            throw new BadHttpRequestException("Invalid email or password.", StatusCodes.Status401Unauthorized);
        }

        var (token, expiresAt) = jwtTokenService.CreateToken(user);

        return new LoginResponseDto(
            token,
            expiresAt,
            new AuthUserDto(user.Id, user.FullName, user.Email, user.Role.ToString()));
    }
}
