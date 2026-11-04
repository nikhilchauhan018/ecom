import { describe, it } from 'node:test';
import assert from 'node:assert';
import { deleteIncompleteOrders, getIncompleteOrder, listIncompleteOrders } from './incompleteOrders.js';

describe('incomplete orders service', () => {
  it('lists the newest records first with totals', async () => {
    const { data, meta } = await listIncompleteOrders({ page: 1, pageSize: 10 });
    assert.strictEqual(data.length, 10);
    assert.ok(meta.total >= 10);
    assert.deepStrictEqual(data.map((item) => item.id), [...data.map((item) => item.id)].sort((a, b) => b - a));
  });

  it('every record amount equals the sum of its item lines', async () => {
    const { data } = await listIncompleteOrders({ pageSize: 100 });
    for (const record of data) {
      assert.strictEqual(record.amount, record.items.reduce((sum, line) => sum + line.qty * line.unitPrice, 0), `record ${record.id}`);
    }
  });

  it('returns copies: changing a result does not change the next one', async () => {
    const first = await listIncompleteOrders({ pageSize: 5 });
    first.data[0].amount = -1;
    const second = await listIncompleteOrders({ pageSize: 5 });
    assert.notStrictEqual(second.data[0].amount, -1);
  });

  it('gets one record by id (string or number) and null for an unknown id', async () => {
    const { data } = await listIncompleteOrders({ pageSize: 1 });
    const record = await getIncompleteOrder(String(data[0].id));
    assert.strictEqual(record.id, data[0].id);
    assert.ok(Array.isArray(record.items));
    assert.strictEqual(await getIncompleteOrder('999999'), null);
  });

  it('deletes a record, then it is gone; deleting it again reports not_found', async () => {
    const { data } = await listIncompleteOrders({ pageSize: 1 });
    const id = data[0].id;
    assert.deepStrictEqual(await deleteIncompleteOrders([id]), { deleted: [String(id)], failed: [] });
    assert.strictEqual(await getIncompleteOrder(id), null);
    assert.deepStrictEqual((await deleteIncompleteOrders([id])).failed, [{ id: String(id), code: 'not_found' }]);
  });

  it('rejects an empty selection', async () => {
    await assert.rejects(() => deleteIncompleteOrders([]), (error) => error.code === 'invalid_selection');
  });
});
