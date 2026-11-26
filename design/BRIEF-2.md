# APEX AORA — phase 2 brief (shared by all builders)

Project: `e:\ahmed\delivary` — Expo SDK 58 + Expo Router (routes in `src/app/`), NativeWind v4 (Tailwind 3 via `className`),
Redux Toolkit (+ redux-persist), TanStack Query over a fake backend (`src/api/mock.ts`, saved to the phone with AsyncStorage).
TypeScript strict, `@/` = `src/`. Brand: APEX AORA (violet/blue/cyan logo gradient). Windows machine: prefer the Write/Edit tools.
Other builders are editing other files AT THE SAME TIME — only touch the files you own (listed in your task).

## Read first
- `src/components/ui/index.ts` and what it exports (Text, Button, IconButton, Header, Screen, TextField, PhoneField, Card, OptionCard,
  RadioRow, SegmentedTabs, InfoBanner, ListRow, SectionLabel, RouteMap, Sheet, RouteStops, GradientText, GradientIcon, DirIcon, StaticTabBar …)
- `src/components/account/index.tsx` (AccountHeader = tinted top band with back + support/bell, title, subtitle; AvatarPicker; QueryState)
- `src/i18n/index.ts` and `src/i18n/locales/*` (translation system), `src/constants/theme.ts` (colors, brandGradient)
- `src/store/index.ts` + slices, `src/api/hooks.ts`, `src/api/types.ts`, `src/api/mock.ts`

## Translation rules (Arabic + RTL) — apply to every string you write or touch
- Never hard-code user-visible English. `const t = useT()` (from `@/i18n`), then `t("namespace.key")`, with `{var}` placeholders:
  `t("orders.itemsCount", { n: 3 })`.
- Put strings in YOUR namespace file `src/i18n/locales/<ns>.ts` with BOTH `en` and `ar` (proper Modern Standard Arabic, natural
  for UAE users, keep brand "APEX AORA" in Latin letters, keep "AED" amounts as `{amount} درهم` style via the `common.aed` key or your own).
  Shared generic words already exist in `common` (continue, back, cancel, edit, required, optional, pickup, dropoff, tabs…) — use them;
  do NOT edit `common.ts` (owned by the coordinator). Need another shared word? put it in your own namespace.
- Module-level arrays of labels (e.g. `const OPTIONS = [{ label: "Home" }]`) must move inside the component or store a key and call t() at render.
- Layout flips automatically in Arabic (`I18nManager` RTL): use `gap`, `flex-row`, `ms-/me-/ps-/pe-` (start/end) instead of `ml-/mr-/pl-/pr-`
  when the side matters, `text-start` not `text-left`. Arrows/chevrons: use `DirIcon` (auto-mirrors) instead of `Ionicons` for
  arrow-back/forward, chevron-back/forward, send, etc. `IconButton`, `Button` icons and `ListRow` chevrons already mirror.
- Phone numbers, codes (#APX-…), plates and the OTP stay left-to-right (wrap in a View with `style={{ direction: "ltr" }}` if needed).
- Dates: use helpers from `src/lib/format.ts` (the translation builder makes them language-aware).
- Text component already switches to the Arabic font (Cairo) — always use `Text` from `@/components/ui`.

## Done when
- `npx tsc --noEmit` has no errors in YOUR files (ignore other builders' in-progress errors). Don't run expo start/export.
- Final report (short): files changed/added, anything not done, any change you need in a file you don't own (exact proposal, not applied).
