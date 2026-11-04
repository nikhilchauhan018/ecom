# Task Tracker (client storefront)

Single source of truth for what is built, what is not, and what is next.
**Update this file at the end of every task.**

Backend notes (rate limiting, SMS-pumping guards, sessions, API contract): see `BACKEND_REQUIREMENTS.md`.

## Working rules
1. Scope: client storefront work stays in `frontend/src/client/**`. **Admin work (`frontend/src/admin/**`) is now allowed
   because the owner asked for it explicitly (2026-11-04), but only for the admin task currently in progress (section D).**
   Do not mix client and admin changes in one task.
2. One task at a time. Finish, update this doc, report, then wait for the next instruction.
3. Run available npm scripts from `frontend/` when dependencies are available. Mark work `UNVERIFIED`
   only when it has not been executed; record actual command results in the relevant task.
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

### T4. Run and fix — `DONE` (verified 2026-11-03)
- [x] `npm ci`; `npm test` (150 passed); `npm run lint` (exit 0; 12 existing warnings); `npm run build` (success, 390 modules).

### T5. Remaining storefront pages — `TODO` (after the above)
- [ ] Shop / category listing, Product detail, Cart, Wishlist, Search

### T6. Checkout improvements — `DONE` (verified 2026-11-03)
- [x] Added an accessible Cart → Address → Payment progress indicator and responsive checkout layout.
- [x] Kept saved-address selection; added validated address creation and editing for signed-in and guest shoppers.
- [x] Added product images and available variants, quantity controls, remove actions, and a product-only subtotal breakdown.
- [x] Added empty/unavailable-cart handling and catalog-load error/retry UI.
- [x] Cash and online options are selectable, but both remain preview-only: no payment or order is created.
- Verification: browser-smoke-tested checkout at 1280px and 390px; address validation/add/edit/selection,
  payment selection, product variants, quantity/subtotal changes, removal, and the empty-cart state.
  The catalog retry branch is present, but the deterministic mock catalog did not fail during the browser run.
- Backend payment/order integration remains unavailable and unfinished.

---

## D. Admin dashboard — Ecommerce section (audit 2026-11-04, read-only so far, nothing changed yet)

Entry: `/ecommerce/*` -> `admin/routes/AppRoutes.jsx` (lazy-loaded from `App.jsx`). Sidebar: `admin/config/navigation.js`.
Stack: React + Bootstrap + Tailwind (`tw-`), data via `admin/services/api/*.js` over `admin/data/*.mock.js`.
Caveat: this audit read the routes, nav, orders list + service, and grepped the rest. Pages not opened in detail:
Dashboard, ProductForm, Customers, Discounts, Reviews, Shipments, Shipping, Returns, Invoices, Categories.

### D1. Status of each nav item
| Nav item | Route | State |
| :--- | :--- | :--- |
| Dashboard | `/ecommerce` | page exists, reads `dashboard.mock` directly (no service layer) |
| Orders | `/orders`, `/create`, `/:id`, `/:id/edit` | list/detail/form exist; see D2 |
| Order Returns | `/order-returns` | list page only (read-only) |
| Shipments | `/shipments` | list page only |
| Invoices | `/invoices`, `/:id/edit` | list + detail |
| Products | `/products`, `/create`, `/:id/edit` | most complete (variants, CSV import/export) |
| Product Inventory | `/product-inventory` | page exists |
| Categories | `/categories`, `/create`, `/:id/edit` | list + form |
| Customers | `/customers` | list only |
| Discounts | `/discounts` | list only (no create/edit) |
| Reviews | `/reviews` | list only (no moderation actions) |
| Shipping | `/shipping` | list only |
| **Report** | `/report` | **placeholder (ComingSoonPage)** |
| Incomplete Orders | `/incomplete-orders`, `/:id` | list + detail built 2026-11-04 (`UNVERIFIED`, see A4) |
| **Product Prices** | `/product-prices` | **placeholder** |
| **Notifications** | `/notifications` | **placeholder** |
| Other sidebar items (Pages, Blog, Payments, Ads, Contact, Sliders, FAQs, ...) | outside `/ecommerce` | fall through to `*` -> placeholder |

### D2. Problems found (verified by reading code)
1. **No authentication or authorization on the admin at all.** `/ecommerce` is open to anyone who knows the URL; there
   is no `RequireAdmin`, no roles. The storefront now has real auth, the admin has none. Highest-priority gap.
