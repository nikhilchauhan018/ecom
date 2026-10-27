import { shippingMethodsMock, shippingZones } from '../../data/shipping.mock';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function listShippingMethods({ search = '', zoneId = '', status = '' } = {}) {
  const query = String(search).trim().toLowerCase();
  const data = shippingMethodsMock.filter((method) => {
    const searchable = `${method.name} ${method.carrier} ${method.zoneName}`.toLowerCase();
    return (!query || searchable.includes(query))
      && (!zoneId || method.zoneId === zoneId)
      && (!status || method.status === status);
  });
  return delay({ data, meta: { total: data.length } });
}

export async function getShippingMetadata() {
  return delay({ zones: shippingZones, statuses: ['active', 'draft'] });
}

export async function getShippingMethod(id) {
  return delay(shippingMethodsMock.find((method) => method.id === String(id)) ?? null);
}
