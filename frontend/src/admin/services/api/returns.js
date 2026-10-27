import { returnsMock } from '../../data/returns.mock';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function listReturns({ search = '', status = '' } = {}) {
  const query = String(search).trim().toLowerCase();
  const data = returnsMock.filter((returnItem) => {
    const searchable = `${returnItem.id} ${returnItem.orderNumber} ${returnItem.customer.name} ${returnItem.customer.email} ${returnItem.reason}`.toLowerCase();
    return (!query || searchable.includes(query)) && (!status || returnItem.status === status);
  });
  return delay({ data, meta: { total: data.length } });
}

export async function getReturn(id) {
  return delay(returnsMock.find((returnItem) => returnItem.id === String(id)) ?? null);
}