2. **Orders list actions are local-only.** In `OrdersPage.jsx`, bulk status change, bulk delete and single delete only
   edit React state. They never call `bulkUpdateStatus` / `deleteOrder` / `bulkDelete` in the service, so changes vanish on
   reload and a real backend would never be told. Also `bulkAction` uses the raw action string as the status.
3. **Mock service inconsistencies** (`services/api/orders.js`): `deleteOrder` / `bulkDelete` / `bulkUpdateStatus` do not
   mutate the mock; `createOrder` accepts any payload (no validation, no server-side total calculation);
   `updateOrderStatus` does not validate allowed status transitions; actor is hard-coded `'Owner'`.
4. **Pages import mock data directly** (`OrdersPage`, `OrderFormPage` import `data/orders.mock`; Dashboard imports
   `dashboard.mock`) instead of going through services, so swapping to a real API means editing pages.
5. **Performance:** list filtering/sorting is client-side over the full dataset and there is no request cancellation or
   caching (stale responses can overwrite newer ones on fast filter changes); no list virtualisation; `OrdersPage`
   re-creates large inline handlers and recomputes on every render; all lists use full reloads after mutations.
6. **Large page components**: `OrdersPage.jsx` mixes data loading, URL state, export, pagination and UI in one file.
7. `window.confirm` is used for destructive actions (works, but is inconsistent with a proper dialog and untestable).
8. Admin code duplicates things the client now has (formatMoney, safeUrl, Button, Pill, ...). Not urgent.
9. `PROJECT_CONFIG.md` still says `lint = tsc --noEmit`, port 3000 (stale).

### D3. Proposed admin tasks (one at a time, in this order; owner to confirm)
- [x] **A1. Fix Orders list wiring** (D2.2, D2.3) — `DONE` (written 2026-11-04; owner ran `npm test`: all pass, `npm run lint`: 0 errors, 2026-11-04)
      - `features/orders/orderStatus.js`: status rules (`allowedNextStatuses`, `canTransition`, `canDelete`, `BULK_STATUSES`,
        error messages). Business assumptions are documented at the top of that file: forward-only with skipping allowed,
        cancel only before shipping, delivered -> returned, only pending/cancelled orders deletable. **Owner to confirm.**
      - `features/orders/orderActions.js` (new, pure): `changeStatus`, `bulkChangeStatus`, `removeOrders`, `stripProtectedFields`,
        `summarizeBulk`. Per-order results `{ updated|deleted: [], failed: [{id, code}] }`, max 200 per batch, dedupes ids.
      - `services/api/orders.js`: delete / bulk update / bulk delete now really mutate the mock and enforce the rules;
        `updateOrder` ignores `id/number/createdAt/status/history`; `createOrder` validates and always starts `pending`.
      - `OrdersPage.jsx`: bulk + single delete call the service, show a success/partial/error notice, then reload the list.
      - `OrderDetailPage.jsx`: status dropdown only offers allowed moves; errors shown instead of an unhandled rejection;
        delete result checked. `OrderFormPage.jsx`: save wrapped in try/finally so the button cannot stay stuck.
      - Tests written (never run): `features/orders/orderActions.test.js`.
      - NOT done / left for later: sidebar "pending orders" badge does not refresh after changes (needs A2 shared data layer);
        `createOrder` does not recompute totals server-side; refund amount is only validated in the UI; `window.confirm` still used.
