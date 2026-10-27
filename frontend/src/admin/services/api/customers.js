import { customersMock } from '../../data/customers.mock';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function listCustomers({ search = '', status = '' } = {}) {
  const query = String(search).trim().toLowerCase();
  const data = customersMock.filter((customer) => {
    const searchable = `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase();
    return (!query || searchable.includes(query)) && (!status || customer.status === status);
  });
  return delay({ data, meta: { total: data.length } });
}

export async function getCustomer(id) {
  return delay(customersMock.find((customer) => customer.id === String(id)) ?? null);
}
