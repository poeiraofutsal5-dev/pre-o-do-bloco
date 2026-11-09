import {
  AppState,
  MaterialCostLine,
  MaterialId,
  Product,
  ProductCalcResult,
  ProductId,
  ProductionCalcResult,
  ProductionSim,
} from '../types';

export const MATERIAL_IDS: MaterialId[] = [
  'cement',
  'gravel0',
  'powder',
  'sand',
  'slurry',
  'additive',
  'energy',
  'grease',
  'water',
];

export const PRODUCT_IDS: ProductId[] = [
  'bloco14',
  'canaleta',
  'bloco9',
  'paver16',
  'pingadeira',
];

export const MATERIAL_UNITS: Record<MaterialId, string> = {
  cement: 'litros',
  gravel0: 'litros',
  powder: 'litros',
  sand: 'litros',
  slurry: 'litros',
  additive: 'g',
  energy: 'kWh',
  grease: 'g',
  water: 'litros',
};

export const DEFAULT_RECIPE: Record<MaterialId, number> = {
  cement: 48 / 7, // ~6,857 L por traço (7 traços por saco de 48 L)
  gravel0: 0,
  powder: 12,
  sand: 36,
  slurry: 0,
  additive: 2.5,
  energy: 0.152,
  grease: 11,
  water: 0,
};

export const DEFAULT_STATE: AppState = {
  materials: {
    cement: {
      id: 'cement',
      name: 'Cimento CP-V',
      price: 54,
      packQty: 48,
      packUnit: 'litros',
      batchesPerPack: 7,
    },
    gravel0: {
      id: 'gravel0',
      name: 'Brita 0',
      price: 220,
      packQty: 1,
      packUnit: 'm3',
    },
    powder: {
      id: 'powder',
      name: 'Pó de pedra',
      price: 115,
      packQty: 1,
      packUnit: 'm3',
    },
    sand: {
      id: 'sand',
      name: 'Areia grossa',
      price: 86,
      packQty: 1,
      packUnit: 'm3',
    },
    slurry: {
      id: 'slurry',
      name: 'Nata de cimento',
      price: 3.17,
      packQty: 6,
      packUnit: 'litros',
    },
    additive: {
      id: 'additive',
      name: 'Aditivo',
      price: 300,
      packQty: 10,
      packUnit: 'kg',
    },
    energy: {
      id: 'energy',
      name: 'Energia elétrica',
      price: 50,
      packQty: 50,
      packUnit: 'kWh',
    },
    grease: {
      id: 'grease',
      name: 'Graxa',
      price: 50,
      packQty: 10,
      packUnit: 'kg',
    },
    water: {
      id: 'water',
      name: 'Água',
      price: 0,
      packQty: 1,
      packUnit: 'm3',
    },
  },
  maintenancePercent: 10,
  products: {
    bloco14: {
      id: 'bloco14',
      name: 'Bloco de 14',
      label: '14 × 19 × 39',
      blocksPerBatch: 9,
      salePrice: 3.6,
      extraCost: 0,
      freightPercent: 0,
      recipe: { ...DEFAULT_RECIPE },
    },
    canaleta: {
      id: 'canaleta',
      name: 'Bloco Canaleta',
      label: 'Canaleta de 14 · 6 traços/saco',
      blocksPerBatch: 9,
      salePrice: 3.6,
      extraCost: 0,
      freightPercent: 0,
      cementBatchesPerPack: 6,
      recipe: {
        ...DEFAULT_RECIPE,
        cement: 8, // 48 L / 6 traços = 8 L
      },
    },
    bloco9: {
      id: 'bloco9',
      name: 'Bloco de 9',
      label: '9 × 19 × 39',
      blocksPerBatch: 10,
      salePrice: 2.8,
      extraCost: 0,
      freightPercent: 0,
      recipe: { ...DEFAULT_RECIPE },
    },
    paver16: {
      id: 'paver16',
      name: 'Paver Paviesse (16 faces)',
      label: '16 faces · Traço 3×3×1',
      blocksPerBatch: 10,
      salePrice: 2.0,
      extraCost: 0,
      freightPercent: 20,
      recipe: {
        ...DEFAULT_RECIPE,
        cement: 4,
        gravel0: 12,
        powder: 12,
        sand: 0,
        slurry: 1.0, // 100 ml por paver × 10 pavers = 1000 ml = 1,0 L
      },
    },
    pingadeira: {
      id: 'pingadeira',
      name: 'Pingadeira',
      label: 'Traço 5×1',
      blocksPerBatch: 4,
      salePrice: 6.0,
      extraCost: 0,
      freightPercent: 20,
      recipe: {
        ...DEFAULT_RECIPE,
        cement: 5,
        sand: 7,
        powder: 12,
        gravel0: 8,
        slurry: 1.2, // 300 ml por pingadeira × 4 pingadeiras = 1200 ml = 1,2 L
      },
    },
  },
};

