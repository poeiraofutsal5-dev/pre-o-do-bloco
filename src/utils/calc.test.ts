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

test('cement cost calculation respects 48 liters per sack and batchesPerPack', () => {
  const materials = DEFAULT_STATE.materials;
  assert.equal(materials.cement.packQty, 48);
  assert.equal(materials.cement.packUnit, 'litros');

  // 1 liter cost: 54 / 48 = 1.125
  const cost1L = calculateMaterialCost(materials, 'cement', 1);
  assert.equal(cost1L, 54 / 48);

  // 4L for paver: 4 * 1.125 = 4.50
  const cost4L = calculateMaterialCost(materials, 'cement', 4);
  assert.equal(cost4L, 4.5);

  // 5L for pingadeira: 5 * 1.125 = 5.625
  const cost5L = calculateMaterialCost(materials, 'cement', 5);
  assert.equal(cost5L, 5.625);

  // 7 batches per sack (bloco14): 54 / 7 = 7.7142857...
  const costBloco = calculateMaterialCost(materials, 'cement', 48 / 7, 7);
  assert.ok(Math.abs(costBloco - 54 / 7) < 0.001);

  // 6 batches per sack (canaleta): 54 / 6 = 9.00
  const costCanaleta = calculateMaterialCost(materials, 'cement', 8, 6);
  assert.equal(costCanaleta, 9.0);
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

test('calculateProduct produces accurate subtotal, maintenance, unit cost and profit for bloco14', () => {
  const p14 = DEFAULT_STATE.products.bloco14;
  assert.equal(p14.blocksPerBatch, 9);
  const result = calculateProduct(p14, DEFAULT_STATE.materials, 10);

  // Subtotal of lines:
  // cement: 7.7142857
  // powder: 1.38
  // sand: 3.096
  // additive: 0.075
  // energy: 50 * 0.152 / 50 = 0.152
  // grease: 50 * 11 / 10000 = 0.055
  // water: 0
  // Sum = 12.4722857
  assert.ok(Math.abs(result.subtotal - 12.4723) < 0.002);

  // Maintenance 10%: 1.2472
  assert.ok(Math.abs(result.maintenance - 1.2472) < 0.002);

  // Batch total: 13.7195
  assert.ok(Math.abs(result.batch - 13.7195) < 0.005);

  // Unit cost (9 blocks/batch): 13.7195 / 9 = 1.5244
  assert.ok(result.unit !== null);
  assert.ok(Math.abs((result.unit || 0) - 1.5244) < 0.002);

  // Profit (salePrice = 3.60): 3.60 - 1.5244 = 2.0756
  assert.ok(result.profit !== null);
  assert.ok(Math.abs((result.profit || 0) - 2.0756) < 0.002);

  // Margin: (2.0756 / 3.60) * 100 ~= 57.65%
  assert.ok(result.margin !== null);
  assert.ok(Math.abs((result.margin || 0) - 57.65) < 0.2);
});

test('bloco9 calculates yield of 10 blocks per batch accurately', () => {
  const p9 = DEFAULT_STATE.products.bloco9;
  assert.equal(p9.blocksPerBatch, 10);
  const result = calculateProduct(p9, DEFAULT_STATE.materials, 10);

  assert.ok(result.unit !== null);
  assert.ok(Math.abs((result.unit || 0) - 1.372) < 0.002);
  assert.ok(result.profit !== null);
  assert.ok(result.margin !== null);
  assert.ok(result.batch > 0);
});

test('canaleta calculates 6 batches per cement sack and 9 units per batch accurately', () => {
  const canaleta = DEFAULT_STATE.products.canaleta;
  assert.equal(canaleta.blocksPerBatch, 9);
  assert.equal(canaleta.cementBatchesPerPack, 6);

  // Cement cost for canaleta (6 batches per sack of R$ 54): 54 / 6 = 9.00
  const cementCost = calculateMaterialCost(
    DEFAULT_STATE.materials,
    'cement',
    6,
    canaleta.cementBatchesPerPack
  );
  assert.equal(cementCost, 9.0);

  const result = calculateProduct(canaleta, DEFAULT_STATE.materials, 10);
  // Subtotal: 9.00 + 1.38 + 3.096 + 0.075 + 0.152 + 0.055 = 13.758
  assert.ok(Math.abs(result.subtotal - 13.758) < 0.002);
  // Maintenance 10%: 1.3758
  assert.ok(Math.abs(result.maintenance - 1.3758) < 0.002);
  // Batch total: 15.1338
  assert.ok(Math.abs(result.batch - 15.1338) < 0.005);
  // Unit cost (9 units/batch): 15.1338 / 9 = 1.6815
  assert.ok(result.unit !== null);
  assert.ok(Math.abs((result.unit || 0) - 1.6815) < 0.002);
  // Profit (salePrice = 3.60): 3.60 - 1.6815 = 1.9185
  assert.ok(result.profit !== null);
  assert.ok(Math.abs((result.profit || 0) - 1.9185) < 0.002);
  // Margin: (1.9185 / 3.60) * 100 ~= 53.29%
  assert.ok(result.margin !== null);
  assert.ok(Math.abs((result.margin || 0) - 53.29) < 0.1);
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
  assert.equal(r.totalBlocks, 1800); // 200 * 9
  assert.ok(r.totalCost !== null);
  assert.ok(r.totalRevenue !== null);
  assert.equal(r.totalRevenue, 1800 * 3.6); // 6480
  assert.ok(r.cementBags !== null);
  assert.ok(Math.abs((r.cementBags || 0) - 200 / 7) < 0.01);
});

test('nata de cimento preparation cost is R$ 3,17 for 6 liters', () => {
  const materials = DEFAULT_STATE.materials;
  // 6L of nata costs R$ 3.17
  const cost6L = calculateMaterialCost(materials, 'slurry', 6.0);
  assert.ok(Math.abs(cost6L - 3.17) < 0.001);

  // 1L cost = 3.17 / 6 = 0.528333...
  const cost1L = calculateMaterialCost(materials, 'slurry', 1.0);
  assert.ok(Math.abs(cost1L - 3.17 / 6) < 0.001);

  // 1.2L cost = 1.2 * (3.17 / 6) = 0.634
  const cost1_2L = calculateMaterialCost(materials, 'slurry', 1.2);
  assert.ok(Math.abs(cost1_2L - 0.634) < 0.001);
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

  // Cement 4L cost with 48L bag: 4 * (54 / 48) = 4.50
  const cementCost = calculateMaterialCost(DEFAULT_STATE.materials, 'cement', 4);
  assert.equal(cementCost, 4.5);

  // Slurry 1L cost: 3.17 / 6 = 0.528333...
  const slurryCost = calculateMaterialCost(DEFAULT_STATE.materials, 'slurry', 1.0);
  assert.ok(Math.abs(slurryCost - 3.17 / 6) < 0.001);

  const result = calculateProduct(paver, DEFAULT_STATE.materials, 10);
  // Subtotal = 4.50 + 2.64 + 1.38 + 0.528333 + 0.075 + 0.152 + 0.055 = 9.33033
  assert.ok(Math.abs(result.subtotal - 9.3303) < 0.002);
  // Maintenance 10%: 0.9330
  assert.ok(Math.abs(result.maintenance - 0.9330) < 0.002);
  // Freight 20%: 1.8661
  assert.ok(Math.abs(result.freight - 1.8661) < 0.002);
  // Batch total = 12.1294
  assert.ok(Math.abs(result.batch - 12.1294) < 0.005);
  // Unit cost for 10 pavers = 1.2129
  assert.ok(result.unit !== null);
  assert.ok(Math.abs((result.unit || 0) - 1.2129) < 0.002);
  // Profit = 2.00 - 1.2129 = 0.7871
  assert.ok(result.profit !== null);
  assert.ok(Math.abs((result.profit || 0) - 0.7871) < 0.002);
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

  // Cement 5L cost with 48L bag: 5 * (54 / 48) = 5.625
  const cementCost = calculateMaterialCost(DEFAULT_STATE.materials, 'cement', 5);
  assert.equal(cementCost, 5.625);

  // Slurry 1.2L cost: 1.2 * (3.17 / 6) = 0.634
  const slurryCost = calculateMaterialCost(DEFAULT_STATE.materials, 'slurry', 1.2);
  assert.ok(Math.abs(slurryCost - 0.634) < 0.001);

  const result = calculateProduct(pingadeira, DEFAULT_STATE.materials, 10);
  // Subtotal = 5.625 + 0.602 + 1.38 + 1.76 + 0.634 + 0.075 + 0.152 + 0.055 = 10.283
  assert.ok(Math.abs(result.subtotal - 10.283) < 0.002);
  // Maintenance 10% = 1.0283
  assert.ok(Math.abs(result.maintenance - 1.0283) < 0.002);
  // Freight 20% = 2.0566
  assert.ok(Math.abs(result.freight - 2.0566) < 0.002);
  // Batch total = 13.3679
  assert.ok(Math.abs(result.batch - 13.3679) < 0.005);
  // Unit cost for 4 units = 3.3420
  assert.ok(result.unit !== null);
  assert.ok(Math.abs((result.unit || 0) - 3.342) < 0.002);
  // Profit = 6.00 - 3.342 = 2.658
  assert.ok(result.profit !== null);
  assert.ok(Math.abs((result.profit || 0) - 2.658) < 0.002);
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
