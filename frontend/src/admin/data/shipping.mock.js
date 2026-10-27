export const shippingZones = [
  { id: 'zone-domestic', name: 'Domestic', regions: ['Delhi', 'Mumbai', 'Bengaluru', 'All other regions'] },
  { id: 'zone-international', name: 'International', regions: ['Europe', 'North America', 'Asia Pacific'] },
];

export const shippingMethodsMock = [
  { id: 'shipping-standard', name: 'Standard delivery', zoneId: 'zone-domestic', zoneName: 'Domestic', carrier: 'BlueDart', deliveryTime: '3–5 business days', price: 80, status: 'active' },
  { id: 'shipping-express', name: 'Express delivery', zoneId: 'zone-domestic', zoneName: 'Domestic', carrier: 'DHL', deliveryTime: '1–2 business days', price: 180, status: 'active' },
  { id: 'shipping-free', name: 'Free delivery', zoneId: 'zone-domestic', zoneName: 'Domestic', carrier: 'BlueDart', deliveryTime: '5–7 business days', price: 0, status: 'active' },
  { id: 'shipping-international', name: 'International priority', zoneId: 'zone-international', zoneName: 'International', carrier: 'DHL', deliveryTime: '5–9 business days', price: 1200, status: 'draft' },
];
