# Family Planner

A family planning and meal planning application designed to reduce the mental load of coordinating everyday life.

## Why This Exists

The idea for Family Planner came from a simple frustration:

Planning a week for a household often requires jumping between multiple tools:

- Calendars
- Notes apps
- Recipe apps
- Grocery lists
- Grocery delivery services

Even when all the information exists, it is scattered across different places and requires constant mental effort to connect.

Family Planner aims to bring the most important parts of weekly family coordination into a single place:

- What's happening this week?
- What are we eating?
- What do we need to buy?
- Who is responsible for what?

The long-term goal is to make weekly planning simple enough that the entire household can participate.

---

## Current Features (MVP)

### Weekly Meal Planning

- Plan meals for each day of the week
- Assign, change, or clear meals
- Quick overview of the week's dinners

### Meal Management

- Create meals
- Edit meals
- Delete meals
- Store ingredients and recipe instructions

### Grocery List Generation

- Automatically generates a grocery list from planned meals
- Merges duplicate ingredients
- Displays ingredient quantities/counts
- Supports manually added grocery items
- Mark items as completed

### Responsive UI

- Mobile-friendly layout
- Tablet-friendly layout
- Designed to work well on kitchen displays and shared household devices

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- ASP.NET Core
- C#
- Entity Framework Core

### Database

- SQLite (current MVP)

---

## Running Locally

### Prerequisites

- .NET SDK
- Node.js
- npm

---

### Backend

Navigate to the backend folder:

```bash
cd backend
```

Run the API:

```bash
dotnet run
```

The API will start on the configured local port.

---

### Frontend

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the URL displayed by Vite (typically `http://localhost:5173`).

---

## Deployment Configuration

The frontend and backend are deployed separately, but browser-facing API calls
go through Vercel rewrites. This keeps the app same-origin from the browser's
point of view, which is required for reliable cookie authentication.

### Vercel Frontend

This repository stores the Vite app in `frontend/`. The root `vercel.json`
builds that folder and serves `frontend/dist`, so Vercel can deploy the project
from the repository root.

Do not set `VITE_API_BASE_URL` in Vercel production. Production API requests use
relative `/api/...` URLs and are proxied by `vercel.json` to Railway. Setting
`VITE_API_BASE_URL` to the Railway URL bypasses the proxy and can cause the auth
cookie to be blocked as a third-party cookie.

### Railway Backend

Set this environment variable in Railway:

```bash
Cors__AllowedOrigins__0=https://family-planner-roan.vercel.app
```

If you also want to allow local frontend development against the Railway API,
add these too:

```bash
Cors__AllowedOrigins__1=http://localhost:5173
Cors__AllowedOrigins__2=http://127.0.0.1:5173
```

CORS origins must be exact browser origins: include `https://`, do not include
paths like `/api`, and avoid trailing slashes.

### Google Sign-In

Create an OAuth 2.0 Client ID in Google Cloud Console:

- Application type: Web application
- Authorized JavaScript origins:
  - `http://localhost:5173`
  - `https://family-planner-roan.vercel.app`
- Authorized redirect URIs:
  - `http://localhost:5123/signin-google`
  - `https://family-planner-roan.vercel.app/signin-google`

In production, do not use the Railway URL as the Google redirect URI. Vercel
proxies `/signin-google` to the backend so the browser sees the callback on the
same origin as the frontend:

```text
https://family-planner-roan.vercel.app/signin-google
```

Set these variables on the backend environment:

```bash
Authentication__Google__ClientId=your-google-client-id
Authentication__Google__ClientSecret=your-google-client-secret
```

For local development, store them with .NET user secrets from the API project:

```bash
cd backend/FamilyPlanner.Api
dotnet user-secrets init
dotnet user-secrets set "Authentication:Google:ClientId" "your-google-client-id"
dotnet user-secrets set "Authentication:Google:ClientSecret" "your-google-client-secret"
```

The frontend does not receive Google tokens or client secrets. It redirects to
the backend login endpoint, and the backend stores the authenticated session in
an HTTP-only cookie.

---

## Project Status

This project is currently in active MVP development.

The focus right now is:

- Improving usability
- Testing with real families
- Refining workflows
- Validating the core concept

The current goal is not feature completeness, but proving that the planning experience genuinely reduces household coordination effort.

---

## Planned Features

### Near-Term

- Multi-week planning
- Improved recipe management
- Better grocery quantity handling
- Enhanced mobile experience
- Household member assignments

### Future

- Calendar integration
- Shared family accounts
- Smart display / kitchen screen mode
- Widgets
- Grocery delivery integrations
- Inventory and pantry tracking
- Meal suggestions based on available ingredients
- Reduced food waste planning tools

---

## Design Principles

Family Planner is built around a few simple ideas:

- Reduce mental load
- Keep planning collaborative
- Make information easy to find
- Minimize unnecessary complexity
- Prioritize practical usefulness over feature count

---

## Development Notes

This project is being built as an MVP and learning project, with a strong emphasis on:

- Clean architecture
- Maintainable code
- Iterative development
- Real user feedback

Features are intentionally kept simple until validated through actual usage.

---

## License

Currently unlicensed. All rights reserved unless a license is added in the future.