export const DEFAULT_SIM: ProductionSim = {
  id: 'bloco14',
  batchDay: 8,
  days: 22,
  blocksOverride: null,
  priceOverride: null,
  overrideBlocks: false,
  overridePrice: false,
};

export const STORAGE_KEY = 'fabricablocos-v1';

export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export const isPositive = (v: number | null | undefined): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0;

export const isNonNegative = (v: number | null | undefined): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;

export const unitMultiplier = (unit: string): number => {
  if (unit === 'm3' || unit === 'kg') return 1000;
  return 1;
};

/**
 * Calculates the exact cost of a material given its consumption in a batch
 */
export function calculateMaterialCost(
  materials: AppState['materials'],
  id: MaterialId,
  amount: number,
  productCementBatches?: number
): number {
  const m = materials[id];
  if (!m) return 0;
  if (id === 'cement') {
    const sackLiters = m.packQty && m.packQty > 0 ? m.packQty : 48;
    if (productCementBatches && productCementBatches > 0) {
      return m.price / productCementBatches;
    }
    return (m.price / sackLiters) * amount;
  }
  const packSize = m.packQty * unitMultiplier(m.packUnit);
  if (packSize <= 0) return 0;
  return (m.price * amount) / packSize;
}

/**
 * Calculates batch, unit, profit and margin metrics for a product
 */
export function calculateProduct(
  product: Product,
  materials: AppState['materials'],
  maintenancePercent: number
): ProductCalcResult {
  const lines: MaterialCostLine[] = MATERIAL_IDS.map((mid) => {
    const amount = product.recipe[mid] ?? 0;
    return {
      id: mid,
      amount,
      cost: calculateMaterialCost(materials, mid, amount, product.cementBatchesPerPack),
    };
  });

  const subtotal =
    lines.reduce((acc, line) => acc + line.cost, 0) + (product.extraCost || 0);
  const maintenance = (subtotal * (maintenancePercent || 0)) / 100;
  const freight = (subtotal * (product.freightPercent || 0)) / 100;
  const batch = subtotal + maintenance + freight;

  const unit =
    isPositive(product.blocksPerBatch)
      ? batch / product.blocksPerBatch
      : null;

  const profit =
    unit !== null && product.salePrice !== null
      ? product.salePrice - unit
      : null;

  const margin =
    profit !== null && isPositive(product.salePrice)
      ? (profit / product.salePrice) * 100
      : null;

  return {
    lines,
    subtotal,
    maintenance,
    freight,
    batch,
    unit,
    profit,
    margin,
  };
}

/**
 * Calculates scenario planning for factory production
 */
export function calculateProduction(
  sim: ProductionSim,
  product: Product,
  materials: AppState['materials'],
  maintenancePercent: number
): ProductionCalcResult {
  const calc = calculateProduct(product, materials, maintenancePercent);

  const yieldPerBatch = sim.overrideBlocks
    ? sim.blocksOverride
    : product.blocksPerBatch;

  const salePrice = sim.overridePrice
    ? sim.priceOverride
    : product.salePrice;

  const isValid =
    isPositive(sim.batchDay) &&
    Number.isInteger(sim.batchDay) &&
    isPositive(sim.days) &&
    Number.isInteger(sim.days);

  const totalBatches = isValid ? sim.batchDay * sim.days : 0;
  const totalBlocks = isPositive(yieldPerBatch) && isValid ? totalBatches * yieldPerBatch : null;
  const totalCost = isValid ? totalBatches * calc.batch : null;
  const totalRevenue =
    totalBlocks !== null && salePrice !== null && isValid
      ? totalBlocks * salePrice
      : null;
  const totalProfit =
    totalRevenue !== null && totalCost !== null
      ? totalRevenue - totalCost
      : null;

  const sackLiters = materials.cement.packQty || 48;
  const cementUsagePerBatch =
    product.cementBatchesPerPack && product.cementBatchesPerPack > 0
      ? sackLiters / product.cementBatchesPerPack
      : product.recipe.cement ?? (sackLiters / 7);
  const cementBags =
    isValid && sackLiters > 0
      ? (totalBatches * cementUsagePerBatch) / sackLiters
      : null;

  return {
    product,
    calc,
    yieldPerBatch,
    salePrice,
    isValid,
    totalBatches,
    totalBlocks,
    totalCost,
    totalRevenue,
    totalProfit,
    cementBags,
  };
}

