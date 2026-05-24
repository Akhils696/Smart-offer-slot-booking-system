using FluentValidation;
using SmartOfferBookingSystem.DTOs.Slots;

namespace SmartOfferBookingSystem.Validators;

public sealed class UpsertSlotRequestDtoValidator : AbstractValidator<UpsertSlotRequestDto>
{
    public UpsertSlotRequestDtoValidator()
    {
        RuleFor(x => x.OfferId)
            .NotEmpty();

        RuleFor(x => x.Capacity)
            .GreaterThan(0)
            .WithMessage("Slot capacity must be greater than zero.");

        RuleFor(x => x.StartsAt)
            .LessThan(x => x.EndsAt)
            .WithMessage("Slot start time must be earlier than end time.");

        RuleFor(x => x.EndsAt)
            .GreaterThan(x => x.StartsAt)
            .WithMessage("Slot end time must be later than start time.");
    }
}
