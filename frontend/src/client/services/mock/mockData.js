const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const iso = (offsetMs) => new Date(Date.now() + offsetMs).toISOString();

const shippingAddress = {
  fullName: 'Alex Morgan',
  line1: '221 Market Street',
  line2: 'Apt 4B',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94105',
  country: 'US',
};

/** Fresh seed data (a function so tests can reset). */
export function createSeed() {
  return {
    user: {
      id: 'u_1001',
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '+15555550142',
      phoneVerified: true,
      createdAt: iso(-400 * DAY),
    },
    addresses: [
      {
        id: 'a_1',
        label: 'home',
        fullName: 'Alex Morgan',
        phone: '+15555550142',
        line1: '221 Market Street',
        line2: 'Apt 4B',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
        isDefault: true,
      },
      {
        id: 'a_2',
        label: 'work',
        fullName: 'Alex Morgan',
        phone: '+15555550142',
        line1: '1 Infinite Loop',
        line2: '',
        city: 'Cupertino',
        state: 'CA',
        postalCode: '95014',
        country: 'US',
        isDefault: false,
      },
    ],
    notifications: {
      orderUpdates: true,
      deliverySms: true,
      emailReceipts: true,
      promotions: false,
      restock: true,
    },
    orders: [
      {
        id: '1042',
        placedAt: iso(-3 * DAY),
        status: 'out_for_delivery',
        items: [
          { id: 'i_1', name: 'Organic Cotton Kurti', variant: 'Sage / M', qty: 1, price: 64, color: '#b7c9b0' },
          { id: 'i_2', name: 'Linen Scarf', variant: 'Sand', qty: 1, price: 45, color: '#e3d4b4' },
        ],
        subtotal: 109,
        shipping: 12,
        discount: 0,
        total: 121,
        paymentMethod: 'Card ending 4242',
        shippingAddress,
        carrier: 'FastShip Express',
        trackingId: 'FS9084711203',
        eta: iso(2 * DAY),
        timeline: [
          { status: 'placed', at: iso(-3 * DAY) },
          { status: 'packed', at: iso(-2 * DAY - 6 * HOUR) },
          { status: 'shipped', at: iso(-1 * DAY - 2 * HOUR) },
          { status: 'out_for_delivery', at: iso(-2 * HOUR) },
        ],
      },
      {
        id: '1038',
        placedAt: iso(-9 * DAY),
        status: 'delivered',
        items: [
          { id: 'i_3', name: 'Relaxed Linen Shirt', variant: 'White / L', qty: 1, price: 58, color: '#f1efe8' },
          { id: 'i_4', name: 'Cotton Lounge Pants', variant: 'Charcoal / L', qty: 2, price: 36, color: '#5b6068' },
        ],
        subtotal: 130,
        shipping: 0,
        discount: 10,
        total: 120,
        paymentMethod: 'Card ending 4242',
        shippingAddress,
        carrier: 'FastShip Express',
        trackingId: 'FS9084001177',
        eta: iso(-5 * DAY),
        timeline: [
          { status: 'placed', at: iso(-9 * DAY) },
          { status: 'packed', at: iso(-8 * DAY) },
          { status: 'shipped', at: iso(-7 * DAY) },
          { status: 'out_for_delivery', at: iso(-5 * DAY - 3 * HOUR) },
          { status: 'delivered', at: iso(-5 * DAY) },
        ],
      },
      {
        id: '1021',
        placedAt: iso(-60 * DAY),
        status: 'delivered',
        items: [{ id: 'i_5', name: 'Everyday Tote', variant: 'Olive', qty: 1, price: 39, color: '#8a9a6b' }],
        subtotal: 39,
        shipping: 6,
        discount: 0,
        total: 45,
        paymentMethod: 'Cash on delivery',
        shippingAddress,
        carrier: 'FastShip Express',
        trackingId: 'FS9071120045',
        eta: iso(-54 * DAY),
        timeline: [
          { status: 'placed', at: iso(-60 * DAY) },
          { status: 'packed', at: iso(-59 * DAY) },
          { status: 'shipped', at: iso(-57 * DAY) },
          { status: 'out_for_delivery', at: iso(-54 * DAY - 2 * HOUR) },
          { status: 'delivered', at: iso(-54 * DAY) },
        ],
      },
      {
        id: '1015',
        placedAt: iso(-75 * DAY),
        status: 'cancelled',
        items: [{ id: 'i_6', name: 'Silk Blend Dupatta', variant: 'Rose', qty: 1, price: 52, color: '#d9a5a5' }],
        subtotal: 52,
        shipping: 6,
        discount: 0,
        total: 58,
        paymentMethod: 'Card ending 4242',
        shippingAddress,
        carrier: null,
        trackingId: null,
        eta: null,
        timeline: [
          { status: 'placed', at: iso(-75 * DAY) },
          { status: 'cancelled', at: iso(-74 * DAY) },
        ],
      },
    ],
    returns: [],
  };
}

export const SEED_SESSIONS = () => [
  {
    id: 's_other_1',
    device: 'Safari on iOS',
    createdAt: iso(-6 * DAY),
    lastSeen: iso(-4 * HOUR),
    location: 'San Francisco, US',
  },
  {
    id: 's_other_2',
    device: 'Chrome on Windows',
    createdAt: iso(-20 * DAY),
    lastSeen: iso(-2 * DAY),
    location: 'Oakland, US',
  },
];
