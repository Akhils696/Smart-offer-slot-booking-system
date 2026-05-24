using Microsoft.EntityFrameworkCore;
using SmartOfferBookingSystem.Common;
using SmartOfferBookingSystem.Data.Context;
using SmartOfferBookingSystem.DTOs.Auth;
using SmartOfferBookingSystem.Exceptions;
using SmartOfferBookingSystem.Interfaces;

namespace SmartOfferBookingSystem.Services;

public sealed class AuthService(
    AppDbContext dbContext,
    IJwtTokenService jwtTokenService,
    IPasswordService passwordService)
{
    // Dummy hash used to prevent user enumeration via timing analysis.
    // When a user is not found, we still run VerifyPassword against this hash
    // so the response time is indistinguishable from a real failed-password attempt.
    private static readonly string DummyHash = new Microsoft.AspNetCore.Identity.PasswordHasher<object>()
        .HashPassword(new object(), "dummy-timing-protection-placeholder");

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await dbContext.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Email == normalizedEmail, cancellationToken);

        // Always run password verification to prevent timing-based user enumeration.
        // If the user doesn't exist, verify against a dummy hash (which will fail).
        bool passwordValid;
        if (user is not null)
        {
            passwordValid = passwordService.VerifyPassword(user, user.PasswordHash, request.Password);
        }
        else
        {
            // Deliberately run a verification to consume similar time as a real failed attempt.
            passwordService.VerifyPassword(null!, DummyHash, request.Password);
            passwordValid = false;
        }

        if (!passwordValid)
        {
            // Generic error message — never reveal whether it was the email or password that failed.
            throw new InvalidOperationException("Invalid email or password.");
        }

        var (token, expiresAt) = jwtTokenService.CreateToken(user!);

        return new LoginResponseDto(
            token,
            expiresAt,
            new AuthUserDto(user!.Id, user.FullName, user.Email, user.Role.ToString()));
    }
}
