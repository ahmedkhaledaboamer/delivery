# APEX AORA — Delivery App

React Native (Expo) delivery app (originally designed in Figma as RUSH, rebranded to APEX AORA).

**Stack:** Expo SDK 58 · Expo Router · NativeWind (Tailwind) · Redux Toolkit · TanStack Query · TypeScript

## Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go.

## Structure

- `src/app/` — screens (Expo Router: every file is a route)
- `src/components/ui/` — shared UI components
- `src/store/` — Redux Toolkit (auth, delivery draft, settings)
- `src/api/` — TanStack Query hooks + mock backend (`mock.ts`) until the real API is ready
- `assets/images/` — illustrations from the design
- `design/` — design screenshots used as reference

In development, the grid button on Home opens a list of every screen.
- `design/original-illustrations/` — the green (pre-rebrand) illustrations
- `design/logo-original.png` — the APEX AORA logo as supplied
