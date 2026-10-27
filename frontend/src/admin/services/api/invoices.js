import { invoicesMock } from '../../data/invoices.mock';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function listInvoices({ search = '', status = '' } = {}) {
  const query = String(search).trim().toLowerCase();
  const data = invoicesMock.filter((invoice) => {
    const searchable = `${invoice.id} ${invoice.orderNumber} ${invoice.customer.name} ${invoice.customer.email}`.toLowerCase();
    return (!query || searchable.includes(query)) && (!status || invoice.status === status);
  });
  return delay({ data, meta: { total: data.length } });
}

export async function getInvoice(id) {
  return delay(invoicesMock.find((invoice) => invoice.id === String(id)) ?? null);
}
