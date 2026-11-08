import React from 'react';
import {
  AppState,
  MaterialId,
  ProductId,
} from '../../types';
import {
  calculateMaterialCost,
  calculateProduct,
  MATERIAL_IDS,
  MATERIAL_UNITS,
  PRODUCT_IDS,
} from '../../utils/calc';
import { brl, brl4, num, pct } from '../../utils/format';
import { NumericInput } from '../NumericInput';
import { Box, TrendingUp, Info, Sparkles } from 'lucide-react';
import { RichButton } from '@/registry/spell-ui/rich-button';

interface SalesSimulatorViewProps {
  state: AppState;
  selectedProductId: ProductId;
  onSelectProduct: (id: ProductId) => void;
  onUpdateProduct: (
    id: ProductId,
    field: 'blocksPerBatch' | 'salePrice' | 'extraCost' | 'freightPercent',
    value: number | null
  ) => void;
  onUpdateRecipe: (
    productId: ProductId,
    materialId: MaterialId,
    amount: number | null
  ) => void;
}

export const SalesSimulatorView: React.FC<SalesSimulatorViewProps> = ({
  state,
  selectedProductId,
  onSelectProduct,
  onUpdateProduct,
  onUpdateRecipe,
}) => {
  const currentProduct = state.products[selectedProductId];
  const calc = calculateProduct(
    currentProduct,
    state.materials,
    state.maintenancePercent
  );

  const maxSliderPrice = Math.max(
    8,
    Math.ceil((currentProduct.salePrice || 0) + 1)
  );

  return (
    <div className="space-y-6">
      {/* Product tabs */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {PRODUCT_IDS.map((pid) => {
          const p = state.products[pid];
          const isSelected = pid === selectedProductId;
          const isPending = p.blocksPerBatch === null;
          return (
            <RichButton
              key={pid}
              color={isSelected ? 'emerald' : 'zinc'}
              onClick={() => onSelectProduct(pid)}
              className="text-[12.5px] rounded-xl px-4 py-2.5 shadow-sm"
            >
              <Box size={16} />
              <span>{p.name}</span>
              {isPending && (
                <span
                  title="Rendimento pendente"
                  className="w-2 h-2 rounded-full bg-[#f59e0b] ring-1 ring-white"
                />
              )}
            </RichButton>
          );
        })}
      </div>

      {/* Main Grid: Simulator in primary/highlighted position + Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Sales Price Simulator (Highlighted) */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#1a382d] tracking-tight">
                  Simulador de preço de venda
                </h2>
                <p className="text-[12px] text-[#869c91] mt-1">
                  Ajuste a barra e veja o lucro em tempo real.
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#ecf8f1] border border-[#d6ede0] text-[#0b7759] flex items-center justify-center shrink-0">
                <TrendingUp size={18} />
              </div>
            </div>

            {/* Sale Price Input */}
            <div className="flex items-center justify-between gap-3 mt-4 mb-4">
              <span className="text-[12px] font-bold text-[#446253]">
                Preço de venda por bloco
              </span>
              <div className="w-40">
                <NumericInput
                  value={currentProduct.salePrice}
                  onChange={(val) => onUpdateProduct(selectedProductId, 'salePrice', val)}
                  prefix="R$"
                  placeholder="Definir preço"
                  ariaLabel="Preço de venda por bloco"
                  className="bg-[#f7faf7] border-[#d8e6dc] min-h-[46px]"
                  inputClassName="text-right text-[18px] font-extrabold text-[#153f32]"
                />
              </div>
            </div>

            {/* Range Slider */}
            <div className="space-y-2 mt-2">
              <input
                type="range"
                min="0"
                max={maxSliderPrice}
                step="0.01"
                value={currentProduct.salePrice ?? 0}
                onChange={(e) =>
                  onUpdateProduct(
                    selectedProductId,
                    'salePrice',
                    Number(e.target.value)
                  )
                }
                aria-label={`Ajustar preço de venda de ${currentProduct.name}`}
                className="w-full h-2 bg-[#e4ede7] rounded-lg appearance-none cursor-pointer accent-[#0c8d60]"
              />
              <div className="flex justify-between items-center text-[10px] text-[#9bb0a4] font-medium px-0.5">
                <span>R$ 0,00</span>
                <span className="hidden sm:inline text-[#7a9486]">
                  Arraste para ajustar o lucro
                </span>
                <span>{brl(maxSliderPrice)}</span>
              </div>
            </div>

            {/* Dynamic Profit Content */}
            <div className="mt-6 pt-5 border-t border-[#edf2ee]">
              {calc.unit === null || currentProduct.salePrice === null ? (
                <div className="bg-[#f9faf8] border border-[#eaf0eb] rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 text-[#8da49a]">
                  <Info size={24} className="text-[#a4b5ad]" />
                  <strong className="text-[13px] font-bold text-[#426553]">
                    {calc.unit === null
                      ? 'Rendimento não informado'
                      : 'Preço de venda não informado'}
                  </strong>
                  <p className="text-[11.5px] max-w-[280px] leading-relaxed">
                    {calc.unit === null
                      ? 'Informe a quantidade de blocos por batelada para calcular o custo e o lucro.'
                      : 'Arraste a barra ou digite um preço para calcular o lucro.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Two Main Profit KPIs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#f8fcf9] border border-[#e4f0e8] rounded-xl p-3.5 flex flex-col gap-1">
                      <span className="text-[11px] font-medium text-[#7d9689]">
                        Lucro bruto por bloco
                      </span>
                      <strong
                        className={`text-[20px] font-black tracking-tight leading-none ${
                          (calc.profit || 0) >= 0 ? 'text-[#078353]' : 'text-[#cc5252]'
                        }`}
                      >
                        {brl(calc.profit)}
                      </strong>
                    </div>

                    <div className="bg-[#f8fcf9] border border-[#e4f0e8] rounded-xl p-3.5 flex flex-col gap-1">
                      <span className="text-[11px] font-medium text-[#7d9689]">
                        Lucro por 1.000 blocos
                      </span>
                      <strong
                        className={`text-[20px] font-black tracking-tight leading-none ${
                          (calc.profit || 0) >= 0 ? 'text-[#078353]' : 'text-[#cc5252]'
                        }`}
                      >
                        {brl((calc.profit || 0) * 1000)}
                      </strong>
                    </div>
                  </div>

                  {/* Summary Stats Grid */}
                  <div className="bg-[#f7faf7] border border-[#edf3ed] rounded-xl p-4 space-y-2.5 text-[11px]">
                    <div className="flex justify-between items-center text-[#7d9487]">
                      <span>Custo por bloco</span>
                      <strong className="text-[12.5px] font-bold text-[#274b3b]">
                        {brl4(calc.unit)}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-[#7d9487]">
                      <span>Margem bruta</span>
                      <strong
                        className={`text-[12.5px] font-extrabold ${
                          (calc.margin || 0) >= 0 ? 'text-[#078353]' : 'text-[#cc5252]'
                        }`}
                      >
                        {pct(calc.margin)}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-[#7d9487]">
                      <span>Preço mínimo de equilíbrio</span>
                      <strong className="text-[12.5px] font-bold text-[#274b3b]">
                        {brl(calc.unit)}
                      </strong>
                    </div>
                  </div>

                  {/* Projection by quantity table */}
                  <div>
                    <h3 className="text-[12px] font-bold text-[#3d594b] mb-2.5">
                      Projeção por quantidade vendida
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-[#edf1ee]">
                      <table className="w-full text-[11.5px]">
                        <thead>
                          <tr className="bg-[#f8faf8] border-b border-[#edf1ee] text-[#8ca094] text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3 text-left">Quantidade</th>
                            <th className="py-2.5 px-3 text-right">Faturamento</th>
                            <th className="py-2.5 px-3 text-right">Lucro bruto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f2f5f3]">
                          {[100, 500, 1000, 5000].map((qty) => (
                            <tr key={qty} className="hover:bg-[#fbfcfb]">
                              <td className="py-2 px-3 font-semibold text-[#4e685a]">
                                {num(qty, 0)} blocos
                              </td>
                              <td className="py-2 px-3 text-right font-medium text-[#4e685a]">
                                {brl(qty * (currentProduct.salePrice || 0))}
                              </td>
                              <td
                                className={`py-2 px-3 text-right font-bold ${
                                  (calc.profit || 0) >= 0
                                    ? 'text-[#078353]'
                                    : 'text-[#cc5252]'
                                }`}
                              >
                                {brl(qty * (calc.profit || 0))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 text-[10.5px] text-[#9bb0a5] leading-relaxed pt-3 border-t border-[#f2f6f3]">
              Lucro bruto estimado, sem despesas não cadastradas (mão de obra, frete, impostos e perdas).
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Configuration & Recipe */}
        <div className="lg:col-span-6 space-y-6">
          {/* Production Configuration Card */}
          <div className="bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-[17px] font-bold text-[#1a382d] tracking-tight">
                  Configuração da produção
                </h2>
                <p className="text-[12px] text-[#869c91] mt-1">
                  {currentProduct.name}: dados editáveis e salvos automaticamente
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold bg-[#eff6f1] text-[#2c775a] border border-[#e0f0e6]">
                {currentProduct.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11.5px] font-bold text-[#4c6257] block">
                  Produzidos por batelada
                </label>
                <NumericInput
                  value={currentProduct.blocksPerBatch}
                  onChange={(val) => onUpdateProduct(selectedProductId, 'blocksPerBatch', val)}
                  isInteger={true}
                  suffix="unid"
                  placeholder="Informe"
                  ariaLabel="Blocos produzidos por batelada"
                />
                <p className="text-[10px] text-[#91a49a] leading-tight">
                  Altere livremente.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11.5px] font-bold text-[#4c6257] block">
                  Frete (%)
                </label>
                <NumericInput
                  value={currentProduct.freightPercent ?? 0}
                  onChange={(val) => onUpdateProduct(selectedProductId, 'freightPercent', val ?? 0)}
                  suffix="%"
                  placeholder="0"
                  ariaLabel="Percentual de frete"
                />
                <p className="text-[10px] text-[#91a49a] leading-tight">
                  {(currentProduct.freightPercent ?? 0) > 0
                    ? `${num(currentProduct.freightPercent ?? 0)}% sobre o subtotal`
                    : 'Sem taxa de frete'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11.5px] font-bold text-[#4c6257] block">
                  Custos adicionais
                </label>
                <NumericInput
                  value={currentProduct.extraCost}
                  onChange={(val) => onUpdateProduct(selectedProductId, 'extraCost', val ?? 0)}
                  prefix="R$"
                  placeholder="0,00"
                  ariaLabel="Custos adicionais por batelada"
                />
                <p className="text-[10px] text-[#91a49a] leading-tight">
                  Por batelada, antes da manutenção.
                </p>
              </div>
            </div>

            {/* Cost Strip */}
            <div className="mt-5 p-4 rounded-xl bg-[#f8fcf9] border border-[#e4efe7] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10.5px] font-medium text-[#8ba195]">
                  Custo total da batelada
                </span>
                <strong className="text-[16px] font-extrabold text-[#194b38]">
                  {brl(calc.batch)}
                </strong>
              </div>

              <div className="flex flex-col">
                <span className="text-[10.5px] font-medium text-[#8ba195]">
                  Rendimento
                </span>
                <strong className="text-[16px] font-extrabold text-[#194b38]">
                  {currentProduct.blocksPerBatch === null
                    ? 'Não informado'
                    : `${num(currentProduct.blocksPerBatch, 0)} blocos`}
                </strong>
              </div>
            </div>
          </div>

          {/* Recipe of this batch */}
          <div className="bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-[17px] font-bold text-[#1a382d] tracking-tight">
                  Receita desta batelada
                </h2>
                <p className="text-[12px] text-[#869c91] mt-1">
                  Modifique o consumo dos materiais apenas para {currentProduct.name.toLowerCase()}.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#f6faf7] text-[#557867] border border-[#e2ece5]">
                <Sparkles size={12} className="text-[#109569]" />
                <span>Editável</span>
              </span>
            </div>

            <div className="divide-y divide-[#f0f4f1]">
              {MATERIAL_IDS.map((mid) => {
                const mat = state.materials[mid];
                const amount = currentProduct.recipe[mid] ?? 0;
                const cost = calculateMaterialCost(state.materials, mid, amount);

                return (
                  <div
                    key={mid}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <strong className="text-[12.5px] font-bold text-[#344d40] block">
                        {mat.name}
                      </strong>
                      <span className="text-[10px] text-[#9caaa2]">
                        {mid === 'cement'
                          ? 'Volume; custo calculado pelo rendimento do saco'
                          : mid === 'slurry'
                          ? selectedProductId === 'paver16'
                            ? '100 ml por paver (1 L por batelada de 10)'
                            : selectedProductId === 'pingadeira'
                            ? '300 ml por pingadeira (1,2 L por batelada de 4)'
                            : 'Preparo: 2L pó + 2L areia + 2,5L água (rendimento 6,5 L)'
                          : `Consumo em ${MATERIAL_UNITS[mid]}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-32 sm:w-36">
                        <NumericInput
                          value={amount}
                          onChange={(val) => onUpdateRecipe(selectedProductId, mid, val ?? 0)}
                          suffix={MATERIAL_UNITS[mid]}
                          ariaLabel={`Consumo de ${mat.name}`}
                          className="min-h-[36px]"
                          inputClassName="text-[12px] py-1.5"
                        />
                      </div>

                      <div className="w-20 text-right">
                        <strong className="text-[12.5px] font-bold text-[#577566]">
                          {brl(cost)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cost Summary Box */}
            <div className="mt-5 pt-4 border-t border-[#edf2ef] space-y-2 text-[12px] text-[#6d8478]">
              <div className="flex justify-between items-center">
                <span>Subtotal + adicional</span>
                <strong className="text-[#3d5949] font-bold">
                  {brl(calc.subtotal)}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Manutenção ({num(state.maintenancePercent)}%)</span>
                <strong className="text-[#3d5949] font-bold">
                  {brl(calc.maintenance)}
                </strong>
              </div>
              {(currentProduct.freightPercent ?? 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span>Frete ({num(currentProduct.freightPercent ?? 0)}%)</span>
                  <strong className="text-[#3d5949] font-bold">
                    {brl(calc.freight)}
                  </strong>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-[#e8eeea] text-[13px] text-[#244b39] font-bold">
                <span>Total por batelada</span>
                <strong className="text-[18px] font-extrabold text-[#067b52]">
                  {brl(calc.batch)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
