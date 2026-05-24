using FluentValidation;
using SmartOfferBookingSystem.DTOs.Businesses;
using SmartOfferBookingSystem.Models;

namespace SmartOfferBookingSystem.Validators;

public sealed class UpsertBusinessRequestDtoValidator : AbstractValidator<UpsertBusinessRequestDto>
{
    public UpsertBusinessRequestDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(180);

        RuleFor(x => x.Slug)
            .NotEmpty()
            .MaximumLength(220)
            .Matches("^[a-z0-9-]+$").WithMessage("Slug can contain lowercase letters, numbers, and hyphens only.");

        RuleFor(x => x.Description)
            .MaximumLength(1200);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(40);

        RuleFor(x => x.BusinessType)
            .NotEmpty()
            .IsEnumName(typeof(BusinessType), caseSensitive: false).WithMessage("Invalid Business Type.");

        RuleFor(x => x.OwnerName)
            .NotEmpty()
            .MaximumLength(180);

        RuleFor(x => x.Phone)
            .NotEmpty()
            .MaximumLength(40);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(220);

        RuleFor(x => x.Address)
            .NotEmpty()
            .MaximumLength(500);

        RuleFor(x => x.City)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.LogoUrl)
            .MaximumLength(500);

        RuleFor(x => x.OpeningTime)
            .NotEmpty()
            .Matches("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$").WithMessage("Opening time must be in HH:mm format.");

        RuleFor(x => x.ClosingTime)
            .NotEmpty()
            .Matches("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$").WithMessage("Closing time must be in HH:mm format.");
    }
}
