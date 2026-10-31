import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AccountShell } from './components/AccountShell';
import { AsyncState } from '../../components/ui/AsyncState';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Icon } from '../../components/ui/Icon';
import { Notice } from '../../components/ui/Notice';
import { listSessions, logoutAll, revokeSession } from '../../services/account';
import { authStore } from '../../stores/authStore';
import { useResource } from '../../hooks/useResource';
import { useSettings } from '../../hooks/useSettings';
import { useT } from '../../hooks/useT';
import { ROUTES } from '../../config/constants';
import { getErrorMessage } from '../../utils/errors';
import { formatRelativeTime } from '../../utils/format';

function Card({ children, className = '' }) {
  return (
    <section className={`tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-6 ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({ id, children }) {
  return (
    <h2 id={id} className="tw-m-0 tw-mb-3 tw-text-base tw-font-semibold tw-text-ink">
      {children}
    </h2>
  );
}

export function SecurityPage() {
  const { t } = useT();
  const settings = useSettings();
  const { data, setData, loading, error, reload } = useResource(listSessions, []);
  const [busyId, setBusyId] = useState(null);
  const [flash, setFlash] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmAll, setConfirmAll] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const revoke = async (session) => {
    setBusyId(session.id);
    setActionError('');
    setFlash('');
    try {
      await revokeSession(session.id);
      setData((prev) => (prev || []).filter((item) => item.id !== session.id));
      setFlash(t('security.sessionRevoked'));
    } catch (err) {
      setActionError(getErrorMessage(t, err));
    } finally {
      setBusyId(null);
    }
  };

  const signOutEverywhere = async () => {
    setSigningOut(true);
    setActionError('');
    try {
      await logoutAll();
      // The server session is already gone: clear local state, RequireAuth redirects to /login.
      authStore.expire('logout');
    } catch (err) {
      setActionError(getErrorMessage(t, err));
      setConfirmAll(false);
      setSigningOut(false);
    }
  };

  return (
    <AccountShell title={t('security.title')}>
      {flash && <Notice tone="success">{flash}</Notice>}
      {actionError && <Notice tone="error">{actionError}</Notice>}

      <Card>
        <SectionTitle>{t('security.methodTitle')}</SectionTitle>
        <div className="tw-flex tw-items-start tw-gap-3">
          <span className="tw-flex tw-h-9 tw-w-9 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl tw-bg-[var(--c-success-tint)] tw-text-[var(--c-success)]">
            <Icon name="lock" size={18} />
          </span>
          <div>
            <p className="tw-m-0 tw-text-[15px] tw-font-medium tw-text-ink">{t('security.methodValue')}</p>
            <p className="tw-m-0 tw-mt-0.5 tw-text-xs tw-text-[var(--c-muted)]">{t('security.methodHint')}</p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle id="sessions-title">{t('security.sessionsTitle')}</SectionTitle>
        <AsyncState loading={loading} error={error} onRetry={reload}>
          <ul aria-labelledby="sessions-title" className="tw-m-0 tw-list-none tw-p-0 tw-divide-y tw-divide-[var(--c-hair)]">
            {(data || []).map((session) => (
              <li key={session.id} className="tw-flex tw-items-center tw-gap-3 tw-py-3 first:tw-pt-0">
                <span className="tw-flex tw-h-9 tw-w-9 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl tw-bg-[var(--c-card)] tw-text-[var(--c-muted)]">
                  <Icon name="monitor" size={18} />
                </span>
                <div className="tw-min-w-0 tw-flex-1">
                  <p className="tw-m-0 tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-text-[15px] tw-text-ink">
                    {session.device}
                    {session.current && (
                      <span className="tw-rounded-full tw-bg-[var(--c-success-tint)] tw-px-2 tw-py-0.5 tw-text-[11px] tw-font-bold tw-text-[var(--c-success)]">
                        {t('security.thisDevice')}
                      </span>
                    )}
                  </p>
                  <p className="tw-m-0 tw-text-xs tw-text-[var(--c-muted)]">
                    {[session.location, t('security.lastActive', { time: formatRelativeTime(session.lastSeen, Date.now(), settings.locale) })]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                {!session.current && (
                  <Button variant="outline" size="sm" loading={busyId === session.id} disabled={busyId !== null} onClick={() => revoke(session)}>
                    {t('security.signOutDevice')}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </AsyncState>
        <Button variant="outline" fullWidth className="tw-mt-4" onClick={() => setConfirmAll(true)}>
          <Icon name="log-out" size={16} />
          {t('security.signOutAll')}
        </Button>
      </Card>

      <Card>
        <SectionTitle>{t('security.tipsTitle')}</SectionTitle>
        <ul className="tw-m-0 tw-flex tw-list-none tw-flex-col tw-gap-2.5 tw-p-0 tw-text-sm tw-text-[var(--c-muted)]">
          {['one', 'two', 'three'].map((key) => (
            <li key={key} className="tw-flex tw-items-start tw-gap-2.5">
              <Icon name="shield-check" size={16} className="tw-mt-0.5 tw-shrink-0 tw-text-[var(--c-success)]" />
              {t(`security.tips.${key}`)}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="!tw-border-[var(--c-badge-sale-bg)]">
        <SectionTitle>{t('security.dangerTitle')}</SectionTitle>
        <p className="tw-m-0 tw-mb-3 tw-text-sm tw-text-[var(--c-muted)]">{t('security.deleteHint')}</p>
        <Link
          to={ROUTES.ACCOUNT_DELETE}
          className="touch-target tw-gap-2 tw-text-sm tw-font-semibold tw-text-[var(--c-danger)]"
        >
          <Icon name="trash" size={16} />
          {t('security.deleteLink')}
        </Link>
      </Card>

      {confirmAll && (
        <Dialog open onClose={() => !signingOut && setConfirmAll(false)} dismissible={!signingOut} title={t('security.signOutAll')} closeLabel={t('common.close')}>
          <p className="tw-m-0 tw-mb-5 tw-text-sm tw-text-[var(--c-muted)]">{t('security.signOutAllBody')}</p>
          <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row-reverse">
            <Button variant="danger" fullWidth loading={signingOut} onClick={signOutEverywhere}>
              {t('security.signOutAll')}
            </Button>
            <Button variant="outline" fullWidth disabled={signingOut} onClick={() => setConfirmAll(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </Dialog>
      )}
    </AccountShell>
  );
}

export default SecurityPage;
