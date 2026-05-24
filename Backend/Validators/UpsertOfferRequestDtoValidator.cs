using FluentValidation;
using SmartOfferBookingSystem.DTOs.Offers;
using SmartOfferBookingSystem.Models;

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

        RuleFor(x => x.Category)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.TermsAndConditions)
            .MaximumLength(2000);

        RuleFor(x => x.MaxBookingPerCustomer)
            .GreaterThan(0)
            .WithMessage("Max bookings per customer must be at least 1.");

        RuleFor(x => x.Status)
            .NotEmpty()
            .IsEnumName(typeof(OfferStatus), caseSensitive: false).WithMessage("Invalid Offer Status.");

        RuleFor(x => x.StartsAt)
            .LessThan(x => x.EndsAt)
            .WithMessage("Offer start time must be earlier than end time.");

        RuleFor(x => x.EndsAt)
            .GreaterThan(x => x.StartsAt)
            .WithMessage("Offer end time must be later than start time.");
    }
}
