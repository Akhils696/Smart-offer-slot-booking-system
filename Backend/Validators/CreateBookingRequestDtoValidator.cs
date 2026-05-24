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
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(220)
            .WithMessage("Valid customer email is required.");
    }
}
