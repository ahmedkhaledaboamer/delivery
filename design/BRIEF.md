# Rush app — build brief (shared by all screen builders)

Project: `e:\ahmed\delivary` — Expo SDK 58 + Expo Router (routes in `src/app/`), NativeWind v4 (Tailwind 3 classes via `className`),
Redux Toolkit (client/flow state), TanStack Query (server state, currently a fake in-memory backend). TypeScript strict. `@/` = `src/`.
Windows machine: prefer the Write/Edit tools for files (bash heredocs with many files have failed here).

Design screenshots (read them with the Read tool — they are images): `e:\ahmed\delivary\design\1.png` … `13.png`.

## Read before writing anything
- `src/components/ui/index.ts` and every file it exports (Text, Button, IconButton, Logo, Screen, Header/PageTitle, TextField, PhoneField,
  Card, RadioDot/Checkbox/OptionCard/RadioRow/SegmentedTabs/QuantityStepper, InfoBanner, ListRow/SectionLabel, OtpInput, RouteMap, Sheet,
  RouteStops, BottomTabBar/TAB_BAR_SPACE)
- `src/components/delivery/` (TipSelector, OffersRewards + useDraftDiscount, TermsAgreement)
- `src/store/index.ts` + `src/store/slices/*` (auth, delivery draft, settings)
- `src/api/hooks.ts`, `src/api/types.ts`, `src/api/mock.ts`
- `src/lib/format.ts`, `src/lib/pricing.ts`, `src/constants/theme.ts`, `tailwind.config.js`

## Hard rules
- Only edit the files you own (listed in your task). Everything above is READ-ONLY, as are `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`,
  `src/app/index.tsx`. Other builders are editing other screens at the same time.
- Need a new reusable piece? Put it in your own folder `src/components/<your-folder>/`. If a shared file truly needs a change, do NOT edit it —
  put the exact proposed change in your final report.
- No new npm packages. Already installed and usable: expo-image-picker, expo-document-picker, expo-linear-gradient, expo-clipboard,
  react-native-maps (via RouteMap), @expo/vector-icons (use Ionicons), react-native-svg.
- Always use `Text` from `@/components/ui`, never react-native's Text. Font weight only via `font-inter`, `font-inter-medium`,
  `font-inter-semibold`, `font-inter-bold` (never font-bold/font-semibold). Colors: `brand`, `brand-dark`, `brand-accent`, `brand-light`,
  `brand-lighter`, `surface`, `ink`, `body`, `muted`, `line`, `danger`, `danger-light`. Raw values in `colors` from `@/constants/theme`.
- There are NO image assets (logo, illustrations, hero photo, map pins art). Use stand-ins: Ionicons inside rounded brand-light tiles/circles
  (cube-outline for boxes, storefront-outline for shop, bicycle for motorcycle, car-sport-outline for car, etc.), `Logo` component for the logo,
  expo-linear-gradient for hero areas. Mark each with `// TODO: replace with Figma illustration`.
- Match the screenshots: copy text, section order, spacing, rounded cards, pill buttons, green tints. Fix obvious typos in the design copy
  ("Reseive" → "Receive", "Dropdown Location" → "Drop-off Location", "Countinue" → "Continue", "Releable" → "Reliable").
- Screens must actually work: inputs bound to Redux/local state, Continue disabled until required fields are valid, loading + error states for
  queries (ActivityIndicator / short message), mutations show loading on the button.
