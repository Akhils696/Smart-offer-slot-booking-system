using FluentValidation;
using SmartOfferBookingSystem.DTOs.Offers;

namespace SmartOfferBookingSystem.Validators;

public sealed class UpsertOfferRequestDtoValidator : AbstractValidator<UpsertOfferRequestDto>
{
    public UpsertOfferRequestDtoValidator()
    {
        RuleFor(x => x.BusinessId)
            .NotEmpty();

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(220);

        RuleFor(x => x.Description)
            .MaximumLength(1600);

        RuleFor(x => x.OriginalPrice)
            .GreaterThan(0);

        RuleFor(x => x.OfferPrice)
            .GreaterThan(0)
            .LessThan(x => x.OriginalPrice)
            .WithMessage("Offer price must be lower than original price.");

        RuleFor(x => x.StartsAt)
            .LessThan(x => x.EndsAt)
            .WithMessage("Offer start time must be earlier than end time.");

        RuleFor(x => x.EndsAt)
            .GreaterThan(x => x.StartsAt)
            .WithMessage("Offer end time must be later than start time.");
    }
}
