import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_STATE,
  DEFAULT_SIM,
  calculateMaterialCost,
  calculateProduct,
  calculateProduction,
  generateCsv,
} from './calc';

test('cement cost calculation respects bag price and batchesPerPack ratio', () => {
  const materials = DEFAULT_STATE.materials;
  // Cimento CP-V: price 54, batchesPerPack 8, recipe cement 6
  // (54 / 8) * (6 / 6) = 6.75
  const cost = calculateMaterialCost(materials, 'cement', 6);
  assert.equal(cost, 6.75);

  // If recipe uses 12L cement instead of 6L:
  const cost12 = calculateMaterialCost(materials, 'cement', 12);
  assert.equal(cost12, 13.5);
});

test('aggregate and additive costs respect package size and volume/weight conversions', () => {
  const materials = DEFAULT_STATE.materials;
  // powder: price 115, packQty 1 m3 (=1000L). 12L => 115 * 12 / 1000 = 1.38
  const powderCost = calculateMaterialCost(materials, 'powder', 12);
  assert.equal(powderCost, 1.38);

  // sand: price 86, packQty 1 m3 (=1000L). 36L => 86 * 36 / 1000 = 3.096
  const sandCost = calculateMaterialCost(materials, 'sand', 36);
  assert.equal(sandCost, 3.096);

  // additive: price 300, packQty 10 kg (=10,000g). 2.5g => 300 * 2.5 / 10000 = 0.075
  const addCost = calculateMaterialCost(materials, 'additive', 2.5);
  assert.equal(addCost, 0.075);
});

test('calculateProduct produces accurate subtotal, maintenance, unit cost and profit', () => {
  const p14 = DEFAULT_STATE.products.bloco14;
  const result = calculateProduct(p14, DEFAULT_STATE.materials, 10);

  // Subtotal of lines:
  // cement: 6.75
  // powder: 1.38
  // sand: 3.096
  // additive: 0.075
  // energy: 50 * 0.152 / 50 = 0.152
  // grease: 50 * 11 / 10000 = 0.055
  // water: 0
  // Sum = 6.75 + 1.38 + 3.096 + 0.075 + 0.152 + 0.055 = 11.508
  assert.ok(Math.abs(result.subtotal - 11.508) < 0.001);

  // Maintenance 10%: 1.1508
  assert.ok(Math.abs(result.maintenance - 1.1508) < 0.001);

  // Batch total: 11.508 + 1.1508 = 12.6588
  assert.ok(Math.abs(result.batch - 12.6588) < 0.001);

  // Unit cost (8 blocks/batch): 12.6588 / 8 = 1.58235
  assert.ok(result.unit !== null);
  assert.ok(Math.abs((result.unit || 0) - 1.58235) < 0.001);

  // Profit (salePrice = 3.60): 3.60 - 1.58235 = 2.01765
  assert.ok(result.profit !== null);
  assert.ok(Math.abs((result.profit || 0) - 2.01765) < 0.001);

  // Margin: (2.01765 / 3.60) * 100 ~= 56.045%
  assert.ok(result.margin !== null);
  assert.ok(Math.abs((result.margin || 0) - 56.045) < 0.1);
});

test('bloco9 handles pending yield/price gracefully with null outputs', () => {
  const p9 = DEFAULT_STATE.products.bloco9;
  const result = calculateProduct(p9, DEFAULT_STATE.materials, 10);

  assert.equal(result.unit, null);
  assert.equal(result.profit, null);
  assert.equal(result.margin, null);
  assert.ok(result.batch > 0);
});

test('calculateProduction calculates projections correctly', () => {
  const p14 = DEFAULT_STATE.products.bloco14;
  const sim = {
    ...DEFAULT_SIM,
    batchDay: 10,
    days: 20,
  };
  const r = calculateProduction(sim, p14, DEFAULT_STATE.materials, 10);

  assert.equal(r.isValid, true);
  assert.equal(r.totalBatches, 200); // 10 * 20
  assert.equal(r.totalBlocks, 1600); // 200 * 8
  assert.ok(r.totalCost !== null);
  assert.ok(r.totalRevenue !== null);
  assert.equal(r.totalRevenue, 1600 * 3.6); // 5760
  assert.ok(r.cementBags !== null);
  assert.equal(r.cementBags, 200 / 8); // 25 bags
});

test('generateCsv generates non-empty CSV with BOM and correct delimiter', () => {
  const csv = generateCsv(DEFAULT_STATE, DEFAULT_SIM);
  assert.ok(csv.startsWith('\ufeff'));
  assert.ok(csv.includes('Cimento CP-V'));
  assert.ok(csv.includes('Bloco de 14'));
  assert.ok(csv.includes(';'));
});
