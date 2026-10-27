export const discountTypes = ['percentage', 'fixed'];
export const discountStatuses = ['active', 'scheduled', 'expired', 'disabled'];

export const discountsMock = [
  { id: 'discount-1', code: 'WELCOME10', name: 'Welcome offer', type: 'percentage', value: 10, status: 'active', usageCount: 34, usageLimit: 100, startsAt: '2026-09-01', endsAt: '2026-12-31' },
  { id: 'discount-2', code: 'FESTIVE500', name: 'Festive savings', type: 'fixed', value: 500, status: 'active', usageCount: 18, usageLimit: 50, startsAt: '2026-10-01', endsAt: '2026-11-15' },
  { id: 'discount-3', code: 'WINTER20', name: 'Winter collection', type: 'percentage', value: 20, status: 'scheduled', usageCount: 0, usageLimit: 200, startsAt: '2026-11-01', endsAt: '2027-01-15' },
  { id: 'discount-4', code: 'CLEARANCE15', name: 'Clearance offer', type: 'percentage', value: 15, status: 'expired', usageCount: 87, usageLimit: 100, startsAt: '2026-07-01', endsAt: '2026-08-31' },
  { id: 'discount-5', code: 'VIP1000', name: 'VIP customer credit', type: 'fixed', value: 1000, status: 'disabled', usageCount: 5, usageLimit: 25, startsAt: '2026-08-01', endsAt: '2026-12-31' },
];
