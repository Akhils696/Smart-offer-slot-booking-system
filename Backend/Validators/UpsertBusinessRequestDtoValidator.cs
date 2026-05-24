using FluentValidation;
using SmartOfferBookingSystem.DTOs.Businesses;

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
    }
}
