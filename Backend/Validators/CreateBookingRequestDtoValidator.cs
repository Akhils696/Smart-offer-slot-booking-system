using FluentValidation;
using SmartOfferBookingSystem.DTOs.Bookings;

namespace SmartOfferBookingSystem.Validators;

public sealed class CreateBookingRequestDtoValidator : AbstractValidator<CreateBookingRequestDto>
{
    public CreateBookingRequestDtoValidator()
    {
        RuleFor(x => x.OfferSlotId)
            .NotEmpty();

        RuleFor(x => x.CustomerName)
            .NotEmpty()
            .MaximumLength(180)
            .WithMessage("Customer name is required.");

        RuleFor(x => x.CustomerEmail)
            .EmailAddress()
            .MaximumLength(220)
            .When(x => !string.IsNullOrWhiteSpace(x.CustomerEmail))
            .WithMessage("Invalid email format.");

        RuleFor(x => x.CustomerPhone)
            .NotEmpty()
            .MaximumLength(40)
            .WithMessage("Phone number is required.");

        RuleFor(x => x.PeopleCount)
            .GreaterThan(0)
            .WithMessage("Must book for at least 1 person.");

        RuleFor(x => x.SpecialNote)
            .MaximumLength(1000);
    }
}
