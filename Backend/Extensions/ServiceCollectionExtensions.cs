using FluentValidation;
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
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        return services;
    }

    public static IServiceCollection AddValidation(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<Program>();
        return services;
    }

    public static IServiceCollection AddMapping(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
        return services;
    }
}
