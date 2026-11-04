// TEMPORARY mock data: checkouts that were started but never paid for ("abandoned carts").
// Shape mirrors the future API (GET /admin/incomplete-orders). `customer` fields are empty strings for guests
// who left before typing a name or email. `amount` is always the sum of the item lines.
const catalogue = [
  ['Linen shirt', 'M / White', 1299],
  ['Cotton kurta', 'L / Indigo', 1799],
  ['Slim fit jeans', '32 / Blue', 2199],
  ['Crew neck t-shirt', 'M / Black', 599],
  ['Leather belt', 'Free / Brown', 749],
];

const customers = [
  ['', ''], ['', ''], ['Best Video Channel', ''], ['', ''], ['Sohel Ansari', 'sohel.ansari@example.com'],
  ['Deepak Singh', 'deepak.singh@example.com'], ['Shailendra Kumar', 'shailendra.kumar@example.com'],
  ['Meera Nair', 'meera.nair@example.com'], ['', ''], ['Ravi Patel', 'ravi.patel@example.com'],
  ['Anita Desai', ''], ['Imran Sheikh', 'imran.sheikh@example.com'],
];

const DAY = 24 * 60 * 60 * 1000;

function createRecord(index) {
  const [name, email] = customers[index % customers.length];
  const lineCount = (index % 3) + 1;
  const items = Array.from({ length: lineCount }, (_, lineIndex) => {
    const [product, variant, unitPrice] = catalogue[(index + lineIndex) % catalogue.length];
    return { id: `${index}-${lineIndex}`, name: product, variant, qty: ((index + lineIndex) % 2) + 1, unitPrice };
  });
  return {
    id: 200 - (index * 3 + (index % 2)),
    customer: { name, email },
    items,
    amount: items.reduce((sum, line) => sum + line.qty * line.unitPrice, 0),
    createdAt: new Date(Date.UTC(2026, 9, 30) - index * 3 * DAY).toISOString(),
  };
}

export const incompleteOrdersMock = Array.from({ length: 36 }, (_, index) => createRecord(index));
