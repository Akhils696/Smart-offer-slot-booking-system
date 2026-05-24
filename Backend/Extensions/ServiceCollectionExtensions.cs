using FluentValidation;
using FluentValidation.AspNetCore;
using SmartOfferBookingSystem.Data.Seed;
using SmartOfferBookingSystem.Helpers;
using SmartOfferBookingSystem.Interfaces;
using SmartOfferBookingSystem.Mappings;
using SmartOfferBookingSystem.Services;

namespace SmartOfferBookingSystem.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<SystemStatusService>();
        services.AddScoped<AuthService>();
        services.AddScoped<BusinessService>();
        services.AddScoped<OfferService>();
        services.AddScoped<SlotService>();
        services.AddScoped<BookingService>();
        services.AddScoped<DevelopmentDataSeeder>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<IPasswordService, PasswordService>();

        return services;
    }

    public static IServiceCollection AddValidation(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<Program>();
        services.AddFluentValidationAutoValidation();
        return services;
    }

    public static IServiceCollection AddMapping(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
        return services;
    }
}
