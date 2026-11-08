import React from 'react';
import { AppState, ProductId, ProductionSim, SectionId } from '../../types';
import {
  calculateProduction,
  MATERIAL_IDS,
  MATERIAL_UNITS,
  PRODUCT_IDS,
} from '../../utils/calc';
import { brl, num } from '../../utils/format';
import { NumericInput } from '../NumericInput';
import { Info } from 'lucide-react';

interface ProductionSimViewProps {
  state: AppState;
  sim: ProductionSim;
  onUpdateSim: (partial: Partial<ProductionSim>) => void;
  onNavigate: (section: SectionId) => void;
}

export const ProductionSimView: React.FC<ProductionSimViewProps> = ({
  state,
  sim,
  onUpdateSim,
}) => {
  const selectedProduct = state.products[sim.id];
  const r = calculateProduction(
    sim,
    selectedProduct,
    state.materials,
    state.maintenancePercent
  );

  return (
    <div className="space-y-6">
      {/* Top Section: Scenario Planning & Simulation Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Scenario inputs */}
        <div className="lg:col-span-6 bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs space-y-5">
          <div>
            <h2 className="text-[17px] font-bold text-[#1a382d] tracking-tight">
              Planejar fabricação
            </h2>
            <p className="text-[12px] text-[#869c91] mt-0.5">
              Simule cenários sem modificar os valores já cadastrados.
            </p>
          </div>

          {/* Product selector */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-[#4c6257] block">
              Produto
            </label>
            <select
              value={sim.id}
              onChange={(e) => {
                onUpdateSim({
                  id: e.target.value as ProductId,
                  overrideBlocks: false,
                  overridePrice: false,
                  blocksOverride: null,
                  priceOverride: null,
                });
              }}
              className="w-full bg-white border border-[#dfe8e1] rounded-[9px] px-3 py-2 text-[13px] font-bold text-[#26483b] outline-none focus:border-[#20a67a] focus:ring-2 focus:ring-[#10b981]/20 cursor-pointer"
            >
              {PRODUCT_IDS.map((pid) => (
                <option key={pid} value={pid}>
                  {state.products[pid].name}
                </option>
              ))}
            </select>
          </div>

          {/* Batches per day & production days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-bold text-[#4c6257] block">
                Bateladas por dia
              </label>
              <NumericInput
                value={sim.batchDay}
                onChange={(val) => onUpdateSim({ batchDay: val ?? 1 })}
                isInteger={true}
                min={1}
                suffix="bateladas"
                ariaLabel="Bateladas por dia"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11.5px] font-bold text-[#4c6257] block">
                Dias de produção
              </label>
              <NumericInput
                value={sim.days}
                onChange={(val) => onUpdateSim({ days: val ?? 1 })}
                isInteger={true}
                min={1}
                suffix="dias"
                ariaLabel="Dias de produção"
              />
            </div>
          </div>

          {/* Yield and Sale Price overrides for simulation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-bold text-[#4c6257] block">
                Blocos por batelada (simulação)
              </label>
              <NumericInput
                value={r.yieldPerBatch}
                onChange={(val) =>
                  onUpdateSim({
                    blocksOverride: val,
                    overrideBlocks: true,
                  })
                }
                isInteger={true}
                min={1}
                suffix="blocos"
                placeholder="Informe"
                ariaLabel="Blocos por batelada na simulação"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11.5px] font-bold text-[#4c6257] block">
                Preço de venda (simulação)
              </label>
              <NumericInput
                value={r.salePrice}
                onChange={(val) =>
                  onUpdateSim({
                    priceOverride: val,
                    overridePrice: true,
                  })
                }
                prefix="R$"
                placeholder="Definir"
                ariaLabel="Preço de venda na simulação"
              />
            </div>
          </div>

          <div className="p-3 bg-[#f0f8f4] border border-[#e1efe6] rounded-xl flex items-center gap-2.5 text-[11px] text-[#638374]">
            <Info size={16} className="text-[#16805a] shrink-0" />
            <span>Para mudar a receita desta projeção, abra Simulador de venda.</span>
          </div>
        </div>

        {/* Right Column (6 cols): Simulation Results */}
        <div className="lg:col-span-6 bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs space-y-5">
          <div>
            <h2 className="text-[17px] font-bold text-[#1a382d] tracking-tight">
              Resultado da simulação
            </h2>
            <p className="text-[12px] text-[#869c91] mt-0.5">
              Projeção financeira baseada no cenário configurado
            </p>
          </div>

          {/* 4 KPIs grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f8faf8] border border-[#edf3ed] rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-medium text-[#7d9487]">
                Total de bateladas
              </span>
              <strong className="text-[20px] font-extrabold text-[#234b38]">
                {r.isValid ? num(r.totalBatches, 0) : '—'}
              </strong>
            </div>

            <div className="bg-[#f8faf8] border border-[#edf3ed] rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-medium text-[#7d9487]">
                Blocos produzidos
              </span>
              <strong className="text-[20px] font-extrabold text-[#234b38]">
                {r.totalBlocks !== null && r.isValid
                  ? `${num(r.totalBlocks, 0)}`
                  : 'A definir'}
              </strong>
            </div>

            <div className="bg-[#f8faf8] border border-[#edf3ed] rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-medium text-[#7d9487]">
                Custo de produção
              </span>
              <strong className="text-[20px] font-extrabold text-[#234b38]">
                {r.totalCost === null ? '—' : brl(r.totalCost)}
              </strong>
            </div>

            <div className="bg-[#f8faf8] border border-[#edf3ed] rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-medium text-[#7d9487]">
                Faturamento estimado
              </span>
              <strong className="text-[20px] font-extrabold text-[#234b38]">
                {r.totalRevenue === null ? 'A definir' : brl(r.totalRevenue)}
              </strong>
            </div>
          </div>

          {/* Projected Profit Highlight Panel */}
          <div className="rounded-2xl bg-[#f1faf4] border border-[#dff0e4] p-5 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#628771]">
              Lucro bruto projetado
            </span>
            <strong
              className={`text-[32px] font-black tracking-tight leading-none ${
                r.totalProfit === null
                  ? 'text-[#446654]'
                  : r.totalProfit >= 0
                  ? 'text-[#078353]'
                  : 'text-[#cc5252]'
              }`}
            >
              {r.totalProfit === null ? 'A definir' : brl(r.totalProfit)}
            </strong>
            <small className="text-[11px] text-[#7d9989]">
              {r.totalProfit === null
                ? 'Informe rendimento e preço para calcular o lucro.'
                : 'Estimativa considerando os custos cadastrados.'}
            </small>
          </div>
        </div>
      </div>

      {/* Bottom Table Card: Material Consumption */}
      <div className="bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs">
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-[#1a382d] tracking-tight">
            Consumo estimado de materiais
          </h2>
          <p className="text-[12px] text-[#869c91] mt-0.5">
            Para {num(r.totalBatches, 0)} bateladas no período informado
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#edf1ee]">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#f8faf8] border-b border-[#edf1ee] text-[#8ca094] text-[10.5px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Material</th>
                <th className="py-3 px-4 text-right">Por batelada</th>
                <th className="py-3 px-4 text-right">Total no período</th>
                <th className="py-3 px-4 text-right">Custo no período</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3f1]">
              {r.calc.lines.map((l) => (
                <tr key={l.id} className="hover:bg-[#fafcfa]">
                  <td className="py-3 px-4 font-semibold text-[#375243]">
                    {state.materials[l.id].name}
                  </td>
                  <td className="py-3 px-4 text-right text-[#577264]">
                    {num(l.amount, 3)} {MATERIAL_UNITS[l.id]}
                  </td>
                  <td className="py-3 px-4 text-right text-[#577264]">
                    {r.isValid
                      ? `${num(l.amount * r.totalBatches, 3)} ${MATERIAL_UNITS[l.id]}`
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-[#2d4d3e]">
                    {r.isValid ? brl(l.cost * r.totalBatches) : '—'}
                  </td>
                </tr>
              ))}
              <tr className="bg-[#fcfdfc] font-bold text-[#446251]">
                <td className="py-3 px-4">Manutenção, frete e custos adicionais</td>
                <td className="py-3 px-4 text-right">
                  {brl(r.calc.maintenance + r.calc.freight + r.product.extraCost)}
                </td>
                <td className="py-3 px-4 text-right text-[#889d91]">—</td>
                <td className="py-3 px-4 text-right text-[#177a54]">
                  {r.isValid
                    ? brl((r.calc.maintenance + r.calc.freight + r.product.extraCost) * r.totalBatches)
                    : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3.5 border-t border-[#edf2ee] text-[11px] text-[#98a59d]">
          Cimento:{' '}
          {r.isValid && r.cementBags !== null
            ? `${num(r.cementBags, 2)} saco(s) equivalentes de ${num(
                state.materials.cement.packQty
              )} kg, conforme consumo e rendimento.`
            : '—'}
        </div>
      </div>
    </div>
  );
};