/**
 * Loads state from localStorage with migration and boundary safeguards
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.products || !parsed.materials) {
      return clone(DEFAULT_STATE);
    }
    const out = clone(DEFAULT_STATE);

    MATERIAL_IDS.forEach((id) => {
      const m = parsed.materials?.[id];
      if (!m) return;
      if (id === 'slurry' && (m.price === 0.4 || m.price === 0.402 || m.packQty === 6.5)) {
        out.materials.slurry.price = 3.17;
        out.materials.slurry.packQty = 6;
      } else {
        if (isNonNegative(m.price)) out.materials[id].price = m.price;
        if (isPositive(m.packQty)) out.materials[id].packQty = m.packQty;
      }
      if (id === 'cement') {
        if (m.packQty === 50 || m.packUnit === 'kg' || !m.packQty) {
          out.materials.cement.packQty = 48;
          out.materials.cement.packUnit = 'litros';
        } else if (isPositive(m.packQty)) {
          out.materials.cement.packQty = m.packQty;
        }
        if (m.batchesPerPack === 8 || !m.batchesPerPack) {
          out.materials[id].batchesPerPack = 7;
        } else if (isPositive(m.batchesPerPack)) {
          out.materials[id].batchesPerPack = m.batchesPerPack;
        }
      }
    });

    if (isNonNegative(parsed.maintenancePercent)) {
      out.maintenancePercent = parsed.maintenancePercent;
    }

    PRODUCT_IDS.forEach((id) => {
      const p = parsed.products?.[id];
      if (!p) return;
      if (id === 'bloco14' && p.blocksPerBatch === 8) {
        out.products[id].blocksPerBatch = 9;
      } else if (id === 'canaleta' && (p.blocksPerBatch === 8 || p.blocksPerBatch === null)) {
        out.products[id].blocksPerBatch = 9;
      } else if (
        p.blocksPerBatch === null ||
        (Number.isInteger(p.blocksPerBatch) && isPositive(p.blocksPerBatch))
      ) {
        out.products[id].blocksPerBatch = p.blocksPerBatch;
      }

      if (id === 'canaleta') {
        if (
          p.cementBatchesPerPack === undefined ||
          p.cementBatchesPerPack === null ||
          p.cementBatchesPerPack === 7 ||
          p.cementBatchesPerPack === 8
        ) {
          out.products[id].cementBatchesPerPack = 6;
        } else if (isPositive(p.cementBatchesPerPack)) {
          out.products[id].cementBatchesPerPack = p.cementBatchesPerPack;
        }
      } else if (isPositive(p.cementBatchesPerPack)) {
        out.products[id].cementBatchesPerPack = p.cementBatchesPerPack;
      }

      if (id === 'bloco9' && (p.blocksPerBatch === null || p.blocksPerBatch === 8)) {
        out.products[id].blocksPerBatch = 10;
        if (p.salePrice === null || !isNonNegative(p.salePrice)) {
          out.products[id].salePrice = 2.8;
        }
      } else if (p.salePrice === null || isNonNegative(p.salePrice)) {
        out.products[id].salePrice = p.salePrice;
      }
      if (isNonNegative(p.extraCost)) {
        out.products[id].extraCost = p.extraCost;
      }
      if (isNonNegative(p.freightPercent)) {
        out.products[id].freightPercent = p.freightPercent;
      } else if (id === 'paver16' || id === 'pingadeira') {
        out.products[id].freightPercent = 20;
      } else {
        out.products[id].freightPercent = 0;
      }
      MATERIAL_IDS.forEach((mid) => {
        if (isNonNegative(p.recipe?.[mid])) {
          if (mid === 'cement' && p.recipe[mid] === 6) {
            if (id === 'canaleta') out.products[id].recipe[mid] = 8;
            else if (id === 'bloco14' || id === 'bloco9') out.products[id].recipe[mid] = 48 / 7;
            else out.products[id].recipe[mid] = p.recipe[mid];
          } else {
            out.products[id].recipe[mid] = p.recipe[mid];
          }
        } else if (mid === 'slurry') {
          if (id === 'paver16') out.products[id].recipe.slurry = 1.0;
          else if (id === 'pingadeira') out.products[id].recipe.slurry = 1.2;
          else out.products[id].recipe.slurry = 0;
        }
      });
    });

    return out;
  } catch {
    return clone(DEFAULT_STATE);
  }
}

/**
 * Saves state to localStorage safely
 */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silently catch quota or security issues
  }
}

