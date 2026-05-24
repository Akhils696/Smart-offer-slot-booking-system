# smart-offer-booking-system

Production-style foundation for a Smart Offer Slot Booking platform. Businesses will be able to publish discounted offers with bookable slots, while customers reserve available slots online.

Phase 1 focuses on architecture and setup only. Authentication, offer management, slot rules, booking flows, analytics, and final UI polish are intentionally left for later phases.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: .NET 8 Web API
- Database: PostgreSQL
- API documentation: Swagger/OpenAPI

## Project Structure

```text
Frontend/
  src/
    api/
    assets/
    components/
      common/
      forms/
      layout/
      ui/
    hooks/
    layouts/
    pages/
      admin/
      auth/
      public/
    routes/
    services/
    store/
    types/
    utils/
    constants/
    contexts/
    styles/

Backend/
  Controllers/
  Services/
  Interfaces/
  Repositories/
  DTOs/
  Models/
  Data/
    Context/
    Configurations/
    Migrations/
    Seed/
  Middleware/
  Helpers/
  Mappings/
  Validators/
  Extensions/
  Common/
```

## Frontend Setup

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

Useful commands:

```bash
npm run build
npm run lint
npm run preview
```

Environment variable:

```text
VITE_API_BASE_URL=https://localhost:7084/api
```

Configured frontend foundation:

- React Router with public, auth, and admin route groups
- `AppLayout`, `PublicLayout`, and `AdminLayout`
- TanStack Query provider
- Axios base client with bearer token hook
- Tailwind base theme and global styles
- Placeholder pages for Login, Dashboard, Offers, Bookings, Public Home, and Offer Details

## Backend Setup

Install the .NET 8 SDK, then restore and run the API:

```bash
cd Backend
dotnet restore
dotnet run
```

Default backend URLs:

```text
https://localhost:7084
http://localhost:5084
```

Swagger is available in development:

```text
https://localhost:7084/swagger
```

Required configuration:

```text
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=smart_offer_booking;Username=postgres;Password=postgres
Jwt__Issuer=smart-offer-booking-system
Jwt__Audience=smart-offer-booking-system
Jwt__SigningKey=replace-with-a-strong-development-secret-at-least-32-characters
Cors__AllowedOrigins__0=http://localhost:5173
```

Apply the initial migration:

```bash
dotnet ef database update
```

If EF tools are not installed:

```bash
dotnet tool install --global dotnet-ef
```

Configured backend foundation:

- PostgreSQL via Entity Framework Core
- Foundational entities: User, Business, Offer, OfferSlot, Booking
- Entity configurations and initial migration
- Swagger/OpenAPI with JWT bearer definition
- JWT authentication structure
- CORS policy for the frontend dev server
- Central exception middleware
- Consistent API response records
- AutoMapper and FluentValidation registration

## Database

Create a local PostgreSQL database before running migrations:

```sql
CREATE DATABASE smart_offer_booking;
```

The initial migration creates only foundational tables and indexes. Business rules and booking constraints should be added in later phases alongside service-level behavior and tests.
