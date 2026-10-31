import * as api from './mock/mockServer';
import { ApiError } from './errors';
import { authStore } from '../stores/authStore';

/**
 * Account service seam (swap the mock for REST later without touching components).
 * Every call goes through `guarded`: a 401 from the server means the session is gone,
 * so local auth state is cleared and RequireAuth sends the user to /login.
 */
function guarded(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authStore.expire(error.code);
      }
      throw error;
    }
  };
}

export const getAccountOverview = guarded(api.getOverview);
export const getProfile = guarded(api.getProfile);
export const updateProfile = guarded(api.updateProfile);
export const listAddresses = guarded(api.listAddresses);
export const saveAddress = guarded(api.saveAddress);
export const deleteAddress = guarded(api.deleteAddress);
export const setDefaultAddress = guarded(api.setDefaultAddress);
export const getNotificationPrefs = guarded(api.getNotificationPrefs);
export const updateNotificationPrefs = guarded(api.updateNotificationPrefs);
export const listOrders = guarded(api.listOrders);
export const getOrder = guarded(api.getOrder);
export const listReturns = guarded(api.listReturns);
export const createReturn = guarded(api.createReturn);
export const listSessions = guarded(api.listSessions);
export const revokeSession = guarded(api.revokeSession);
export const logoutAll = guarded(api.logoutAll);
export const deleteAccount = guarded(api.deleteAccount);
export const requestStepUpOtp = guarded((phone) => api.requestOtp({ phone, purpose: 'reauth' }));
export const verifyStepUpOtp = guarded((code) => api.verifyOtp({ code, purpose: 'reauth' }));
export const requestPhoneChangeOtp = guarded((phone) => api.requestOtp({ phone, purpose: 'change_phone' }));
export const verifyPhoneChangeOtp = guarded((phone, code) => api.verifyOtp({ phone, code, purpose: 'change_phone' }));
