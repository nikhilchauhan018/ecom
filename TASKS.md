# Task Tracker (client storefront)

Single source of truth for what is built, what is not, and what is next.
**Update this file at the end of every task.**

Backend notes (rate limiting, SMS-pumping guards, sessions, API contract): see `BACKEND_REQUIREMENTS.md`.

## Working rules
1. Scope: only `frontend/src/client/**` (plus this file and tests). **Never touch `frontend/src/admin/**`.**
2. One task at a time. Finish, update this doc, report, then wait for the next instruction.
3. The terminal sandbox is broken on this machine, so the assistant cannot run `npm test` / `npm run lint`.
   Anything marked `UNVERIFIED` has been written and diagnostics-checked in the editor, but not executed.
   The owner runs `npm test` and `npm run lint` in their own PowerShell (in `frontend/`) and pastes failures back.
4. `backend/` is empty. All server behaviour lives in `src/client/services/mock/mockServer.js` and is a
   stand-in that must be replaced by real endpoints. The mock is **not** real security.

Legend: `DONE` built + diagnostics clean | `UNVERIFIED` written, not executed | `TODO` | `IN PROGRESS`

---

## A. Built so far

### A1. Storefront shell (pre-existing, not mine)
- Home page, header/footer/bottom tab bar, settings hook. Other routes (`/shop`, `/cart`, `/wishlist`,
  `/search`, `/product/:slug`, categories, seasons) are still **placeholders** (`StoreSubPage`).

### A2. Account hub `/account` — UNVERIFIED
- `features/account/AccountPage.jsx` + `components/{AccountHeader,AccountShell,ProfileCard,QuickActions,ActiveOrderCard,MenuSection}.jsx`
- Responsive: mobile single column, desktop two columns (overview + sticky menu). Icons on menu rows.
- Design source: mobile screenshot of "6 Account.pdf". Desktop layout is my own design.

### A3. Auth (phone + OTP) — UNVERIFIED
- `features/auth/{LoginPage,RequireAuth,IdleGuard}.jsx`, `features/auth/components/OtpForm.jsx`
- `stores/authStore.js`, `hooks/useAuth.js`, `hooks/useCountdown.js`, `services/auth.js`
- `RequireAuth` guards account/orders/returns routes. `?next=` validated by `utils/safeRedirect.js`.
- Idle sign-out (30 min) with warning dialog; cross-tab sign-out via BroadcastChannel.

### A4. Account sub-pages — UNVERIFIED
| Route | File |
| :--- | :--- |
| `/account/profile` | `features/account/ProfilePage.jsx`, `ChangePhoneDialog.jsx` |
| `/account/addresses`, `/new`, `/:id` | `AddressesPage.jsx`, `AddressFormPage.jsx`, `components/AddressForm.jsx` |
| `/account/notifications` | `NotificationsPage.jsx` |
| `/account/security` | `SecurityPage.jsx` |
| `/account/delete` | `DeleteAccountPage.jsx` (typed word + step-up OTP) |
| `/orders`, `/orders/:id`, `/orders/:id/track` | `features/orders/*` |
| `/returns`, `/returns/new` | `features/returns/*` |
| `/about /contact /policies/*` | `features/content/ContentPage.jsx`, `data/content.js` (starter text, needs legal review) |

### A5. Shared UI + utils — UNVERIFIED
- UI: `Button` (loading/outline/danger), `Field`, `Switch`, `Dialog` (native `<dialog>`), `Notice`, `AsyncState`, `EmptyState`, `Icon` (many new icons).
- Utils: `validators`, `safeRedirect`, `secure`, `format`, `orders`, `errors`.
- Config: `security.js` (OTP/session limits), `countries.js`, `account.js`, `constants.js`.
- Locale: `locales/en.js` (auth, errors, validation, profile, addresses, notifications, security, orders, returns).
- Tests written (never run): `tests/{validators,safeRedirect,orders,errors,mockServer,account}.test.js`.

