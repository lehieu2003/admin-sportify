# Admin Manager

React + TypeScript + Tailwind (Vite) foundation for Sportify admin management.

## Environment

Create `.env` from `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Sportify Admin
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run check
```

## Implemented in Phase 1

- Tailwind CSS setup using Vite plugin (`@tailwindcss/vite`).
- App shell with React Router routes:
  - `/login` (public)
  - `/` `/catalog/*` `/spotify-import` (admin-protected)
  - `/forbidden`, `*` (fallback pages)
- Access + refresh token auth foundation:
  - `signin` `/auth/signin`
  - token rotate `/auth/refresh`
  - profile `/auth/me`
  - signout `/auth/signout`
- Authorized HTTP client with automatic one-time retry on `401`.
- Admin layout and placeholder pages for Dashboard/Catalog/Spotify Import.
