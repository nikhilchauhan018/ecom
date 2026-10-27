import { shipmentsMock } from '../../data/shipments.mock';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function listShipments({ search = '', status = '' } = {}) {
  const query = String(search).trim().toLowerCase();
  const data = shipmentsMock.filter((shipment) => {
    const searchable = `${shipment.id} ${shipment.orderNumber} ${shipment.trackingNumber} ${shipment.courier} ${shipment.customer.name} ${shipment.customer.email}`.toLowerCase();
    return (!query || searchable.includes(query)) && (!status || shipment.status === status);
  });
  return delay({ data, meta: { total: data.length } });
}

export async function getShipment(id) {
  return delay(shipmentsMock.find((shipment) => shipment.id === String(id)) ?? null);
}