### A6. Mock server rules (what the REAL backend must also do)
- Session required on every account call (401 otherwise); idle 30 min / absolute 12 h; session id rotated on login.
- OTP: 6 digits, 5 min expiry, single use, 5 wrong attempts => 15 min lockout, constant-time compare.
- OTP send limits (**per phone number only**): 30 s resend cooldown, 5 sends/hour. Returns HTTP 429 `rate_limited` with `retryAfterSec`.
- Same response for known/unknown numbers (no enumeration). Foreign record ids => 404 (no IDOR).
- All input re-validated server-side. Delete account needs a single-use, 5 min re-auth token.

---

## B. Known gaps / honest limitations
- OTP limits are **per phone number only**. No per-IP / per-device limit, no CAPTCHA, no daily global cap => open to
  SMS-pumping (attacker cycles through many numbers). Needs the real backend (see T3).
- Mock OTP counters are **in memory**: a page reload resets them. A real server must persist them.
- Login is phone-only. No email login yet. Admin cannot choose the method yet (T2).
- Country detection is a heuristic (saved choice > server IP hint > time zone > browser language > US). The real
  IP hint needs a backend `GET /geo` (`services/geo.js` is a stub returning null).
- `AddressForm` phone field still uses the old plain input; it needs the country picker (T1b).
- Nothing has been executed: tests/lint unverified (rule 3).
- `PROJECT_CONFIG.md` is outdated (port, lint command) and contains a plaintext GitHub token. **Revoke that token.**

---

## C. Task list (do in order, one at a time)

### T1. Country code auto-detect + phone field — `UNVERIFIED` (written 2026-10-31)
Goal: user sees a country dial code pre-selected from their region; pasting `+91…` switches it.
- [x] `config/dialCodes.js`: 43 countries + dial codes + time-zone -> country map
- [x] `utils/phone.js`: `detectCountry`, `matchDialCode`, `resolvePhone`; tests in `tests/phone.test.js`
- [x] `services/geo.js`: server IP-country hint (stub, returns null until backend exists)
- [x] `hooks/usePhoneCountry.js`: detect + remember the user's choice (stores country code only, never the number;
      localStorage key `client_phone_country`)
- [x] `components/ui/PhoneField.jsx`: country select + number input, auto-switches on `+xx` / `00xx` input
- [x] Wired into `LoginPage` and `ChangePhoneDialog`
- Behaviour notes: leading trunk `0` is dropped (`07700…` + GB => `+447700…`); a shared dial code (`+1`) keeps the
  currently selected country, else defaults to US.
- To verify (owner): `npm test`; open `/login` on a device with an Indian time zone => India +91 preselected.

### T1b. Use PhoneField in `AddressForm` — `TODO`

### T2. Admin-controlled login method (phone / email / both) — `TODO`
Client side only. Admin screens are out of scope; the client reads a setting and adapts.
- [ ] `settings.auth = { methods: ['phone' | 'email'], defaultMethod }` in client settings (mock) + type
- [ ] Login page: shows only allowed methods (tabs when both)
- [ ] Email OTP flow in mock server + email validation + masked email in responses
- [ ] `identifier` generalisation (phone or email) in authStore / profile / change-contact dialogs
- [ ] Document the settings API contract the admin will need to write to

### T3. OTP abuse protection (what the user can see + backend requirements) — `TODO`
- [ ] Login send button honours server `retryAfterSec` (countdown on the first step too, not just "resend")
- [ ] Persist the client-side cooldown across reloads (sessionStorage timestamp, UX only)
- [ ] CAPTCHA/Turnstile hook point (`captchaToken` field in request, off by default)
- [x] Backend checklist (per-IP, per-device, per-country, daily cap, SMS-pumping guard): written in
      `BACKEND_REQUIREMENTS.md` section 1 (saved 2026-10-31). Remaining T3 items are the client-side ones above.

### T4. Run and fix — `TODO` (needs the owner's terminal)
- [ ] Owner runs `npm test` and `npm run lint`; paste failures; fix.

### T5. Remaining storefront pages — `TODO` (after the above)
- [ ] Shop / category listing, Product detail, Cart, Wishlist, Search, Checkout
