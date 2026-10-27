const paymentMethods = [
  { code: 'cod', label: 'Cash on delivery (COD)' },
  { code: 'bank_transfer', label: 'Bank transfer' },
  { code: 'stripe', label: 'Stripe' },
  { code: 'razorpay', label: 'Razorpay' },
];

const customers = [
  ['Aarav Sharma', 'aarav.sharma@example.com', '+91 98765 10001'],
  ['Mia Laurent', 'mia.laurent@example.com', '+33 6 12 34 56 01'],
  ['Noah Williams', 'noah.williams@example.com', '+1 202 555 0102'],
  ['Fatima Khan', 'fatima.khan@example.com', '+971 50 555 0103'],
  ['Alexandria-Catherine Montgomery-Smith', 'alexandria.catherine.montgomery.smith@example.com', '+44 7700 900104'],
  ['Hugo Silva', 'hugo.silva@example.com', '+351 910 555 105'],
  ['Sofia Chen', 'sofia.chen@example.com', '+65 8123 0106'],
  ['Oliver Brown', 'oliver.brown@example.com', '+61 412 345 107'],
];

const statusCycle = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

function createOrder(index) {
  const [name, email, phone] = customers[index % customers.length];
  const status = statusCycle[index % statusCycle.length];
  const paymentMethod = paymentMethods[index % paymentMethods.length];
  const subtotal = 900 + (index * 317) % 5400;
  const shipping = index % 4 === 0 ? 0 : 80;
  const tax = Math.round(subtotal * 0.18);
  const itemCount = index % 3 + 1;
  const items = Array.from({ length: itemCount }, (_, itemIndex) => ({
    id: `${index + 1}-${itemIndex + 1}`,
  productId: productsMock[(index + itemIndex) % productsMock.length].id,
  name: productsMock[(index + itemIndex) % productsMock.length].name,
  image: productsMock[(index + itemIndex) % productsMock.length].variants[0].image,
  variant: `${productsMock[(index + itemIndex) % productsMock.length].variants[0].options.size} / ${productsMock[(index + itemIndex) % productsMock.length].variants[0].options.color}`,
  sku: productsMock[(index + itemIndex) % productsMock.length].variants[0].sku,
    qty: itemIndex + 1,
    unitPrice: Math.round(subtotal / itemCount / (itemIndex + 1)),
    total: Math.round(subtotal / itemCount),
  }));

  return {
    id: `${1001 + index}`,
    number: `ORD-${String(1001 + index)}`,
    createdAt: new Date(Date.UTC(2026, 8, 1 + index)).toISOString(),
    status,
    paymentStatus: status === 'cancelled' || status === 'returned' ? 'refunded' : index % 5 === 0 ? 'pending' : 'completed',
    paymentMethod,
    currency: 'INR',
    customer: { id: `customer-${index % customers.length + 1}`, name, email, phone },
    items,
    amounts: { subtotal, discount: index % 6 === 0 ? 100 : 0, shipping, tax, total: subtotal + shipping + tax },
    shippingAddress: { name, line1: `${index + 10} Market Street`, city: 'New Delhi', region: 'Delhi', postalCode: '110001', country: 'India' },
    billingAddress: { name, line1: `${index + 10} Market Street`, city: 'New Delhi', region: 'Delhi', postalCode: '110001', country: 'India' },
    delivery: { courier: index % 2 ? 'DHL' : 'BlueDart', trackingNumber: `TRK${index + 10000}`, trackingUrl: 'https://example.com/track', estimatedDate: '2026-10-30' },
    notes: [{ id: `note-${index}`, text: index % 2 ? 'Leave at the front desk.' : 'Customer requested careful packing.', by: 'Owner', at: new Date(Date.UTC(2026, 8, 1 + index)).toISOString() }],
    history: [{ status, note: 'Order created', by: 'Owner', at: new Date(Date.UTC(2026, 8, 1 + index)).toISOString() }],
  };
}

export const ordersMock = Array.from({ length: 40 }, (_, index) => createOrder(index));
export { paymentMethods };
import { productsMock } from './products.mock';