/**
 * Generates formatted Brazilian CSV text
 */
export function generateCsv(state: AppState, sim: ProductionSim): string {
  const rows: (string | number)[][] = [
    ['TIPO', 'NOME', 'CAMPO', 'VALOR', 'UNIDADE'],
  ];

  MATERIAL_IDS.forEach((id) => {
    const m = state.materials[id];
    rows.push(['Material', m.name, 'Preço', m.price, 'R$']);
    rows.push([
      'Material',
      m.name,
      'Quantidade da embalagem',
      m.packQty,
      m.packUnit,
    ]);
    if (id === 'cement' && m.batchesPerPack) {
      rows.push([
        'Material',
        m.name,
        'Bateladas por saco',
        m.batchesPerPack,
        'bateladas',
      ]);
    }
  });

  rows.push([
    'Configuração',
    'Manutenção',
    'Percentual',
    state.maintenancePercent,
    '%',
  ]);

  PRODUCT_IDS.forEach((id) => {
    const p = state.products[id];
    const c = calculateProduct(p, state.materials, state.maintenancePercent);
    rows.push([
      'Produto',
      p.name,
      'Blocos por batelada',
      p.blocksPerBatch ?? '',
      'blocos',
    ]);
    if (p.cementBatchesPerPack) {
      rows.push([
        'Produto',
        p.name,
        'Rendimento do cimento',
        p.cementBatchesPerPack,
        'traços/saco',
      ]);
    }
    rows.push([
      'Produto',
      p.name,
      'Preço de venda',
      p.salePrice ?? '',
      'R$',
    ]);
    rows.push(['Produto', p.name, 'Frete', p.freightPercent ?? 0, '%']);
    rows.push(['Produto', p.name, 'Custo de frete por batelada', c.freight, 'R$']);
    rows.push(['Produto', p.name, 'Custo por batelada', c.batch, 'R$']);
    rows.push(['Produto', p.name, 'Custo por bloco', c.unit ?? '', 'R$']);
    rows.push(['Produto', p.name, 'Lucro por bloco', c.profit ?? '', 'R$']);
    rows.push(['Produto', p.name, 'Margem', c.margin ?? '', '%']);
    rows.push(['Produto', p.name, 'Custos adicionais', p.extraCost, 'R$']);

    MATERIAL_IDS.forEach((mid) => {
      rows.push([
        'Receita',
        p.name,
        state.materials[mid].name,
        p.recipe[mid],
        MATERIAL_UNITS[mid],
      ]);
    });
  });

  const simProd = state.products[sim.id];
  const r = calculateProduction(
    sim,
    simProd,
    state.materials,
    state.maintenancePercent
  );

  rows.push(['Simulação', r.product.name, 'Bateladas por dia', sim.batchDay ?? '', 'bateladas']);
  rows.push(['Simulação', r.product.name, 'Dias de produção', sim.days ?? '', 'dias']);
  rows.push(['Simulação', r.product.name, 'Blocos por batelada', r.yieldPerBatch ?? '', 'blocos']);
  rows.push(['Simulação', r.product.name, 'Preço', r.salePrice ?? '', 'R$']);
  rows.push(['Simulação', r.product.name, 'Total de blocos', r.totalBlocks ?? '', 'blocos']);
  rows.push(['Simulação', r.product.name, 'Custo total', r.totalCost ?? '', 'R$']);
  rows.push(['Simulação', r.product.name, 'Receita', r.totalRevenue ?? '', 'R$']);
  rows.push(['Simulação', r.product.name, 'Lucro', r.totalProfit ?? '', 'R$']);

  return (
    '\ufeff' +
    rows
      .map((row) =>
        row
          .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
          .join(';')
      )
      .join('\r\n')
  );
}
