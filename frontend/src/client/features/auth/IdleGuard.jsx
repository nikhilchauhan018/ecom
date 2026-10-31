import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { keepAlive } from '../../services/auth';
import { authStore } from '../../stores/authStore';
import { useT } from '../../hooks/useT';
import { SECURITY } from '../../config/security';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
const HEARTBEAT_MS = 5 * 60 * 1000;
const TICK_MS = 1000;

/**
 * Signs the user out after SESSION_IDLE_MS of inactivity, with a countdown warning first.
 * Activity also pings the server every few minutes so its own idle timer stays in step.
 * While the warning is open only "Stay signed in" counts as activity.
 * Renders nothing until the warning window starts.
 */
export function IdleGuard() {
  const { t } = useT();
  const [secondsLeft, setSecondsLeft] = useState(null);
  const lastActivity = useRef(Date.now());
  const lastPing = useRef(Date.now());
  const warning = useRef(false);

  useEffect(() => {
    const onActivity = () => {
      if (!warning.current) lastActivity.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));

    const timer = setInterval(() => {
      const now = Date.now();
      const idle = now - lastActivity.current;

      if (idle >= SECURITY.SESSION_IDLE_MS) {
        warning.current = false;
        authStore.signOut('idle');
        return;
      }

      const inWarning = idle >= SECURITY.SESSION_IDLE_MS - SECURITY.IDLE_WARNING_MS;
      warning.current = inWarning;
      setSecondsLeft(inWarning ? Math.ceil((SECURITY.SESSION_IDLE_MS - idle) / 1000) : null);

      if (!inWarning && idle < HEARTBEAT_MS && now - lastPing.current >= HEARTBEAT_MS) {
        lastPing.current = now;
        keepAlive()
          .then((result) => authStore.setExpiry(result.expiresAt))
          .catch(() => {
            // a 401 here is handled by the next guarded call; nothing to do
          });
      }
    }, TICK_MS);

    return () => {
      clearInterval(timer);
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity));
    };
  }, []);

  const stay = () => {
    warning.current = false;
    lastActivity.current = Date.now();
    lastPing.current = Date.now();
    setSecondsLeft(null);
    keepAlive()
      .then((result) => authStore.setExpiry(result.expiresAt))
      .catch(() => authStore.expire('session_expired'));
  };

  return (
    <Dialog
      open={secondsLeft !== null}
      onClose={stay}
      dismissible={false}
      title={t('auth.idle.title')}
      closeLabel={t('common.close')}
    >
      <p className="tw-m-0 tw-mb-5 tw-text-sm tw-text-[var(--c-muted)]">
        {t('auth.idle.body', { seconds: secondsLeft ?? 0 })}
      </p>
      <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row-reverse">
        <Button onClick={stay} fullWidth>
          {t('auth.idle.stay')}
        </Button>
        <Button variant="outline" onClick={() => authStore.signOut('logout')} fullWidth>
          {t('auth.idle.signOut')}
        </Button>
      </div>
    </Dialog>
  );
}

export default IdleGuard;
