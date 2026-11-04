/**
 * Picker options for the order form, derived from existing orders: the distinct customers and the distinct products.
 * When the same customer/product appears in several orders, the last one wins. Returns copies, never the source objects.
 * (Mock-era helper: a real backend serves these from its customer and product endpoints.)
 */
export function deriveFormOptions(orders) {
  const customers = new Map();
  const products = new Map();
  for (const order of orders) {
    customers.set(order.customer.id, { ...order.customer });
    for (const item of order.items) products.set(item.productId, { ...item });
  }
  return { customers: [...customers.values()], products: [...products.values()] };
}