- [ ] **A2. Shared data layer + performance** (D2.4, D2.5) — `IN PROGRESS`, step 1 of N (Orders list): `npm test` all pass, `npm run lint` 0 admin warnings (owner ran, 2026-11-04); browser checks below NOT yet confirmed
      - `utils/latestOnly.js` (+ `.test.js`): stale-response guard, newest request wins.
      - `hooks/useResource.js`: `useResource(fetcher, params)` -> `{ data, error, loading, reload }`. Params compared by value;
        only the latest request writes; previous data kept while reloading. (No unit test: needs a DOM, the logic is covered by latestOnly tests.)
      - `features/orders/orderQuery.js` (+ `.test.js`): `loadOrdersPage` last-page fallback, now a pure testable function.
      - `OrdersPage.jsx` now uses `useResource`. Fixed on the way: (a) opening `?page=3` used to be reset to page 1 by the
        search debounce on mount; (b) selection is cleared on every new result; (c) the URL page follows the page actually served;
        (d) an error no longer also shows "No orders found".
      - To verify (owner): `npm test`, `npm run lint`, then in the browser: `/ecommerce/orders?page=2` stays on page 2;
        type in search quickly and the list matches the last text; bulk delete + status change still show the notice and reload;
        delete the last row of the last page -> lands on the previous page.
      - Step 2 (written 2026-11-04, `UNVERIFIED`): `OrdersPage` and `OrderFormPage` no longer import `data/*.mock`.
        `services/api/orders.js` gained `listPaymentMethods()` and `getOrderFormOptions()` (payment methods + customers + products);
        `features/orders/orderFormOptions.js` (+ `.test.js`, 4 tests) derives the pickers. Form: first available payment method is the
        default until the user picks one; saving is blocked with a message if the methods have not loaded yet.
        To verify (owner): `npm test`, `npm run lint`; browser: `/ecommerce/orders` filter panel still lists payment methods;
        `/ecommerce/orders/create` customer search, product picker and payment dropdown work; the saved order has the chosen method.
      - Step 2 result: owner ran `npm test`, the 4 new tests pass (2026-11-04). Browser checks still not confirmed.
      - Step 3 (written 2026-11-04, `UNVERIFIED`): `DashboardPage` no longer imports `dashboard.mock`.
        New `services/api/dashboard.js` (`getDashboardSummary`, returns a copy) + `dashboard.test.js` (2 tests) and a shared
        `components/ui/AsyncState.jsx` (`LoadingBlock`, `LoadError` with Retry) to reuse on every list page.
        Dashboard shows a loading block, then the sections, or an error with Retry.
        Note: the dashboard "Security overview" card is still demo data (TODO already in `dashboard.mock.js`), not real state.
        First `npm test` run failed: `dashboard.js` imported `data/dashboard.mock` without `.js` and Node needs the extension
        (rule: services that a Node test imports directly must use `.js` in their imports). Fixed 2026-11-04, needs a re-run.
        To verify (owner): `npm test` (2 new), `npm run lint`; browser: `/ecommerce` shows a short loading block then the same
        dashboard as before.
      - Step 3 result: owner re-ran `npm test`, 173 of 173 pass (2026-11-04). Browser checks for steps 1 to 3 still not confirmed.
      - Step 4 (written 2026-11-04, `UNVERIFIED`): `CustomersPage.jsx` now uses `useResource` + `AsyncState`.
        Removed the manual loading/error flags (they were set by hand on every keystroke and filter change). Retry button on error.
        Search typing now uses `replace`, so the browser Back button no longer steps through every search pause.
        No new unit test: nothing new to test outside the screen (list logic is the existing `listCustomers`).
        To verify (owner): `npm run lint`; browser `/ecommerce/customers`: list loads; type in search and the list follows the last
        text; status filter works; Back goes to the previous page, not through each search pause.
      - Step 5 (written 2026-11-04, `UNVERIFIED`): **URL-state toolkit for all list pages** (owner asked for an advanced solution).
        `utils/queryState.js` (+ `.test.js`, 14 tests): pure `readQuery` / `writeQuery` (schema with defaults, invalid values fall
        back, defaults removed from the URL, page resets to 1 when a filter really changes, input never mutated).
        `hooks/useQueryState.js`: `const [query, setQuery] = useQueryState(SCHEMA)`; `query` goes straight into `useResource`.
        `hooks/useSearchInput.js`: debounced search box that commits to the URL, follows Back/Clear from outside, and is not
        overwritten by the echo of its own commit. `CustomersPage.jsx` rewritten on top of them (about 25 lines less).
        Pattern for every remaining list page: `QUERY` schema + `useQueryState` + `useSearchInput` + `useResource` + `AsyncState`.
        To verify (owner): `npm test` (14 new), `npm run lint`; browser `/ecommerce/customers`: search follows typing, trailing
        space typed in the box is kept, status filter works, Back/Forward restore both search text and filter, reload keeps them.
      - Step 5 result: owner ran `npm test`, all pass (2026-11-04). Browser checks for steps 1 to 5 still not confirmed.
      - Step 6 (written 2026-11-04, `UNVERIFIED`): the step 5 pattern applied to **Categories, Discounts, Reviews, Returns,
        Shipments, Shipping, Invoices** (7 pages). Manual loading/error flags, hand-written debounce and `setParams` code removed.
        Behaviour notes: delete (Invoices, Categories) now reloads the list from the service instead of filtering local state, and
        keeps its own `actionError` separate from the load error; Shipping zones and Categories parent list load through
        `useResource` too; Categories search box lost its `key={search}` (it re-created the input on every committed search).
        Known small gap: after deleting a category the parent-category dropdown/names list is not reloaded until the page is revisited (same as before).
        To verify (owner): `npm run lint` (no admin warnings); browser, on each of `/ecommerce/{categories,discounts,reviews,order-returns,shipments,shipping,invoices}`:
        list loads; search follows typing; each filter works; Back/Forward and reload keep search and filters;
        Invoices and Categories: delete one row and the list refreshes (delete on a category with children should show the reason).
      - Remaining A2 steps: Inventory, Products (biggest), `OrdersPage` onto the toolkit, detail/form pages
        (`OrderDetailPage`, `InvoiceDetailPage`, `CategoryFormPage`, `ProductFormPage`) onto `useResource`. Old list: Categories, Discounts, Reviews, Returns,
        Shipments, Shipping, Invoices, Inventory, Products (Customers done). Old list below kept for reference: Products, Customers, Categories, Inventory, Discounts, Reviews,
        Returns, Shipments, Shipping, Invoices; sidebar pending-orders badge refresh; React.memo on table rows if profiling shows need.
