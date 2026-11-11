import { dashboardMock } from '../../data/dashboard.mock';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

const TYPE_BY_TEXT = [
  ['Payment failed', 'payment'],
  ['COD order', 'order'],
  ['Return requested', 'return'],
  ['review', 'review'],
  ['New order', 'order'],
];

const notifications = dashboardMock.notifications.map((item, index) => {
  const [, type = 'system'] = TYPE_BY_TEXT.find(([text]) => item.text.toLowerCase().includes(text.toLowerCase())) || [];
  return {
    id: `notification-${index + 1}`,
    type,
    title: item.text,
    amount: item.amount,
    when: item.when,
    read: index > 1,
  };
});

export const NOTIFICATION_TYPES = {
  order: 'Orders',
  payment: 'Payments',
  return: 'Returns',
  review: 'Reviews',
  system: 'System',
};

export async function listNotifications({ search = '', status = '', type = '' } = {}) {
  const query = String(search).trim().toLowerCase();
  const data = notifications.filter((notification) => {
    const matchesSearch = !query || `${notification.title} ${notification.when}`.toLowerCase().includes(query);
    const matchesStatus = !status || (status === 'unread' ? !notification.read : notification.read);
    const matchesType = !type || notification.type === type;
    return matchesSearch && matchesStatus && matchesType;
  });
  return delay({
    data: structuredClone(data),
    meta: {
      total: data.length,
      unread: notifications.filter((notification) => !notification.read).length,
    },
  });
}

export async function markNotificationRead(id) {
  const notification = notifications.find((item) => item.id === String(id));
  if (!notification) return delay({ updated: false });
  notification.read = true;
  return delay({ updated: true });
}

export async function markAllNotificationsRead() {
  notifications.forEach((notification) => { notification.read = true; });
  return delay({ updated: true });
}

export async function deleteNotification(id) {
  const index = notifications.findIndex((item) => item.id === String(id));
  if (index < 0) return delay({ deleted: false });
  notifications.splice(index, 1);
  return delay({ deleted: true });
}
