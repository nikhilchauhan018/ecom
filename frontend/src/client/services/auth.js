/**
 * Auth service seam. The UI only talks to this file; swap the mock for real
 * endpoints (`POST /auth/otp`, `POST /auth/otp/verify`, `GET /auth/session`, ...)
 * without touching components. Real sessions must be httpOnly + Secure + SameSite cookies.
 */
export {
  requestOtp,
  verifyOtp,
  getSession,
  keepAlive,
  logout,
} from './mock/mockServer';