- Tab screens (`src/app/(tabs)/*`) must add bottom padding `TAB_BAR_SPACE` so content clears the floating tab bar.
- Done = `npx tsc --noEmit` shows no errors in YOUR files (ignore errors in files you don't own — others are mid-edit). Don't run expo start/export.
- Final report (short): files written, anything you could not match from the design, any proposed shared-file changes.

## Route map (use exactly these paths with `router.push/replace` from expo-router)
| Route | Screen | Owner |
|---|---|---|
| `/onboarding/splash` | splash (logo, auto-advances) | A |
| `/onboarding/welcome` | "Welcome to RUSH" — Continue / Sign In | A |
| `/onboarding/pickup-dropoff` | "Pick up. / Drop off." onboarding page | A |
| `/onboarding/live-tracking` | "Always in sight." onboarding page | A |
| `/auth/sign-in` | Customer/Store sign in | A |
| `/auth/sign-up` | Customer/Store sign up | A |
| `/auth/verify` | 6-digit OTP | A |
| `/(tabs)` (file `(tabs)/index.tsx`) | Home | A |
| `/send/service` | Send / Receive / Personal Shopping picker (Frame 94) | B |
| `/send/delivery-type` | Delivery Type + Choose Service (Frame 95) | B |
| `/send/shopping` | Personal Shopping form | B |
| `/send/pickup` | Pickup location + sender (1 of 7) | B |
| `/send/dropoff` | Drop-off location + receiver | B |
| `/send/confirm-route` | Confirm your route (2 of 7) | B |
| `/send/package` | What are you sending? (4 of 7) | B |
| `/send/review` | Ready to send? (6 of 7) → creates the order | B |
| `/payment-success?orderId=ID` | Payment Successful (shared by customer + store flows) | B |
| `/store/create-request` | Create Delivery Request (Frames 92/93/91) | C |
| `/store/order-details?index=N` | Order #N+1 drop-off + receiver (Frames 87/88) | C |
| `/store/confirm-route` | Confirm your route — all store orders | C |
| `/store/order-confirmed` | Order Confirmed → Go to pay (creates the order) | C |
| `/(tabs)/orders` (accepts `?tab=past`) | My orders (+ empty state) | C |
| `/orders/[id]` (file `orders/[id]/index.tsx`) | Order details | C |
| `/orders/[id]/track` | Tracking (rider on the way / parcel on its way) | C |
| `/orders/[id]/delivered` | Delivered. Day made. + rating | C |
| `/orders/[id]/cancel` | Cancel this delivery? | C |
| `/(tabs)/profile` | My profile | D |
| `/account/edit-profile` | Edit profile | D |
| `/account/settings` | Settings (incl. Sign out) | D |
| `/account/language` | Choose your language | D |
| `/account/about` | About RUSH | D |
| `/account/privacy` | Privacy Policy | D |
| `/account/terms` | Terms of Service & Disclaimer | D |
| `/account/wallet` | My Wallet | D |
| `/account/loyalty` | Loyalty Point | D |
| `/account/support` | Help & Support — Support Tickets | D |
| `/account/new-ticket` | Create New Ticket | D |
| `/notifications` | Notifications | D |

## Flow rules
- Home "Deliver Now": `role === "store"` → `/store/create-request`, else `/send/service`. Track Package → `/(tabs)/orders`; Delivery History → `/(tabs)/orders?tab=past`.
- Customer flow: service picker dispatches `startFlow("send" | "receive" | "shopping")` → delivery-type → (shopping only: `/send/shopping`) → pickup → dropoff → confirm-route → package → review → `useCreateOrder` → `dispatch(resetDelivery())` → `router.replace("/payment-success?orderId=" + id)`.
- Store flow: create-request dispatches `startFlow("store")` then storeOrderType / vehicle / count → order-details index 0..n-1 → confirm-route → order-confirmed → `useCreateOrder({ flow: "store", dropoffs: [...] })` → resetDelivery → `/payment-success?orderId=`.
- Payment success "Track order" → `/orders/[id]/track`.
- Sign-in/up: dispatch `startVerification` + `useSendOtp` → `/auth/verify`; verify → `useVerifyOtp` → `setCredentials({ user: {..., role}, token })` → `router.replace("/(tabs)")`. Guest → `continueAsGuest` → `/(tabs)`. Sign out → `logout()` → `router.replace("/auth/sign-in")`.
