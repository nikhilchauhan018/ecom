# Backend requirements (living document)

Read this before writing anything in `backend/`. It lists what the client already expects and what the server
**must** do, because the browser mock (`frontend/src/client/services/mock/mockServer.js`) is not real security.
Add to this file whenever a new server-side rule is discovered. Task status lives in `TASKS.md`.

---

## 1. OTP abuse protection

### 1.1 What the mock does today (the server must do at least this)
- Per phone number: 30 s resend cooldown, max 5 OTP sends per hour.
- Verify: 6 digits, expires in 5 min, single use, 5 wrong attempts => 15 min lockout, constant-time compare.
- Errors are HTTP 429 `rate_limited` with `retryAfterSec`. UI shows a countdown and a friendly message.
- Same response for known and unknown numbers (no user enumeration). The OTP is never returned to the client
  (the mock returns `demoCode` for development only: **remove it**).

### 1.2 Gaps (not covered by the mock; the real backend must add them)
1. **Limits are per phone number only.** An attacker can cycle through many different numbers and no limit fires.
   Result: **SMS pumping / toll fraud**, where the SMS bill explodes. Needs per-IP, per-device, per-country,
   daily-cap and CAPTCHA protection (checklist below).
2. **Counters live in memory in the mock.** A page reload resets them. The real server must store counters in
   Redis (or the DB) with TTLs so they survive restarts and are shared across server instances.

### 1.3 Server checklist
Numbers are sensible starting points to tune with real traffic, not fixed requirements.

**Rate limits (all return 429 with `Retry-After` header and `retryAfterSec` in the body)**
- [ ] Per phone/email: cooldown 30 s, max 5 sends/hour, max 10 sends/day.
- [ ] Per IP: e.g. max 10 OTP requests/hour. Group IPv6 by /64.
- [ ] Per device: set an opaque, random device-id cookie (httpOnly, Secure, SameSite=Lax) on first visit and limit by it.
      Treat it as a soft signal: attackers can clear cookies, so never rely on it alone.
- [ ] Per country / dial-code prefix: cap sends per prefix per hour to catch one-country floods.
- [ ] **Global daily cap** on SMS sends with a budget alert (page someone at 50% / 80%). When hit, fail closed for
      new numbers while still allowing already-verified customers to sign in.
- [ ] Verify attempts: 5 wrong codes => lock that challenge for 15 min (and count against the IP too).
- [ ] Use atomic increments with TTL (Redis `INCR` + `EXPIRE`, or a Lua script / sliding-window token bucket).
      Do not read-then-write (race condition lets bursts through).

**CAPTCHA / bot protection**
- [ ] Verify a CAPTCHA token (Cloudflare Turnstile / hCaptcha / reCAPTCHA) server-side on `POST /auth/otp`.
      Start by requiring it after N requests from an IP/device, or always for new numbers.
- [ ] Client sends it as `captchaToken` in the OTP request body (client hook point: T3).
- [ ] Reject missing/invalid tokens with a generic 400, never reveal why.

**SMS-pumping guards**
- [ ] Country allowlist: only send SMS to countries you actually sell/ship to.
- [ ] Block premium-rate and high-risk number ranges; validate numbers with a library (libphonenumber) and reject
      non-mobile types where possible.
- [ ] Flag sequential numbers (+1555000001, +1555000002, ...) and many numbers sharing one prefix from one source.
- [ ] Monitor **send-to-verify conversion**. Real users verify most codes; pumping traffic almost never does.
      Alert when conversion drops sharply or sends spike with no verifies.
- [ ] Prefer email OTP or WhatsApp where cheaper/safer if the admin enables it (see login method setting).

**OTP handling**
- [ ] Generate with a CSPRNG. Store only an HMAC/hash of the code, never the plain code.
- [ ] Expire at 5 min, delete on first success, constant-time compare.
- [ ] Never return the code, and never log it.
- [ ] Do not distinguish known vs unknown accounts in response body, status or timing (add a uniform delay).
- [ ] Use a distinct message for "rate limited" only (the client needs `retryAfterSec`); everything else generic.

**Observability**
- [ ] Log security events (otp_requested, otp_failed, otp_locked, rate_limited, captcha_failed) with IP, device id,
      hashed identifier, country. Never log OTPs or full numbers.
- [ ] Alerts on spikes of any of the above.

### 1.4 API contract the client uses today
`POST /auth/otp` body `{ phone, purpose: 'login'|'reauth'|'change_phone', captchaToken? }`
=> `200 { sent: true, maskedPhone, resendInSec, expiresInSec }`
=> `429 { code: 'rate_limited', meta: { retryAfterSec } }` (+ `Retry-After` header)
=> `422 { code: 'invalid_phone', fieldErrors }`

`POST /auth/otp/verify` body `{ phone, code, purpose }`
=> `200 { user, expiresAt }` (login / change_phone) or `{ reauthToken, expiresInSec }` (reauth)
=> `400 { code: 'otp_invalid', meta: { attemptsLeft } }` | `400 { code: 'otp_expired' }`
=> `429 { code: 'rate_limited', meta: { retryAfterSec } }` once locked

---

## 2. Sessions and cookies
- [ ] Session id in an **httpOnly, Secure, SameSite=Lax** cookie. JavaScript must never read it. No tokens in localStorage.
- [ ] Idle timeout 30 min, absolute lifetime 12 h, rotate the session id on login.
- [ ] CSRF protection for state-changing requests (SameSite plus a CSRF token or custom header check).
- [ ] 401 `{ code: 'unauthenticated' | 'session_expired' }` for missing/expired sessions.
- [ ] Endpoints: `GET /auth/session`, `POST /auth/keepalive`, `POST /auth/logout`, `POST /auth/logout-all`,
      `GET /auth/sessions`, `DELETE /auth/sessions/:id`.

## 3. Data access rules
- [ ] Every record query is scoped to the signed-in user. A foreign id returns a plain 404 (no IDOR, no 403 leak).
- [ ] Re-validate and sanitise all input server-side (the client rules in `utils/validators.js` are convenience only).
- [ ] Return only masked contact info (`phoneMasked`); never the full number to the profile screen.
- [ ] Delete account: needs the confirmation word **and** a single-use, 5 min `reauthToken` obtained via OTP.
      Block while an order is in flight. Keep legally required order records without personal details.

## 4. Geo hint
- [ ] `GET /geo` => `{ country: 'IN' }` from a trusted edge header (Cloudflare `CF-IPCountry`, CloudFront
      `CloudFront-Viewer-Country`) or a GeoIP database. Used only to pre-select the phone country code.
      Never use it for access control, and never call a third-party IP API from the browser.

## 5. Planned (from TASKS.md, not final)
- Admin-controlled login method (phone / email / both): settings read by the client as `auth.methods`.
  Contract and admin write endpoint to be written in task T2.
