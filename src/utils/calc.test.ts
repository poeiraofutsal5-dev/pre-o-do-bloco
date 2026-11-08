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

test('nata de cimento preparation cost reflects stone powder and sand ingredients', () => {
  const materials = DEFAULT_STATE.materials;
  // 2L powder (115 * 2 / 1000 = 0.23) + 2L sand (86 * 2 / 1000 = 0.172) = 0.402 for 6.5L
  const fullPrepCost = calculateMaterialCost(materials, 'slurry', 6.5);
  assert.ok(Math.abs(fullPrepCost - 0.402) < 0.001);

  // 1L cost = 0.402 / 6.5 ~= 0.061846
  const cost1L = calculateMaterialCost(materials, 'slurry', 1.0);
  assert.ok(Math.abs(cost1L - 0.061846) < 0.001);

  // 1.2L cost = 1.2 * (0.402 / 6.5) ~= 0.074215
  const cost1_2L = calculateMaterialCost(materials, 'slurry', 1.2);
  assert.ok(Math.abs(cost1_2L - 0.074215) < 0.001);
});

test('paver 16 faces calculates traço 3x3x1 plus 1L nata de cimento (100ml/paver) accurately', () => {
  const paver = DEFAULT_STATE.products.paver16;
  assert.equal(paver.blocksPerBatch, 10);
  assert.equal(paver.recipe.cement, 4);
  assert.equal(paver.recipe.gravel0, 12);
  assert.equal(paver.recipe.powder, 12);
  assert.equal(paver.recipe.slurry, 1.0);

  // Gravel 0 cost: 220 * 12 / 1000 = 2.64
  const gravelCost = calculateMaterialCost(DEFAULT_STATE.materials, 'gravel0', 12);
  assert.equal(gravelCost, 2.64);

  // Cement 4L cost: (54 / 8) * (4 / 6) = 4.50
  const cementCost = calculateMaterialCost(DEFAULT_STATE.materials, 'cement', 4);
  assert.equal(cementCost, 4.5);

  const result = calculateProduct(paver, DEFAULT_STATE.materials, 10);
  // Subtotal = 8.802 + 0.061846 = 8.863846
  assert.ok(Math.abs(result.subtotal - 8.8638) < 0.002);
  // Maintenance 10%: 0.88638
  assert.ok(Math.abs(result.maintenance - 0.8864) < 0.002);
  // Freight 20%: 1.77277
  assert.ok(Math.abs(result.freight - 1.7728) < 0.002);
  // Batch total = 11.523
  assert.ok(Math.abs(result.batch - 11.523) < 0.005);
  // Unit cost for 10 pavers = 1.1523
  assert.ok(result.unit !== null);
  assert.ok(Math.abs((result.unit || 0) - 1.1523) < 0.002);
  // Profit = 2.00 - 1.1523 = 0.8477
  assert.ok(result.profit !== null);
  assert.ok(Math.abs((result.profit || 0) - 0.8477) < 0.002);
});

test('pingadeira calculates traço 5x1 plus 1.2L nata de cimento (300ml/pingadeira) accurately', () => {
  const pingadeira = DEFAULT_STATE.products.pingadeira;
  assert.equal(pingadeira.blocksPerBatch, 4);
  assert.equal(pingadeira.recipe.cement, 5);
  assert.equal(pingadeira.recipe.sand, 7);
  assert.equal(pingadeira.recipe.powder, 12);
  assert.equal(pingadeira.recipe.gravel0, 8);
  assert.equal(pingadeira.recipe.slurry, 1.2);
  assert.equal(pingadeira.freightPercent, 20);

  const result = calculateProduct(pingadeira, DEFAULT_STATE.materials, 10);
  // Subtotal = 9.649 + 0.074215 = 9.7232
  assert.ok(Math.abs(result.subtotal - 9.7232) < 0.002);
  // Maintenance 10% = 0.97232
  assert.ok(Math.abs(result.maintenance - 0.9723) < 0.002);
  // Freight 20% = 1.94464
  assert.ok(Math.abs(result.freight - 1.9446) < 0.002);
  // Batch total = 12.6402
  assert.ok(Math.abs(result.batch - 12.6402) < 0.005);
  // Unit cost for 4 units = 3.1600
  assert.ok(result.unit !== null);
  assert.ok(Math.abs((result.unit || 0) - 3.16) < 0.002);
  // Profit = 6.00 - 3.16 = 2.84
  assert.ok(result.profit !== null);
  assert.ok(Math.abs((result.profit || 0) - 2.84) < 0.002);
});

test('generateCsv generates non-empty CSV with BOM and correct delimiter', () => {
  const csv = generateCsv(DEFAULT_STATE, DEFAULT_SIM);
  assert.ok(csv.startsWith('\ufeff'));
  assert.ok(csv.includes('Cimento CP-V'));
  assert.ok(csv.includes('Brita 0'));
  assert.ok(csv.includes('Nata de cimento'));
  assert.ok(csv.includes('Paver Paviesse (16 faces)'));
  assert.ok(csv.includes('Pingadeira'));
  assert.ok(csv.includes(';'));
});