- [ ] **A3. Admin authentication + roles** (D2.1): `RequireAdmin`, admin login, role/permission checks per section,
      idle timeout; backend contract added to `BACKEND_REQUIREMENTS.md`.
- [ ] **A4. Placeholders -> real pages:** Report (sales/orders analytics), Incomplete Orders (abandoned carts),
      Product Prices (bulk price editor), Notifications.
      - **Incomplete Orders** (owner sent a reference screenshot, 2026-11-04) — `UNVERIFIED`, written 2026-11-04.
        List `/ecommerce/incomplete-orders`: Bulk actions (delete), Filters (date and amount range, validated), search, Create
        (goes to the create-order form), Export (CSV only: an ".xls" that is really CSV makes Excel warn), Reload; table with
        checkbox, sortable ID / Customer / Amount / Created at, Store, Operations (view = eye, delete = red bin); pagination;
        active-filter chips; guests with no name show as "Guest". Detail `/ecommerce/incomplete-orders/:id`: cart items, total,
        customer, delete. State lives in the URL (toolkit from A2 step 5).
        Files: `features/incomplete-orders/{IncompleteOrdersPage,IncompleteOrderDetailPage}.jsx`, `components/*`,
        `incompleteOrderQuery.js` (+ test, pure logic), `services/api/incompleteOrders.js` (+ test), `data/incompleteOrders.mock.js`.
        New shared pieces: `components/ui/{Pagination,SortButton,Breadcrumb}.jsx`, `Notice` in `AsyncState.jsx`,
        `utils/pagination.js` (+ test), `hooks/useRowSelection.js`, `eye` icon.
        Differences from the screenshot (on purpose): money has no decimals (the whole admin uses `formatMoney` with 0 decimals,
        the screenshot shows ₹40.00); the Store column shows `site.name` from `config/site.js` for every row (single vendor,
        still the placeholder "[YOUR STORE]" until the owner fills it); guests show "Guest" instead of an empty cell.
        Follow-up debt: `OrdersPage` still has its own copy of pagination, sort buttons, notice and selection logic. Move it onto
        the shared pieces when `OrdersPage` is moved onto the toolkit.
        To verify (owner): `npm test`, `npm run lint`; browser `/ecommerce/incomplete-orders` (checklist in the chat reply).
- [ ] **A5. Make list-only pages complete:** Discounts create/edit, Reviews moderation, Returns approve/reject/refund,
      Shipments create/track, Shipping methods CRUD, Customers detail.
- [ ] **A6. Admin-controlled login method (this is client task T2):** admin Settings screen writes `auth.methods`.
- [ ] **A7. Final pass:** tests for each utils/service, lint, bundle size check, update this doc.

Rule for every admin task: write the backend rule it needs into `BACKEND_REQUIREMENTS.md` as part of the task.
