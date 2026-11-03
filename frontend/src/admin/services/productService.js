import { createProduct as createMockProduct, getProduct as getMockProduct, updateProduct as updateMockProduct } from './api/products';

const result = (data, error = '') => data ? { ok: true, data } : { ok: false, error: error || 'Product was not found.' };

export async function getProduct(id) {
  try {
    return result(await getMockProduct(id));
  } catch (error) {
    return { ok: false, error: error.message || 'Unable to load product.' };
  }
}

export async function saveProduct(data, id) {
  try {
    // SERVER: re-validate, authorise, sanitise, and enforce SKU uniqueness before saving.
    const saved = id ? await updateMockProduct(id, data) : await createMockProduct(data);
    return result(saved, 'Unable to save product.');
  } catch (error) {
    return { ok: false, error: error.message || 'Unable to save product.' };
  }
}
