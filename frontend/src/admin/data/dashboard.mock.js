// TEMPORARY mock data copied from the design. Shape mirrors the future API response
// (GET /api/v1/admin/dashboard/summary) so only the data source changes later. Money in rupees.
export const dashboardMock = {
  tiles: [
    { label: 'Gross revenue', value: '₹8.4L', delta: '+12.4%', trend: 'up', subtitle: 'vs last month', color: '#1f7a62' },
    { label: 'Orders', value: 312, delta: '+18%', trend: 'up', subtitle: 'this week', color: '#0f4c3d' },
    { label: 'Returning buyers', value: 286, delta: '+9%', trend: 'up', subtitle: 'active customers', color: '#9a4d1a' },
    { label: 'Pending reviews', value: 12, delta: '-3%', trend: 'down', subtitle: 'needs action', color: '#2c3a6b' },
  ],
  salesByDay: [
    { day: 'Mon', pct: 48 }, { day: 'Tue', pct: 56 }, { day: 'Wed', pct: 64 }, { day: 'Thu', pct: 58 },
    { day: 'Fri', pct: 72 }, { day: 'Sat', pct: 100 }, { day: 'Sun', pct: 88 },
  ],
  todo: [
    { label: 'Orders to pack', count: 6 }, { label: 'COD orders to confirm', count: 4 },
    { label: 'Returns to review', count: 2 }, { label: 'Reviews to approve', count: 3 },
  ],
  recentOrders: [
    { id: 1042, customer: 'A. Sharma', items: 2, total: 2498, payment: 'UPI', status: 'Packing', tone: 'wait' },
    { id: 1041, customer: 'R. Gill', items: 1, total: 1299, payment: 'COD', status: 'Shipped', tone: 'ok' },
    { id: 1040, customer: 'S. Verma', items: 3, total: 3897, payment: 'Card', status: 'Delivered', tone: 'ok' },
    { id: 1039, customer: 'M. Khan', items: 1, total: 899, payment: 'UPI', status: 'Return requested', tone: 'bad' },
  ],
  activity: [
    { actor: 'owner', text: 'logged in', when: '32 seconds ago' },
    { actor: 'system', text: 'created order', ref: '#1043', when: '5 minutes ago' },
    { actor: 'owner', text: 'updated product Linen shirt', when: '2 hours ago' },
    { actor: 'system', text: 'received payment via UPI', amount: 2498, when: 'Yesterday' },
    { actor: 'owner', text: 'changed password', when: '3 days ago' },
  ],
  notifications: [
    { text: 'New order #1042', amount: 2498, when: '2 min ago' },
    { text: 'Payment failed · order #1038', when: '18 min ago' },
    { text: 'COD order to confirm · #1043', when: '1 hr ago' },
    { text: 'Return requested · #1039', when: '3 hrs ago' },
    { text: 'New review awaiting approval · 2 stars', when: 'Yesterday' },
  ],
  topCategories: [
    { name: 'Shirts', pct: 34 }, { name: 'Kurtas', pct: 22 }, { name: 'Jeans', pct: 18 },
    { name: 'T-shirts', pct: 15 }, { name: 'Accessories', pct: 11 },
  ],
  modules: [
    ['Catalog', 'Variants by size and colour, bulk CSV import, collections, size charts, SEO fields, draft and schedule.'],
    ['Orders', 'Status flow, invoices and GST bills, partial refunds, COD handling, order notes, bulk actions.'],
    ['Owner mode', 'One owner login, one-tap actions, daily to-do list and a simple mobile view. No staff setup needed.'],
    ['Customers', 'Profiles, order history, segments, wishlists, blocklist, saved addresses.'],
    ['Marketing', 'Coupons, flash sales, bundle offers, abandoned-cart reminders, email and WhatsApp campaigns.'],
    ['Fulfilment', 'Courier rates, label printing, live tracking, returns and exchanges, pincode serviceability.'],
    ['Finance', 'Payouts, tax reports, expenses, profit by product, refund ledger, CSV export.'],
    ['Storefront', 'Homepage banners, menus, lookbooks, pages, reviews moderation, announcement bar.'],
  ],
  // TODO: DEMO DATA ONLY. None of these protections are implemented yet.
  // Replace with real state from the backend once auth exists, or remove the card.
  security: {
    access: [
      { label: 'Two-factor sign-in', kind: 'switch' },
      { label: 'Single owner account', kind: 'pill', value: 'Active' },
      { label: 'Auto sign-out after idle', kind: 'pill', value: '15 min' },
    ],
    protection: [
      { label: 'Login rate limiting', kind: 'switch' },
      { label: 'Encrypted data and backups', kind: 'switch' },
      { label: 'Trusted devices only', kind: 'switch' },
    ],
    audit: [
      { label: 'Price changed · Linen shirt', meta: 'Owner · 10:42' },
      { label: 'Refund issued · #1031', meta: 'Owner · 09:15' },
      { label: 'Password changed', meta: 'Owner · Yesterday' },
    ],
  },
};
