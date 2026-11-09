export type MaterialId =
  | 'cement'
  | 'gravel0'
  | 'powder'
  | 'sand'
  | 'slurry'
  | 'additive'
  | 'energy'
  | 'grease'
  | 'water';

export type ProductId =
  | 'bloco14'
  | 'canaleta'
  | 'bloco9'
  | 'paver16'
  | 'pingadeira';

export type SectionId =
  | 'inicio'
  | 'produtos'
  | 'materiais'
  | 'producao'
  | 'comparativo';

export interface Material {
  id: MaterialId;
  name: string;
  price: number;
  packQty: number;
  packUnit: 'kg' | 'm3' | 'kWh' | 'litros';
  batchesPerPack?: number; // specific to cement
}

export type RecipeMap = Record<MaterialId, number>;

export interface Product {
  id: ProductId;
  name: string;
  label: string;
  blocksPerBatch: number | null;
  salePrice: number | null;
  extraCost: number;
  freightPercent?: number;
  cementBatchesPerPack?: number;
  recipe: RecipeMap;
}

export interface AppState {
  materials: Record<MaterialId, Material>;
  maintenancePercent: number;
  products: Record<ProductId, Product>;
}

export interface ProductionSim {
  id: ProductId;
  batchDay: number;
  days: number;
  blocksOverride: number | null;
  priceOverride: number | null;
  overrideBlocks: boolean;
  overridePrice: boolean;
}

export interface MaterialCostLine {
  id: MaterialId;
  amount: number;
  cost: number;
}

export interface ProductCalcResult {
  lines: MaterialCostLine[];
  subtotal: number;
  maintenance: number;
  freight: number;
  batch: number;
  unit: number | null;
  profit: number | null;
  margin: number | null;
}

export interface ProductionCalcResult {
  product: Product;
  calc: ProductCalcResult;
  yieldPerBatch: number | null;
  salePrice: number | null;
  isValid: boolean;
  totalBatches: number;
  totalBlocks: number | null;
  totalCost: number | null;
  totalRevenue: number | null;
  totalProfit: number | null;
  cementBags: number | null;
}
