import { discountsMock } from '../../data/discounts.mock';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function listDiscounts({ search = '', status = '', type = '' } = {}) {
  const query = String(search).trim().toLowerCase();
  const data = discountsMock.filter((discount) => {
    const searchable = `${discount.code} ${discount.name}`.toLowerCase();
    return (!query || searchable.includes(query))
      && (!status || discount.status === status)
      && (!type || discount.type === type);
  });
  return delay({ data, meta: { total: data.length } });
}

export async function getDiscount(id) {
  return delay(discountsMock.find((discount) => discount.id === String(id)) ?? null);
}
