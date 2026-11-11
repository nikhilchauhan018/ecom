import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import Pill from '../../components/ui/Pill';
import { LoadError, LoadingBlock } from '../../components/ui/AsyncState';
import { formatMoney } from '../../utils/formatMoney';
import { useQueryState } from '../../hooks/useQueryState';
import { useResource } from '../../hooks/useResource';
import { useSearchInput } from '../../hooks/useSearchInput';
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATION_TYPES,
} from '../../services/api/notifications';

const QUERY = { search: '', status: '', type: '' };
const NO_NOTIFICATIONS = [];

const typeTone = {
  order: 'ok',
  payment: 'bad',
  return: 'wait',
  review: 'wait',
  system: 'ok',
};

function NotificationIcon({ type }) {
  const icons = { order: 'box', payment: 'card', return: 'refresh', review: 'check', system: 'bell' };
  return <span aria-hidden="true" className="tw-grid tw-h-10 tw-w-10 tw-shrink-0 tw-place-items-center tw-rounded-full tw-bg-page tw-text-brand"><Icon name={icons[type] || icons.system} size={18} /></span>;
}

export default function NotificationsPage() {
  const [query, setQuery] = useQueryState(QUERY);
  const [searchInput, setSearchInput] = useSearchInput(query.search, (search) => setQuery({ search }, { replace: true }));
  const { data: result, error, loading, reload } = useResource(listNotifications, query);
  const notifications = result?.data ?? NO_NOTIFICATIONS;
  const [actingId, setActingId] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const runAction = async (id, action, successMessage) => {
    setActingId(id);
    setActionError('');
    setActionMessage('');
    try {
      const outcome = await action();
      if (!outcome.updated && !outcome.deleted) {
        setActionError('Unable to update this notification.');
        return;
      }
      setActionMessage(successMessage);
      reload();
    } catch (actionError) {
      setActionError(actionError.message || 'Unable to update notifications.');
    } finally {
      setActingId('');
    }
  };

  const markAllRead = () => runAction('all', markAllNotificationsRead, 'All notifications marked as read.');
  const clearFilters = () => {
    setSearchInput('');
    setQuery(QUERY);
  };

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-4">
      <div><div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><Link to="/ecommerce" className="link-brand">Dashboard</Link><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Notifications</h1><p className="tw-mt-1 tw-text-sm tw-text-muted">Stay up to date with important store activity.</p></div>
      <Button variant="brandOutline" className="print-hidden" disabled={!result?.meta?.unread || actingId === 'all'} loading={actingId === 'all'} onClick={markAllRead}><Icon name="check" size={16} /> Mark all as read</Button>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3 print-hidden">
        <label className="tw-flex-1"><span className="visually-hidden">Search notifications</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search notifications..." /></label>
        <select className="form-select tw-h-11 tw-w-auto tw-min-w-[145px]" aria-label="Filter notification status" value={query.status} onChange={(event) => setQuery({ status: event.target.value })}><option value="">All notifications</option><option value="unread">Unread</option><option value="read">Read</option></select>
        <select className="form-select tw-h-11 tw-w-auto tw-min-w-[145px]" aria-label="Filter notification type" value={query.type} onChange={(event) => setQuery({ type: event.target.value })}><option value="">All types</option>{Object.entries(NOTIFICATION_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>
      {(actionError || actionMessage) && <div role={actionError ? 'alert' : 'status'} className={`tw-mt-4 tw-rounded-lg tw-p-3 ${actionError ? 'tw-bg-[var(--c-danger-bg)] tw-text-[var(--c-danger-ink)]' : 'tw-bg-[var(--c-success-bg)] tw-text-[var(--c-success-ink)]'}`}>{actionError || actionMessage}</div>}
      {error ? <div className="tw-mt-4"><LoadError message="Unable to load notifications." onRetry={reload} /></div> : loading ? <LoadingBlock label="Loading notifications" className="tw-mt-5 tw-h-64" /> : <div className="tw-mt-5">
        {notifications.map((notification) => <article key={notification.id} className={`tw-flex tw-items-start tw-gap-3 tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-py-4 first:tw-border-t-0 first:tw-pt-0 ${!notification.read ? 'tw-bg-[var(--c-success-bg)] tw-px-3 tw-rounded-lg' : ''}`}>
          <NotificationIcon type={notification.type} />
          <div className="tw-min-w-0 tw-flex-1"><div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2"><h2 className={`tw-text-sm ${notification.read ? 'tw-font-medium' : 'tw-font-semibold'}`}>{notification.title}</h2>{!notification.read && <Pill tone={typeTone[notification.type]}>Unread</Pill>}</div><div className="tw-mt-1 tw-flex tw-flex-wrap tw-gap-x-3 tw-gap-y-1 tw-text-xs tw-text-muted"><span>{notification.when}</span>{notification.amount !== undefined && <span className="tw-font-medium tw-text-brand">{formatMoney(notification.amount)}</span>}<span>{NOTIFICATION_TYPES[notification.type]}</span></div></div>
          <div className="print-hidden tw-flex tw-shrink-0 tw-gap-1"><button type="button" aria-label={`${notification.read ? 'Notification' : 'Mark'} ${notification.title} as read`} title={notification.read ? 'Already read' : 'Mark as read'} disabled={notification.read || actingId === notification.id} onClick={() => runAction(notification.id, () => markNotificationRead(notification.id), 'Notification marked as read.')} className="tw-grid tw-h-9 tw-w-9 tw-place-items-center tw-rounded-md tw-border tw-border-solid tw-border-field tw-bg-card tw-text-brand disabled:tw-cursor-not-allowed disabled:tw-opacity-40"><Icon name="check" size={16} /></button><button type="button" aria-label={`Delete notification ${notification.title}`} title="Delete notification" disabled={actingId === notification.id} onClick={() => runAction(notification.id, () => deleteNotification(notification.id), 'Notification deleted.')} className="tw-grid tw-h-9 tw-w-9 tw-place-items-center tw-rounded-md tw-border tw-border-solid tw-border-[var(--c-danger-ink)] tw-bg-transparent tw-text-[var(--c-danger-ink)] disabled:tw-cursor-not-allowed disabled:tw-opacity-40"><Icon name="trash" size={16} /></button></div>
        </article>)}
        {!notifications.length && <div className="tw-py-12 tw-text-center"><Icon name="bell" size={32} className="tw-mx-auto tw-text-muted" /><p className="tw-mt-3 tw-font-medium">{query.search || query.status || query.type ? 'No notifications match your filters.' : 'You are all caught up.'}</p>{(query.search || query.status || query.type) && <button type="button" className="tw-mt-2 tw-text-brand tw-underline" onClick={clearFilters}>Clear filters</button>}</div>}
      </div>}
    </Card>
  </div>;
}
