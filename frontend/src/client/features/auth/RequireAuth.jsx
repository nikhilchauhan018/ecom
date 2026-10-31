import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { IdleGuard } from './IdleGuard';
import { useAuth } from '../../hooks/useAuth';
import { useT } from '../../hooks/useT';
import { ROUTES } from '../../config/constants';

/**
 * Route guard for signed-in-only pages. Anonymous visitors are sent to /login with the
 * page they wanted in `?next=` (validated again on the way back by safeRedirectPath).
 * Renders nothing from the protected tree until the session is confirmed, so private
 * data components never mount for anonymous users.
 */
/** After these, returning to the page they were on makes no sense. */
const NO_RETURN_REASONS = ['logout', 'deleted'];

export function RequireAuth() {
  const { status, reason } = useAuth();
  const location = useLocation();
  const { t } = useT();

  if (status === 'loading') {
    return (
      <p role="status" className="tw-p-10 tw-text-center tw-text-sm tw-text-[var(--c-muted)]">
        {t('auth.checking')}
      </p>
    );
  }

  if (status === 'anonymous') {
    if (NO_RETURN_REASONS.includes(reason)) return <Navigate to={ROUTES.LOGIN} replace />;
    const target = `${location.pathname}${location.search}`;
    return <Navigate to={`${ROUTES.LOGIN}?next=${encodeURIComponent(target)}`} replace />;
  }

  return (
    <>
      <IdleGuard />
      <Outlet />
    </>
  );
}

export default RequireAuth;
